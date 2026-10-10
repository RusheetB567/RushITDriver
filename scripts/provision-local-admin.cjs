// Local maintenance CLI. Receives a precomputed salted hash on stdin; never logs credentials.
// It requires filesystem access to the development database and is not exposed as an API.
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {openDatabase,transaction}=require('../apps/api/database.cjs');
const {audit}=require('../apps/api/jobs.cjs');
const input=JSON.parse(fs.readFileSync(0,'utf8'));
if(!/^\S+@\S+\.\S+$/.test(input.email)||typeof input.name!=='string'||!input.name.trim()||
  !/^scrypt\$32768\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(input.passwordHash))throw new Error('Invalid provisioning input.');
const filename=process.argv[2]||path.resolve(__dirname,'../.data/rushit.sqlite');
const db=openDatabase(filename);
try{
  transaction(db,()=>{
    const existing=db.prepare('SELECT * FROM users WHERE email=? COLLATE NOCASE').get(input.email);
    if(existing){
      if(existing.role!=='admin')throw new Error('Existing account is not an administrator; elevation requires explicit review.');
      db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(input.passwordHash,existing.id);
      db.prepare('DELETE FROM sessions WHERE user_id=?').run(existing.id);
      audit(db,existing,'user.local_password_reset',existing.id,'User-authorised local reset; previous sessions revoked.');
    }else{
      if(db.prepare('SELECT id FROM users LIMIT 1').get())throw new Error('An organisation already exists; provision additional accounts through its administrator.');
      const org=randomUUID();const id=randomUUID();
      db.prepare('INSERT INTO organisations VALUES (?,?)').run(org,input.organisation||'Rush IT');
      db.prepare('INSERT INTO users(id,organisation_id,email,name,role,password_hash) VALUES(?,?,?,?,?,?)').run(id,org,input.email.toLowerCase(),input.name.trim(),'admin',input.passwordHash);
      db.prepare('INSERT INTO customers VALUES(?,?,?)').run(randomUUID(),org,'Initial customer');
      db.prepare('INSERT INTO pod_policies VALUES(?,?,?,?,?)').run(randomUUID(),org,'Recipient + signature + photo',1,JSON.stringify({recipient:true,signature:true,photo:true}));
      audit(db,{id,organisation_id:org},'user.local_provision',id,'User-authorised local administrator provisioning.');
    }
  });
  console.log('Local administrator credentials configured. No password was logged.');
}finally{db.close();}
