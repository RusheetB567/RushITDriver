const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { openDatabase, transaction } = require('./database.cjs');
const auth = require('./auth.cjs');
const jobs = require('./jobs.cjs');
const v = require('./validation.cjs');
const {createLogistics}=require('./logistics.cjs');
const { ApiError, requireThat } = require('./errors.cjs');
const now = () => new Date().toISOString();
function createApp({ filename = path.resolve(__dirname,'../../.data/rushit.sqlite'), secureCookies = false } = {}) {
  const db = openDatabase(filename);
  const logistics=createLogistics(db,filename);
  const clients = new Set();
  const attempts = new Map();
  const limiter = new Map();
  const dummyHash = auth.hashPassword(crypto.randomBytes(32).toString('hex'));
  const send = (res,status,value) => { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value)); };
  function limited(map,key,max,window) {
    const time=Date.now();let entry=map.get(key);
    if(!entry || entry.until<time){entry={count:0,until:time+window};map.set(key,entry);}
    requireThat(++entry.count<=max,429,'RATE_LIMITED','Too many requests. Try again later.');
    if(map.size>5000)for(const [k,value]of map)if(value.until<time)map.delete(k);
  }
  async function body(req,max=64*1024) {
    requireThat((req.headers['content-type']||'').split(';')[0]==='application/json',415,'JSON_REQUIRED','Send application/json.');
    let size=0;const chunks=[];
    for await(const chunk of req){size+=chunk.length;requireThat(size<=max,413,'BODY_TOO_LARGE','Request exceeds the allowed upload size.');chunks.push(chunk);}
    try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ApiError(400,'INVALID_JSON','Request is not valid JSON.');}
  }
  function publish(user) {
    // Invalidation only; no job IDs, names or evidence are leaked to clients.
    for(const client of clients){
      if(client.organisation!==user.organisation_id)continue;
      const valid=db.prepare('SELECT token_hash FROM sessions WHERE token_hash=? AND expires_at>?').get(client.tokenHash,now());
      if(!valid){client.res.end();clients.delete(client);continue;}
      client.res.write('event: refresh\ndata: {}\n\n');
    }
  }
  const heartbeat=setInterval(()=>{
    for(const client of clients){const valid=db.prepare(`SELECT s.token_hash FROM sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=? AND s.expires_at>? AND u.disabled=0`).get(client.tokenHash,now());
      if(!valid){client.res.end();clients.delete(client);}else client.res.write(': heartbeat\n\n');}
  },15000);heartbeat.unref();
  const server=http.createServer(async(req,res)=>{
    const requestId=crypto.randomUUID();
    res.setHeader('X-Request-ID',requestId);res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://tile.openstreetmap.org; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    try{
      const port=server.address().port;
      const permittedHosts=[`127.0.0.1:${port}`,`localhost:${port}`];
      requireThat(permittedHosts.includes(req.headers.host),400,'INVALID_HOST','This development server only accepts loopback hosts.');
      const url=new URL(req.url,'http://localhost');
      const p=url.pathname;
      if(!p.startsWith('/api/')){
        requireThat(req.method==='GET',405,'METHOD_NOT_ALLOWED','Use GET for assets.');
        const assets={'/':'index.html','/app.js':'app.js','/brand.js':'brand.js','/style.css':'style.css','/premium.js':'premium.js','/premium.css':'premium.css','/execution.js':'execution.js','/fleet.js':'fleet.js','/fleet.css':'fleet.css'};
        const file=assets[p];requireThat(file,404,'NOT_FOUND','Page not found.');
        const mime=p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html';
        res.writeHead(200,{'Content-Type':mime+'; charset=utf-8'});return res.end(fs.readFileSync(path.join(__dirname,'../web',file)));
      }
      limited(limiter,req.socket.remoteAddress,400,60000);
      if(['POST','PUT','PATCH','DELETE'].includes(req.method)){
        requireThat(req.headers['x-rushit-client']==='web',403,'CSRF_CHECK','A trusted client header is required.');
        if(req.headers.origin)requireThat(permittedHosts.some(h=>req.headers.origin===`http://${h}`),403,'ORIGIN_DENIED','Untrusted request origin.');
      }
      if(p==='/api/v1/health'&&req.method==='GET')return send(res,200,{status:'ok',milestone:'foundation',storage:'sqlite-development'});
      if(p==='/api/v1/auth/login'&&req.method==='POST'){
        limited(attempts,req.socket.remoteAddress,15,15*60000);
        const b=await body(req);v.fields(b,['email','password']);
        const email=v.text(b.email,'Email',254).toLowerCase();
        requireThat(typeof b.password==='string' && b.password.length>0 && b.password.length<=256,400,'INVALID_FIELD','Provide your password.');
        const password=b.password;
        const user=db.prepare('SELECT * FROM users WHERE email=? COLLATE NOCASE AND disabled=0').get(email);
        const matches=await auth.verifyPassword(password,user?user.password_hash:await dummyHash);
        requireThat(user&&matches,401,'INVALID_LOGIN','Email or password is incorrect.');
        const token=crypto.randomBytes(32).toString('base64url');
        db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').run(auth.hash(token),user.id,new Date(Date.now()+8*60*60*1000).toISOString(),now());
        res.setHeader('Set-Cookie',`rushit_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secureCookies?'; Secure':''}`);
        return send(res,200,{user:auth.publicUser(user)});
      }
      const user=auth.authenticate(db,req);
      if(p==='/api/v1/locations'&&req.method==='GET'){
        auth.requireRole(user,'admin','dispatcher');
        const items=db.prepare(`SELECT u.id,u.name,s.state,p.latitude,p.longitude,p.accuracy,p.sampled_at,
          (SELECT count(*) FROM assignments a JOIN jobs j ON j.id=a.job_id WHERE a.driver_id=u.id AND a.active=1 AND j.status NOT IN ('DELIVERED','CANCELLED')) workload
          FROM users u LEFT JOIN shifts s ON s.driver_id=u.id AND s.finished_at IS NULL
          LEFT JOIN driver_positions p ON p.driver_id=u.id AND p.organisation_id=u.organisation_id
          WHERE u.organisation_id=? AND u.role='driver' AND u.disabled=0 ORDER BY u.name`).all(user.organisation_id);
        return send(res,200,{items:items.map(item=>({...item,latitude:item.state==='Available'?item.latitude:null,longitude:item.state==='Available'?item.longitude:null})),serverTime:now()});
      }
      if(p==='/api/v1/locations'&&['POST','DELETE'].includes(req.method)){
        auth.requireRole(user,'driver');
        if(req.method==='DELETE'){db.prepare('DELETE FROM driver_positions WHERE organisation_id=? AND driver_id=?').run(user.organisation_id,user.id);return send(res,200,{sharing:false});}
        const b=await body(req);v.fields(b,['location']);const point=v.location(b.location);requireThat(point,400,'LOCATION_REQUIRED','Provide a GPS location.');
        const shift=db.prepare('SELECT state FROM shifts WHERE driver_id=? AND finished_at IS NULL').get(user.id);
        requireThat(shift?.state==='Available',409,'SHIFT_REQUIRED','Start or resume your shift before sharing location.');
        const sampled=new Date(Date.parse(point.sampledAt)).toISOString();
        db.prepare(`INSERT INTO driver_positions VALUES (?,?,?,?,?,?,?) ON CONFLICT(organisation_id,driver_id)
          DO UPDATE SET latitude=excluded.latitude,longitude=excluded.longitude,accuracy=excluded.accuracy,sampled_at=excluded.sampled_at,received_at=excluded.received_at
          WHERE excluded.sampled_at>driver_positions.sampled_at`).run(user.organisation_id,user.id,point.latitude,point.longitude,point.accuracy,sampled,now());
        return send(res,200,{sharing:true});
      }
      if(p==='/api/v1/dashboard'&&req.method==='GET')return send(res,200,logistics.summary(user));
      if(p==='/api/v1/batch'&&req.method==='POST'){
        auth.requireRole(user,'driver');const b=await body(req);v.fields(b,['action','items']);v.enumValue(b.action,'Batch action',['arrive_pickup','pickup','arrive_delivery']);requireThat(Array.isArray(b.items)&&b.items.length>0&&b.items.length<=30,400,'BATCH_LIMIT','Select 1–30 jobs.');
        const results=[];
        for(const item of b.items){v.fields(item,['id','version','key']);try{jobs.scopedJob(db,user,item.id);const command={action:b.action,version:item.version};const result=jobs.idempotent(db,user,item.key,p+'/'+item.id,command,()=>jobs.action(db,user,item.id,command));results.push({id:item.id,ok:true,version:result.version,status:result.status});}catch(error){if(!(error instanceof ApiError))throw error;results.push({id:item.id,ok:false,error:error.message});}}
        publish(user);return send(res,200,{results});
      }
      if(p==='/api/v1/cargo'&&req.method==='GET')return send(res,200,{items:logistics.freightList(user)});
      if(p==='/api/v1/cargo'&&req.method==='POST'){
        const b=await body(req);const result=jobs.idempotent(db,user,req.headers['idempotency-key'],p,b,()=>logistics.saveFreight(user,b));publish(user);return send(res,201,result);
      }
      const freightMatch=p.match(/^\/api\/v1\/cargo\/([a-zA-Z0-9-]+)(?:\/(link))?$/);
      if(freightMatch){
        if(req.method==='GET'&&!freightMatch[2])return send(res,200,logistics.freight(user,freightMatch[1]));
        if(req.method==='POST'&&freightMatch[2]){
          auth.requireRole(user,'admin','dispatcher');const b=await body(req);v.fields(b,['jobId','version']);
          const f=logistics.freight(user,freightMatch[1]);const j=jobs.scopedJob(db,user,b.jobId);
          const result=jobs.idempotent(db,user,req.headers['idempotency-key'],p,b,()=>{requireThat(!f.job_id,409,'ALREADY_LINKED','Cargo is already linked.');requireThat(f.version===b.version,409,'VERSION_CONFLICT','Refresh this cargo.');requireThat(['UNASSIGNED','ASSIGNED','ACCEPTED','ON_HOLD'].includes(j.status),409,'CARGO_LOCKED','Link cargo before pickup travel.');db.prepare('UPDATE freight SET job_id=?,version=version+1 WHERE id=?').run(j.id,f.id);db.prepare('UPDATE jobs SET version=version+1 WHERE id=?').run(j.id);jobs.appendEvent(db,user,j.id,'cargo_link',j.status,j.status);return logistics.freight(user,f.id);});publish(user);return send(res,200,result);
        }
      }
      if(p==='/api/v1/documents'&&req.method==='GET'){
        auth.requireRole(user,'admin','dispatcher');return send(res,200,{items:db.prepare('SELECT id,name,mime,status,freight_id,created_at FROM cargo_documents WHERE organisation_id=? ORDER BY created_at DESC LIMIT 100').all(user.organisation_id)});
      }
      if(p==='/api/v1/documents'&&req.method==='POST'){const result=await logistics.upload(user,await body(req,8*1024*1024));publish(user);return send(res,201,result);}
      const documentMatch=p.match(/^\/api\/v1\/documents\/([a-zA-Z0-9-]+)(?:\/(file))?$/);
      if(documentMatch&&req.method==='GET'){
        const doc=logistics.document(user,documentMatch[1]);
        if(documentMatch[2]){const row=db.prepare('SELECT encrypted_file FROM cargo_documents WHERE id=?').get(doc.id);res.writeHead(200,{'Content-Type':doc.mime,'Content-Disposition':`inline; filename="document.${doc.mime==='application/pdf'?'pdf':doc.mime==='image/png'?'png':'jpg'}"`});return res.end(logistics.decrypt(row.encrypted_file));}
        return send(res,200,doc);
      }
      const cargoJobMatch=p.match(/^\/api\/v1\/jobs\/([a-zA-Z0-9-]+)\/(cargo|scans|pod)$/);
      if(cargoJobMatch){const id=cargoJobMatch[1],kind=cargoJobMatch[2];jobs.scopedJob(db,user,id);
        if(req.method==='GET')return send(res,200,kind==='pod'?{evidence:logistics.evidence(user,id)}:logistics.jobCargo(user,id));
        if(req.method==='POST'&&['scans','pod'].includes(kind)){const b=await body(req,kind==='pod'?8*1024*1024:64*1024);const result=jobs.idempotent(db,user,req.headers['idempotency-key'],p,b,()=>kind==='scans'?logistics.scan(user,id,b):logistics.complete(user,id,b));publish(user);return send(res,200,result);}
      }
      if(p==='/api/v1/contacts'&&req.method==='GET')return send(res,200,{items:db.prepare(`SELECT id,name,role FROM users WHERE organisation_id=? AND disabled=0 ${user.role==='driver'?"AND role IN ('admin','dispatcher')":''}`).all(user.organisation_id)});
      if(p==='/api/v1/shift-end'&&req.method==='GET')return send(res,200,{items:db.prepare(`SELECT r.*,u.name,(SELECT count(*) FROM assignments a JOIN jobs j ON j.id=a.job_id WHERE a.driver_id=r.driver_id AND a.active=1 AND j.status NOT IN ('DELIVERED','CANCELLED','RETURNED')) remaining FROM shift_end_requests r JOIN users u ON u.id=r.driver_id WHERE r.organisation_id=? AND r.approved_at IS NULL ${user.role==='driver'?'AND r.driver_id=?':''}`).all(...(user.role==='driver'?[user.organisation_id,user.id]:[user.organisation_id]))});
      if(p==='/api/v1/shift-end'&&req.method==='POST'){
        const b=await body(req);v.fields(b,['action','requestId']);v.enumValue(b.action,'Shift end action',['request','approve']);
        const result=jobs.idempotent(db,user,req.headers['idempotency-key'],p,b,()=>{
          if(b.action==='request'){auth.requireRole(user,'driver');const shift=db.prepare('SELECT * FROM shifts WHERE driver_id=? AND finished_at IS NULL').get(user.id);requireThat(shift,409,'SHIFT_REQUIRED','Start a shift first.');const saved=db.prepare('SELECT id FROM shift_end_requests WHERE shift_id=? AND approved_at IS NULL').get(shift.id);if(saved)return saved;const id=crypto.randomUUID();db.prepare('INSERT INTO shift_end_requests VALUES (?,?,?,?,?,NULL,NULL)').run(id,user.organisation_id,user.id,shift.id,now());jobs.audit(db,user,'shift.end_request',id,'Driver requests dispatcher approval');return {id};}
          auth.requireRole(user,'admin','dispatcher');const request=db.prepare('SELECT * FROM shift_end_requests WHERE id=? AND organisation_id=? AND approved_at IS NULL').get(b.requestId,user.organisation_id);requireThat(request,404,'NOT_FOUND','Pending request not found.');const active=db.prepare("SELECT j.id FROM jobs j JOIN assignments a ON a.job_id=j.id WHERE a.driver_id=? AND a.active=1 AND j.status NOT IN ('DELIVERED','CANCELLED','RETURNED') LIMIT 1").get(request.driver_id);requireThat(!active,409,'HANDOVER_REQUIRED','Resolve or hand over remaining jobs before approval.');db.prepare('UPDATE shift_end_requests SET approved_at=?,approved_by=? WHERE id=?').run(now(),user.id,request.id);db.prepare("UPDATE shifts SET state='Finished',finished_at=? WHERE id=?").run(now(),request.shift_id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(request.driver_id);jobs.audit(db,user,'shift.end_approve',request.id,'Shift closed by base; driver sessions revoked');return {ok:true};
        });publish(user);return send(res,200,result);
      }
      if(p==='/api/v1/messages'&&req.method==='GET')return send(res,200,{items:db.prepare('SELECT m.*,s.name sender,s.role sender_role,r.name recipient FROM messages m JOIN users s ON s.id=m.sender_id JOIN users r ON r.id=m.recipient_id WHERE m.organisation_id=? AND (m.sender_id=? OR m.recipient_id=?) ORDER BY m.created_at DESC LIMIT 100').all(user.organisation_id,user.id,user.id)});
      if(p==='/api/v1/messages'&&req.method==='POST'){
        const b=await body(req);v.fields(b,['recipientId','jobId','body','priority']);const recipient=db.prepare('SELECT id,role FROM users WHERE id=? AND organisation_id=? AND disabled=0').get(b.recipientId,user.organisation_id);requireThat(recipient&&recipient.id!==user.id,400,'INVALID_RECIPIENT','Choose another active member of your organisation.');requireThat(user.role!=='driver'||recipient.role!=='driver',403,'FORBIDDEN','Drivers can message base operators.');if(b.jobId){jobs.scopedJob(db,user,b.jobId);if(recipient.role==='driver')requireThat(db.prepare('SELECT id FROM assignments WHERE job_id=? AND driver_id=? AND active=1').get(b.jobId,recipient.id),400,'INVALID_RECIPIENT','Choose the assigned driver for a job-linked message.');}
        const text=v.text(b.body,'Message',4000),priority=v.enumValue(b.priority,'Priority',['Normal','Urgent']);const result=jobs.idempotent(db,user,req.headers['idempotency-key'],p,b,()=>{const id=crypto.randomUUID();db.prepare('INSERT INTO messages VALUES (?,?,?,?,?,?,?,?,NULL)').run(id,user.organisation_id,user.id,recipient.id,b.jobId||null,text,priority,now());jobs.audit(db,user,'message.send',id,'Organisation message');return {id};});publish(user);return send(res,201,result);
      }
      const readMatch=p.match(/^\/api\/v1\/messages\/([a-zA-Z0-9-]+)\/read$/);
      if(readMatch&&req.method==='POST'){const result=db.prepare('UPDATE messages SET read_at=COALESCE(read_at,?) WHERE id=? AND organisation_id=? AND recipient_id=?').run(now(),readMatch[1],user.organisation_id,user.id);requireThat(result.changes,404,'NOT_FOUND','Message not found.');return send(res,200,{ok:true});}
      if(p==='/api/v1/auth/me'&&req.method==='GET')return send(res,200,{user:auth.publicUser(user)});
      if(p==='/api/v1/auth/logout'&&req.method==='POST'){
        const cookie=req.headers.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('rushit_session='));
        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(auth.hash(cookie.slice(15)));
        res.setHeader('Set-Cookie',`rushit_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookies?'; Secure':''}`);
        publish(user);return send(res,200,{ok:true});
      }
      if(p==='/api/v1/events'&&req.method==='GET'){
        const cookie=req.headers.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('rushit_session='));
        requireThat(clients.size<100,503,'LIVE_CAPACITY','Realtime development capacity reached.');
        res.writeHead(200,{'Content-Type':'text/event-stream','Connection':'keep-alive','Cache-Control':'no-cache'});
        res.write('event: connected\ndata: {}\n\n');
        const client={organisation:user.organisation_id,tokenHash:auth.hash(cookie.slice(15)),res};clients.add(client);
        req.on('close',()=>clients.delete(client));return;
      }
      if(p==='/api/v1/catalogue'&&req.method==='GET'){
        auth.requireRole(user,'admin','dispatcher');
        return send(res,200,{
          customers:db.prepare('SELECT id,name FROM customers WHERE organisation_id=?').all(user.organisation_id),
          policies:db.prepare('SELECT id,name,requirements FROM pod_policies WHERE organisation_id=?').all(user.organisation_id),
          drivers:db.prepare("SELECT id,name FROM users WHERE organisation_id=? AND role='driver' AND disabled=0").all(user.organisation_id)
        });
      }
      if(p==='/api/v1/users'&&req.method==='GET'){
        auth.requireRole(user,'admin');return send(res,200,{items:db.prepare('SELECT id,name,email,role,disabled FROM users WHERE organisation_id=? LIMIT 100').all(user.organisation_id)});
      }
      if(p==='/api/v1/users'&&req.method==='POST'){
        auth.requireRole(user,'admin');const b=await body(req);v.fields(b,['name','email','role','password']);
        const name=v.text(b.name,'Name',120);const email=v.text(b.email,'Email',254).toLowerCase();
        requireThat(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),400,'INVALID_EMAIL','Provide a valid email.');
        const role=v.enumValue(b.role,'Role',['admin','dispatcher','driver']);const encoded=await auth.hashPassword(b.password);
        const id=crypto.randomUUID();transaction(db,()=>{
          requireThat(!db.prepare('SELECT id FROM users WHERE email=? COLLATE NOCASE').get(email),409,'EMAIL_EXISTS','This email is unavailable.');
          db.prepare('INSERT INTO users (id,organisation_id,email,name,role,password_hash) VALUES (?,?,?,?,?,?)').run(id,user.organisation_id,email,name,role,encoded);
          jobs.audit(db,user,'user.create',id,role);
        });return send(res,201,{id,name,email,role});
      }
      if(p==='/api/v1/jobs'&&req.method==='GET')return send(res,200,jobs.list(db,user,url.searchParams));
      if(p==='/api/v1/jobs'&&req.method==='POST'){
        auth.requireRole(user,'admin','dispatcher');
        const b=await body(req);const result=jobs.idempotent(db,user,req.headers['idempotency-key'],p,b,()=>jobs.create(db,user,b));
        publish(user);return send(res,201,result);
      }
      const match=p.match(/^\/api\/v1\/jobs\/([a-zA-Z0-9-]+)(?:\/(assignment|actions))?$/);
      if(match){
        if(req.method==='GET'&&!match[2])return send(res,200,jobs.detail(db,user,match[1]));
        if(req.method==='POST'&&match[2]){
          const b=await body(req);
          // Check current access before returning any previously cached command response.
          if(match[2]==='assignment')auth.requireRole(user,'admin','dispatcher');
          else {
            const allowed=user.role==='driver'?['accept','travel_pickup','arrive_pickup','pickup','travel_delivery','arrive_delivery','fail']:['hold','release','cancel','reattempt'];
            requireThat(allowed.includes(b.action),409,'INVALID_TRANSITION','This action is not supported for your role.');
          }
          jobs.scopedJob(db,user,match[1]);
          const result=jobs.idempotent(db,user,req.headers['idempotency-key'],p,b,()=>
            match[2]==='assignment'?jobs.assign(db,user,match[1],b):jobs.action(db,user,match[1],b));
          publish(user);return send(res,200,result);
        }
      }
      if(p==='/api/v1/shifts'&&req.method==='GET'){
        const result=user.role==='driver'?db.prepare('SELECT * FROM shifts WHERE driver_id=? AND finished_at IS NULL').get(user.id):
          db.prepare(`SELECT s.*,u.name FROM shifts s JOIN users u ON u.id=s.driver_id WHERE s.organisation_id=? AND finished_at IS NULL`).all(user.organisation_id);
        return send(res,200,{shift:result||null});
      }
      if(p==='/api/v1/shifts'&&req.method==='POST'){
        auth.requireRole(user,'driver');const b=await body(req);v.fields(b,['action','declarations']);
        const result=jobs.idempotent(db,user,req.headers['idempotency-key'],p,b,()=>{
          const action=v.enumValue(b.action,'Shift action',['start','break','resume','finish']);
          const shift=db.prepare('SELECT * FROM shifts WHERE driver_id=? AND finished_at IS NULL').get(user.id);
          if(action==='start'){
            requireThat(!shift,409,'SHIFT_OPEN','A shift is already open.');
            v.fields(b.declarations,['fit','unimpaired','licence','ppe','vehicle']);
            requireThat(['fit','unimpaired','licence','ppe','vehicle'].every(k=>b.declarations[k]===true),400,'DECLARATION_REQUIRED','Confirm all five safety declarations before starting.');
            db.prepare('INSERT INTO shift_declarations VALUES (?,?,?,?,?)').run(crypto.randomUUID(),user.organisation_id,user.id,JSON.stringify(b.declarations),now());
            db.prepare("INSERT INTO shifts VALUES (?,?,?,'Available',?,NULL)").run(crypto.randomUUID(),user.organisation_id,user.id,now());
          }else{
            requireThat(shift,409,'SHIFT_REQUIRED','Start a shift first.');
            requireThat(action!=='break'||shift.state==='Available',409,'INVALID_SHIFT','You are already on break.');
            requireThat(action!=='resume'||shift.state==='Break',409,'INVALID_SHIFT','You are not on break.');
            if(action==='finish'){
              const active=db.prepare(`SELECT j.id FROM jobs j JOIN assignments a ON a.job_id=j.id AND a.active=1
                WHERE a.driver_id=? AND j.status NOT IN ('CANCELLED','DELIVERED','RETURNED') LIMIT 1`).get(user.id);
              requireThat(!active,409,'ACTIVE_WORK','Contact dispatch to resolve active assignments before finishing.');
            }
            db.prepare('UPDATE shifts SET state=?,finished_at=? WHERE id=?').run(action==='break'?'Break':action==='finish'?'Finished':'Available',action==='finish'?now():null,shift.id);
          }
          jobs.audit(db,user,`shift.${action}`,user.id,action);
          return {shift:db.prepare('SELECT * FROM shifts WHERE driver_id=? AND finished_at IS NULL').get(user.id)||null};
        });publish(user);return send(res,200,result);
      }
      if(p==='/api/v1/audit'&&req.method==='GET'){
        auth.requireRole(user,'admin');return send(res,200,{items:db.prepare('SELECT * FROM audit_log WHERE organisation_id=? ORDER BY created_at DESC,rowid DESC LIMIT 100').all(user.organisation_id)});
      }
      throw new ApiError(404,'NOT_FOUND','Endpoint not found.');
    }catch(error){
      if(res.headersSent){res.end();return;}
      if(!(error instanceof ApiError))console.error(JSON.stringify({level:'error',requestId,code:'INTERNAL_ERROR',errorType:error.constructor.name}));
      send(res,error.status||500,{error:{code:error.code||'INTERNAL_ERROR',message:error.status?error.message:'An internal error occurred.',requestId}});
    }
  });
  server.on('close',()=>{clearInterval(heartbeat);db.close();});
  return {server,db,close:()=>{for(const c of clients)c.res.end();server.close();}};
}
if(require.main===module){
  const port=Number(process.env.PORT)||4174;
  const app=createApp();
  app.server.on('error',error=>{
    if(error.code==='EADDRINUSE'){
      console.error(`Port ${port} is already in use. If Rush IT is running, open http://localhost:${port}.`);
      console.error('To restart, press Ctrl+C in the terminal running Rush IT, then run npm run dev again.');
      console.error('To use another port in PowerShell: $env:PORT="4175"; npm run dev');
    }else console.error(`Rush IT could not start: ${error.message}`);
    process.exit(1);
  });
  app.server.listen(port,'127.0.0.1',()=>{
    console.log(`RushIT foundation: http://localhost:${app.server.address().port}`);
    if(!app.db.prepare('SELECT id FROM users LIMIT 1').get())console.log('No accounts provisioned. Run npm run setup in another terminal.');
  });
}
module.exports={createApp};
