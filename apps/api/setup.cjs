const readline = require('node:readline/promises');
const { Writable } = require('node:stream');
const crypto = require('node:crypto');
const path = require('node:path');
const { openDatabase, transaction } = require('./database.cjs');
const { hashPassword } = require('./auth.cjs');
async function setup() {
  const db = openDatabase(path.resolve(__dirname,'../../.data/rushit.sqlite'));
  if(db.prepare('SELECT id FROM users LIMIT 1').get()){
    console.log('An account already exists. Use the admin portal to manage users.');db.close();return;
  }
  let hidden=false;
  const output=new Writable({write(chunk,encoding,callback){if(!hidden)process.stdout.write(chunk);callback();}});
  const rl=readline.createInterface({input:process.stdin,output,terminal:true});
  try{
    const organisation=(await rl.question('Organisation name: ')).trim();
    const name=(await rl.question('Administrator name: ')).trim();
    const email=(await rl.question('Administrator email: ')).trim().toLowerCase();
    if(!organisation||organisation.length>120||!name||name.length>120||!/^\S+@\S+\.\S+$/.test(email))throw new Error('Provide a valid organisation, name and email.');
    process.stdout.write('Password (12–256 characters; input hidden): ');hidden=true;
    const password=await rl.question('');hidden=false;process.stdout.write('\n');
    process.stdout.write('Confirm password (input hidden): ');hidden=true;
    const confirmation=await rl.question('');hidden=false;process.stdout.write('\n');
    if(password!==confirmation)throw new Error('Passwords did not match.');
    const encoded=await hashPassword(password);
    transaction(db,()=>{
      const org=crypto.randomUUID();const user=crypto.randomUUID();
      db.prepare('INSERT INTO organisations VALUES (?,?)').run(org,organisation);
      db.prepare('INSERT INTO users (id,organisation_id,email,name,role,password_hash) VALUES (?,?,?,?,?,?)').run(user,org,email,name,'admin',encoded);
      db.prepare('INSERT INTO customers VALUES (?,?,?)').run(crypto.randomUUID(),org,'Initial customer');
      db.prepare('INSERT INTO pod_policies VALUES (?,?,?,?,?)').run(crypto.randomUUID(),org,'Recipient + signature + photo',1,JSON.stringify({recipient:true,signature:true,photo:true}));
    });
    console.log('Administrator provisioned. Sign in at http://localhost:4174. Add driver/dispatcher accounts under Users.');
  }finally{hidden=false;rl.close();db.close();}
}
setup().catch(()=>{console.error('Setup failed. Check inputs and password requirements, then rerun npm run setup.');process.exitCode=1;});
