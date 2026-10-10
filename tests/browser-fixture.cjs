// Explicit isolated browser fixture. Never opens or changes the user's database.
const {createApp}=require('../apps/api/server.cjs');
const {hashPassword}=require('../apps/api/auth.cjs');
const {randomUUID}=require('node:crypto');
const {createCanvas}=require('@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
  const app=createApp({filename:':memory:'}),org=randomUUID(),admin=randomUUID(),customer=randomUUID(),policy=randomUUID();
  app.db.prepare('INSERT INTO organisations VALUES (?,?)').run(org,'Isolated browser test');
  app.db.prepare('INSERT INTO users (id,organisation_id,email,name,role,password_hash) VALUES (?,?,?,?,?,?)').run(admin,org,'browser@test.invalid','Browser test operator','admin',await hashPassword('Browser-test-password!'));
  app.db.prepare('INSERT INTO customers VALUES (?,?,?)').run(customer,org,'Synthetic test client');
  app.db.prepare('INSERT INTO pod_policies VALUES (?,?,?,?,?)').run(policy,org,'Signature and photo',1,'{"photo":true,"signature":true}');
  const c=createCanvas(1000,800),ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,1000,800);ctx.fillStyle='black';ctx.font='28px Arial';['SYNTHETIC BROWSER TEST - NOT LIVE FREIGHT','MAWB: 081-12345678','Consignment: BROWSER-001','Client: Synthetic test client','Shipper: Test sender','Consignee: Test receiver','Origin: SYD','Destination: ADL','Pieces: 1','Weight: 85 KG','Dimensions: 120 x 80 x 95 cm'].forEach((s,i)=>ctx.fillText(s,40,55+i*55));
  const folder=path.resolve(__dirname,'../.data/browser-fixtures');fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'synthetic-awb.png'),c.toBuffer('image/png'));
  app.server.listen(4175,'127.0.0.1',()=>console.log('Isolated browser test: http://localhost:4175'));
})();
