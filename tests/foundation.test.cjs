const test=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {createApp}=require('../apps/api/server.cjs');
const {hashPassword,verifyPassword}=require('../apps/api/auth.cjs');
const {nextState}=require('../packages/domain/job-workflow.cjs');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {openDatabase}=require('../apps/api/database.cjs');
test('authenticated foundation: tenancy, workflow, persistence, replay and audit',async t=>{
  const app=createApp({filename:':memory:'});const db=app.db;
  const password=' Test-only password 123! ';
  const encoded=await hashPassword(password);
  const org1=randomUUID(),org2=randomUUID();
  db.prepare('INSERT INTO organisations VALUES (?,?)').run(org1,'Test One');db.prepare('INSERT INTO organisations VALUES (?,?)').run(org2,'Test Two');
  const users={};
  for(const [name,role,org]of [['admin','admin',org1],['dispatch','dispatcher',org1],['driver','driver',org1],['otherDriver','driver',org1],['foreignAdmin','admin',org2]]){
    const id=randomUUID();users[name]=id;
    db.prepare('INSERT INTO users (id,organisation_id,email,name,role,password_hash) VALUES (?,?,?,?,?,?)').run(id,org,`${name}@test.invalid`,name,role,encoded);
  }
  const customer=randomUUID(),policy=randomUUID();
  db.prepare('INSERT INTO customers VALUES (?,?,?)').run(customer,org1,'Test Customer');
  db.prepare('INSERT INTO pod_policies VALUES (?,?,?,?,?)').run(policy,org1,'Test POD',1,'{"photo":true}');
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+app.server.address().port;
  const cookies={};
  async function call(route,{role='admin',method='GET',body,key,headers={}}={}){
    const response=await fetch(url+'/api/v1'+route,{method,headers:{'X-RushIT-Client':'web',...(cookies[role]?{Cookie:cookies[role]}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{}),...(key?{'Idempotency-Key':key}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
    if(response.headers.get('set-cookie'))cookies[role]=response.headers.get('set-cookie').split(';')[0];
    return {status:response.status,data:await response.json(),headers:response.headers};
  }
  let j;
  try{
    await t.test('passwords use salted hashes and reject wrong credentials',async()=>{
      assert.notEqual(encoded,await hashPassword(password));assert.equal(await verifyPassword(password,encoded),true);
      assert.equal(await verifyPassword('wrong',encoded),false);
      const response=await call('/auth/login',{role:'none',method:'POST',body:{email:'admin@test.invalid',password:'wrong'}});assert.equal(response.status,401);
    });
    await t.test('anonymous reads are rejected; login establishes HttpOnly sessions',async()=>{
      assert.equal((await call('/jobs',{role:'none'})).status,401);
      for(const role of Object.keys(users)){const r=await call('/auth/login',{role,method:'POST',body:{email:role+'@test.invalid',password}});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly/);}
      assert.equal((await call('/auth/me',{role:'driver'})).data.user.role,'driver');
    });
    const booking={customerId:customer,policyId:policy,reference:'Foundation test',service:'Parcel',priority:'Urgent',
      pickup:{company:'Pickup',address:'1 Example Rd',suburb:'Adelaide',instructions:'Collect at dock'},
      delivery:{company:'Delivery',address:'2 Example Rd',suburb:'Netley'},shipment:{items:2,weightKg:4.5,volumeM3:.1,packageType:'Box'}};
    const creationKey=randomUUID();
    await t.test('booking uses normalised legs/shipment and transactional idempotency',async()=>{
      const r=await call('/jobs',{method:'POST',body:booking,key:creationKey});assert.equal(r.status,201,JSON.stringify(r.data));j=r.data;
      assert.equal(j.legs.length,2);assert.equal(j.shipment.item_count,2);assert.equal(j.status,'UNASSIGNED');
      assert.deepEqual((await call('/jobs',{method:'POST',body:booking,key:creationKey})).data,j);
      assert.equal(db.prepare('SELECT count(*) n FROM jobs').get().n,1);
      assert.equal((await call('/jobs',{method:'POST',body:{...booking,reference:'changed'},key:creationKey})).status,409);
    });
    await t.test('drivers cannot create jobs or escalate permissions',async()=>{
      assert.equal((await call('/jobs',{role:'driver',method:'POST',body:booking,key:randomUUID()})).status,403);
      assert.equal((await call('/users',{role:'driver'})).status,403);
      assert.equal((await call('/jobs/'+j.id+'/assignment',{role:'driver',method:'POST',body:{driverId:users.driver,version:j.version},key:randomUUID()})).status,403);
      assert.equal((await call('/users',{role:'dispatch'})).status,403);
    });
    await t.test('foreign organisations cannot access jobs or attach foreign references',async()=>{
      assert.equal((await call('/jobs/'+j.id,{role:'foreignAdmin'})).status,404);
      assert.equal((await call('/jobs',{role:'foreignAdmin'})).data.total,0);
      assert.equal((await call('/jobs',{role:'foreignAdmin',method:'POST',body:booking,key:randomUUID()})).status,400);
      assert.equal((await call('/jobs/'+j.id+'/assignment',{method:'POST',body:{driverId:users.foreignAdmin,version:j.version},key:randomUUID()})).status,400);
    });
    await t.test('input errors roll back without extra jobs/events/outbox records',async()=>{
      const before=db.prepare('SELECT count(*) n FROM job_events').get().n;
      assert.equal((await call('/jobs',{method:'POST',key:randomUUID(),body:{...booking,shipment:{...booking.shipment,items:-1}}})).status,400);
      assert.equal((await call('/jobs',{method:'POST',key:randomUUID(),body:{...booking,organisationId:org2}})).status,400);
      assert.equal(db.prepare('SELECT count(*) n FROM jobs').get().n,1);assert.equal(db.prepare('SELECT count(*) n FROM job_events').get().n,before);
    });
    await t.test('assignment exposes only the allocated driver; stale revisions fail',async()=>{
      assert.equal((await call('/jobs/'+j.id,{role:'driver'})).status,404);
      const result=await call('/jobs/'+j.id+'/assignment',{role:'dispatch',method:'POST',key:randomUUID(),body:{driverId:users.driver,version:j.version}});assert.equal(result.status,200);j=result.data;
      assert.equal((await call('/jobs',{role:'driver'})).data.total,1);assert.equal((await call('/jobs',{role:'otherDriver'})).data.total,0);
      assert.equal((await call('/jobs/'+j.id,{role:'otherDriver'})).status,404);
      assert.equal((await call('/jobs/'+j.id+'/assignment',{method:'POST',key:randomUUID(),body:{driverId:users.otherDriver,version:1}})).status,409);
    });
    await t.test('shift gates driver actions and breaks prevent execution',async()=>{
      assert.equal((await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action:'accept',version:j.version}})).data.error.code,'SHIFT_REQUIRED');
      assert.equal((await call('/shifts',{role:'driver',method:'POST',key:randomUUID(),body:{action:'start',declarations:{fit:true,unimpaired:true,licence:true,ppe:true,vehicle:true}}})).status,200);
      assert.equal((await call('/shifts',{role:'driver',method:'POST',key:randomUUID(),body:{action:'break'}})).status,200);
      assert.equal((await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action:'accept',version:j.version}})).status,409);
      await call('/shifts',{role:'driver',method:'POST',key:randomUUID(),body:{action:'resume'}});
    });
    await t.test('state machine disallows skipping, forged status and unsupported delivery',async()=>{
      assert.equal((await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action:'pickup',version:j.version}})).status,409);
      assert.equal((await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action:'accept',version:j.version,status:'DELIVERED'}})).status,400);
      const key=randomUUID();const b={action:'accept',version:j.version};
      const r=await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key,body:b});assert.equal(r.status,200);j=r.data;
      assert.deepEqual((await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key,body:b})).data,j);
      for(const action of ['travel_pickup','arrive_pickup','pickup','travel_delivery','arrive_delivery']){
        const result=await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action,version:j.version}});assert.equal(result.status,200,JSON.stringify(result.data));j=result.data;
      }
      assert.equal(j.status,'ARRIVED_DELIVERY');
      assert.equal((await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action:'deliver',version:j.version}})).status,409);
      assert.equal((await call('/shifts',{role:'driver',method:'POST',key:randomUUID(),body:{action:'finish'}})).data.error.code,'ACTIVE_WORK');
    });
    await t.test('failed attempts require reasons and preserve their timeline on reattempt',async()=>{
      assert.equal((await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action:'fail',version:j.version}})).status,400);
      let result=await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action:'fail',version:j.version,reason:'Recipient unavailable'}});assert.equal(result.status,200);j=result.data;
      result=await call('/jobs/'+j.id+'/actions',{method:'POST',key:randomUUID(),body:{action:'reattempt',version:j.version,reason:'Customer confirmed new attempt'}});assert.equal(result.status,200);j=result.data;
      assert.equal(j.status,'ASSIGNED');assert.ok(j.events.some(e=>e.action==='fail'));
    });
    await t.test('location validation rejects fabricated ranges/stale samples',async()=>{
      const r=await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key:randomUUID(),body:{action:'accept',version:j.version,location:{latitude:99,longitude:0,accuracy:5,sampledAt:new Date().toISOString()}}});assert.equal(r.status,400);
    });
    await t.test('write origin checks and immutable audit/event records hold',async()=>{
      assert.equal((await call('/shifts',{role:'driver',method:'POST',key:randomUUID(),body:{action:'break'},headers:{Origin:'https://untrusted.invalid'}})).status,403);
      assert.equal((await call('/shifts',{role:'driver',method:'POST',body:{action:'break'},headers:{'X-RushIT-Client':''}})).status,403);
      assert.throws(()=>db.exec('DELETE FROM job_events'),/immutable/);assert.throws(()=>db.exec('UPDATE audit_log SET detail=\'tampered\''),/immutable/);
      assert.ok((await call('/audit')).data.items.length>0);assert.equal((await call('/audit',{role:'driver'})).status,403);
      assert.ok(db.prepare('SELECT count(*) n FROM outbox').get().n>0);
    });
    await t.test('SSE delivers scoped invalidation when dispatch changes work',async()=>{
      const controller=new AbortController();
      const response=await fetch(url+'/api/v1/events',{headers:{Cookie:cookies.driver},signal:controller.signal});assert.equal(response.status,200);
      const reader=response.body.getReader();assert.match(new TextDecoder().decode((await reader.read()).value),/connected/);
      const pending=reader.read();
      await call('/jobs',{method:'POST',key:randomUUID(),body:{...booking,reference:'Realtime check'}});
      const received=await pending;assert.match(new TextDecoder().decode(received.value),/event: refresh/);controller.abort();
    });
    await t.test('revoked assignments deny even cached idempotent responses',async()=>{
      const key=randomUUID();const body={action:'accept',version:j.version};
      let response=await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key,body});assert.equal(response.status,200);j=response.data;
      response=await call('/jobs/'+j.id+'/assignment',{method:'POST',key:randomUUID(),body:{driverId:users.otherDriver,version:j.version}});assert.equal(response.status,200);
      assert.equal((await call('/jobs/'+j.id+'/actions',{role:'driver',method:'POST',key,body})).status,404);
    });
    await t.test('logout revokes the server session and protected reads fail',async()=>{
      const old=cookies.driver;assert.equal((await call('/auth/logout',{role:'driver',method:'POST',body:{}})).status,200);
      assert.equal((await call('/auth/me',{role:'driver',headers:{Cookie:old}})).status,401);
    });
  }finally{
    await new Promise(resolve=>{app.server.closeAllConnections();app.server.close(resolve);});
  }
});
test('workflow is explicit and cannot invent a terminal delivery transition',()=>{
  assert.equal(nextState('ASSIGNED','accept'),'ACCEPTED');assert.equal(nextState('ASSIGNED','pickup'),null);assert.equal(nextState('ARRIVED_DELIVERY','deliver'),null);
});
test('file-backed data survives close/reopen and keeps foreign-key constraints',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rushit-persistence-'));
  const filename=path.join(dir,'test.sqlite');
  let db;
  try{
    db=openDatabase(filename);const org=randomUUID();db.prepare('INSERT INTO organisations VALUES (?,?)').run(org,'Restart test');
    db.close();db=openDatabase(filename);
    assert.equal(db.prepare('SELECT name FROM organisations WHERE id=?').get(org).name,'Restart test');
    assert.throws(()=>db.prepare('INSERT INTO customers VALUES (?,?,?)').run(randomUUID(),randomUUID(),'Invalid scope'),/FOREIGN KEY/);
  }finally{db?.close();fs.rmSync(dir,{recursive:true,force:true});}
});
