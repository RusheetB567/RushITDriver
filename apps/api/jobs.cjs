const { randomUUID } = require('node:crypto');
const { hash, requireRole } = require('./auth.cjs');
const { requireThat } = require('./errors.cjs');
const v = require('./validation.cjs');
const { transaction } = require('./database.cjs');
const { nextState } = require('../../packages/domain/job-workflow.cjs');
const timestamp = () => new Date().toISOString();
function scopedJob(db, user, id) {
  const j = db.prepare('SELECT * FROM jobs WHERE id=? AND organisation_id=?').get(id, user.organisation_id);
  requireThat(j, 404, 'NOT_FOUND', 'Job not found.');
  if (user.role === 'driver') {
    requireThat(db.prepare('SELECT id FROM assignments WHERE job_id=? AND driver_id=? AND active=1').get(id, user.id),
      404, 'NOT_FOUND', 'Job not found.');
  }
  return j;
}
function detail(db, user, id) {
  const j = scopedJob(db, user, id);
  return { ...j,
    customer: db.prepare('SELECT id,name FROM customers WHERE id=? AND organisation_id=?').get(j.customer_id, user.organisation_id),
    legs: db.prepare('SELECT * FROM job_legs WHERE job_id=? AND organisation_id=? ORDER BY sequence').all(id, user.organisation_id),
    shipment: db.prepare('SELECT * FROM consignments WHERE job_id=? AND organisation_id=?').get(id, user.organisation_id),
    assignment: db.prepare(`SELECT a.id,a.driver_id,u.name FROM assignments a JOIN users u ON a.driver_id=u.id
      WHERE a.job_id=? AND a.organisation_id=? AND a.active=1`).get(id, user.organisation_id) || null,
    events: db.prepare(`SELECT e.*,u.name AS actor_name FROM job_events e JOIN users u ON u.id=e.actor_id
      WHERE e.job_id=? AND e.organisation_id=? ORDER BY e.received_at,e.rowid`).all(id, user.organisation_id),
    policy: db.prepare('SELECT id,name,version,requirements FROM pod_policies WHERE id=? AND organisation_id=?').get(j.policy_id, user.organisation_id)
  };
}
function list(db, user, query) {
  const limit = Math.min(Math.max(Number(query.get('limit')) || 25, 1), 100);
  const offset = Math.max(Number(query.get('offset')) || 0, 0);
  requireThat(Number.isInteger(limit) && Number.isInteger(offset), 400, 'INVALID_PAGE', 'Invalid pagination.');
  const conditions=[];const filters=[];
  const search=query.get('search');if(search){requireThat(search.length<=200,400,'SEARCH_LIMIT','Search is too long.');conditions.push(`(j.reference LIKE ? OR j.id LIKE ? OR c.name LIKE ? OR u.name LIKE ? OR EXISTS(SELECT 1 FROM job_legs l WHERE l.job_id=j.id AND (l.address LIKE ? OR l.suburb LIKE ? OR l.company LIKE ?)) OR EXISTS(SELECT 1 FROM freight f WHERE f.job_id=j.id AND (f.data_json LIKE ? OR EXISTS(SELECT 1 FROM freight_packages p WHERE p.freight_id=f.id AND p.barcode LIKE ?))))`);filters.push(...Array(9).fill('%'+search+'%'));}
  const status=query.get('status');if(status){conditions.push('j.status=?');filters.push(status);}
  if(query.get('group')==='progress')conditions.push("j.status IN ('ACCEPTED','EN_ROUTE_PICKUP','ARRIVED_PICKUP','PICKED_UP','EN_ROUTE_DELIVERY','ARRIVED_DELIVERY')");
  for(const [key,operator]of [['from','>='],['to','<=']])if(query.get(key)){const date=Date.parse(query.get(key));requireThat(Number.isFinite(date),400,'INVALID_DATE','Provide a valid history date.');conditions.push(`j.created_at ${operator} ?`);filters.push(new Date(date).toISOString());}
  const base = `FROM jobs j JOIN customers c ON c.id=j.customer_id
    LEFT JOIN assignments a ON a.job_id=j.id AND a.active=1 LEFT JOIN users u ON u.id=a.driver_id
    WHERE j.organisation_id=? ${user.role === 'driver' ? 'AND a.driver_id=?' : ''} ${conditions.length?'AND '+conditions.join(' AND '):''}`;
  const args = user.role === 'driver' ? [user.organisation_id, user.id] : [user.organisation_id];
  args.push(...filters);
  const total = db.prepare(`SELECT count(*) AS n ${base}`).get(...args).n;
  const sorts={received:'j.created_at DESC',suburb:'destination',customer:'c.name',service:'j.service',deadline:'deadline IS NULL,deadline',weight:'weight_kg DESC',urgency:"CASE j.priority WHEN 'Critical' THEN 0 WHEN 'Urgent' THEN 1 WHEN 'Express' THEN 2 ELSE 3 END",pickup:'ready IS NULL,ready'};
  const order=sorts[query.get('sort')]||sorts.received;
  const items = db.prepare(`SELECT j.*, c.name AS customer_name, u.name AS driver_name,
    (SELECT suburb FROM job_legs WHERE job_id=j.id AND kind='delivery' ORDER BY sequence DESC LIMIT 1) AS destination,
    (SELECT company FROM job_legs WHERE job_id=j.id AND kind='pickup' LIMIT 1) pickup_company,
    (SELECT suburb FROM job_legs WHERE job_id=j.id AND kind='pickup' LIMIT 1) origin,
    (SELECT window_start FROM job_legs WHERE job_id=j.id AND kind='pickup' LIMIT 1) ready,
    (SELECT window_end FROM job_legs WHERE job_id=j.id AND kind='delivery' LIMIT 1) deadline,
    COALESCE((SELECT SUM(p.count) FROM freight_packages p JOIN freight f ON f.id=p.freight_id WHERE f.job_id=j.id),(SELECT item_count FROM consignments WHERE job_id=j.id LIMIT 1)) pieces,
    COALESCE((SELECT SUM(p.weight_kg*p.count) FROM freight_packages p JOIN freight f ON f.id=p.freight_id WHERE f.job_id=j.id),(SELECT weight_kg FROM consignments WHERE job_id=j.id LIMIT 1)) weight_kg,
    COALESCE((SELECT SUM(p.length_cm*p.width_cm*p.height_cm*p.count/1000000) FROM freight_packages p JOIN freight f ON f.id=p.freight_id WHERE f.job_id=j.id),(SELECT volume_m3 FROM consignments WHERE job_id=j.id LIMIT 1)) volume_m3
    ${base} ORDER BY ${order},j.id LIMIT ? OFFSET ?`).all(...args, limit, offset);
  return { items, total, limit, offset };
}
function audit(db, user, action, id, detail) {
  db.prepare('INSERT INTO audit_log VALUES (?,?,?,?,?,?,?)').run(randomUUID(), user.organisation_id, user.id, action, id, detail, timestamp());
}
function appendEvent(db, user, jobId, action, previous, next, body = {}) {
  db.prepare('INSERT INTO job_events VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(randomUUID(), user.organisation_id,
    jobId, user.id, action, previous, next, body.occurredAt || timestamp(), timestamp(),
    body.location ? JSON.stringify(body.location) : null, body.reason || action);
  audit(db, user, action, jobId, `${previous || ''} → ${next}`);
  db.prepare('INSERT INTO outbox VALUES (?,?,?,?,?,NULL)').run(randomUUID(), user.organisation_id, 'jobs.changed', jobId, timestamp());
}
function idempotent(db, user, key, route, body, work) {
  requireThat(typeof key === 'string' && /^[a-zA-Z0-9_-]{16,100}$/.test(key), 400, 'IDEMPOTENCY_REQUIRED', 'Provide a unique Idempotency-Key of 16–100 safe characters.');
  const requestHash = hash(JSON.stringify({ route, body }));
  return transaction(db, () => {
    const saved = db.prepare('SELECT * FROM idempotency WHERE actor_id=? AND key=?').get(user.id, key);
    if (saved) {
      requireThat(saved.request_hash === requestHash, 409, 'KEY_REUSED', 'This idempotency key was used with another request.');
      return JSON.parse(saved.response_json);
    }
    const result = work();
    db.prepare('INSERT INTO idempotency VALUES (?,?,?,?,?)').run(user.id, key, requestHash, JSON.stringify(result), timestamp());
    return result;
  });
}
function create(db, user, body) {
  requireRole(user, 'admin', 'dispatcher');
  v.fields(body, ['customerId','reference','service','priority','pickup','delivery','shipment','policyId','cargoId','cargoVersion']);
  let linkedCargo;
  if(body.cargoId){linkedCargo=db.prepare('SELECT * FROM freight WHERE id=? AND organisation_id=?').get(body.cargoId,user.organisation_id);requireThat(linkedCargo&&!linkedCargo.job_id,409,'CARGO_LINK_CONFLICT','Select available cargo in your organisation.');requireThat(linkedCargo.version===body.cargoVersion,409,'VERSION_CONFLICT','Refresh cargo before creating the booking.');}
  const customer = db.prepare('SELECT id FROM customers WHERE id=? AND organisation_id=?').get(body.customerId, user.organisation_id);
  const policy = db.prepare('SELECT id FROM pod_policies WHERE id=? AND organisation_id=?').get(body.policyId, user.organisation_id);
  requireThat(customer && policy, 400, 'INVALID_REFERENCE', 'Select a customer and POD policy in your organisation.');
  const reference = v.text(body.reference, 'Reference', 120);
  const service = v.text(body.service, 'Service', 40);
  const priority = v.enumValue(body.priority, 'Priority', ['Standard','Priority','Express','Urgent','Critical','Time Sensitive']);
  const legs = ['pickup','delivery'].map(kind => {
    const leg = body[kind];
    v.fields(leg, ['company','address','suburb','contact','phone','instructions','windowStart','windowEnd']);
    const result = { kind, company:v.text(leg.company,'Company',150), address:v.text(leg.address,'Address'),
      suburb:v.text(leg.suburb,'Suburb',100), contact:v.text(leg.contact,'Contact',120,true),
      phone:v.text(leg.phone,'Phone',40,true), instructions:v.text(leg.instructions,'Instructions',2000,true) };
    const start = leg.windowStart ? Date.parse(leg.windowStart) : null;
    const end = leg.windowEnd ? Date.parse(leg.windowEnd) : null;
    requireThat((start === null || Number.isFinite(start)) && (end === null || Number.isFinite(end)) &&
      (start === null || end === null || start <= end), 400, 'INVALID_WINDOW', 'Provide valid ordered time windows.');
    return { ...result, start:start === null ? null : new Date(start).toISOString(), end:end === null ? null : new Date(end).toISOString() };
  });
  const s = body.shipment;
  v.fields(s, ['items','weightKg','volumeM3','packageType']);
  v.number(s.items,'Items',1,10000,true); v.number(s.weightKg,'Weight',0,100000); v.number(s.volumeM3,'Volume',0,10000);
  const packageType = v.text(s.packageType,'Package type',80);
  const id = randomUUID();
  db.prepare('INSERT INTO jobs VALUES (?,?,?,?,?,?,?,?,?,?)').run(id, user.organisation_id, body.customerId,
    reference, service, priority, 'UNASSIGNED', 1, body.policyId, timestamp());
  legs.forEach((l,index) => db.prepare('INSERT INTO job_legs VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(randomUUID(), user.organisation_id,
    id, index+1, l.kind, l.company, l.address, l.suburb, l.contact, l.phone, l.instructions, l.start, l.end));
  db.prepare('INSERT INTO consignments VALUES (?,?,?,?,?,?,?)').run(randomUUID(), user.organisation_id, id, s.items, s.weightKg, s.volumeM3, packageType);
  appendEvent(db, user, id, 'create', null, 'UNASSIGNED');
  if(linkedCargo){db.prepare('UPDATE freight SET job_id=?,version=version+1 WHERE id=?').run(id,linkedCargo.id);appendEvent(db,user,id,'cargo_link','UNASSIGNED','UNASSIGNED');}
  return detail(db, user, id);
}
function checkVersion(j, body) {
  requireThat(Number.isInteger(body.version), 400, 'VERSION_REQUIRED', 'Provide the current job version.');
  requireThat(j.version === body.version, 409, 'VERSION_CONFLICT', 'This job changed. Refresh before retrying.');
}
function assign(db, user, id, body) {
  requireRole(user, 'admin','dispatcher');
  v.fields(body,['driverId','version']);
  const j = scopedJob(db,user,id); checkVersion(j,body);
  requireThat(['UNASSIGNED','ASSIGNED','ACCEPTED'].includes(j.status),409,'ASSIGNMENT_CONFLICT','Reassignment is only supported before pickup travel in this milestone.');
  const driver = db.prepare("SELECT id FROM users WHERE id=? AND organisation_id=? AND role='driver' AND disabled=0").get(body.driverId,user.organisation_id);
  requireThat(driver,400,'INVALID_DRIVER','Choose an active driver in your organisation.');
  db.prepare('UPDATE assignments SET active=0 WHERE job_id=? AND active=1').run(id);
  db.prepare('INSERT INTO assignments VALUES (?,?,?,?,1,?)').run(randomUUID(),user.organisation_id,id,body.driverId,timestamp());
  db.prepare("UPDATE jobs SET status='ASSIGNED',version=version+1 WHERE id=?").run(id);
  appendEvent(db,user,id,'assign',j.status,'ASSIGNED');
  return detail(db,user,id);
}
function action(db,user,id,body) {
  v.fields(body,['action','version','occurredAt','location','reason']);
  const j=scopedJob(db,user,id);checkVersion(j,body);
  const actionName=v.text(body.action,'Action',40);
  const gps=v.location(body.location);
  let next;
  if(user.role==='driver') {
    const shift=db.prepare('SELECT state FROM shifts WHERE driver_id=? AND finished_at IS NULL').get(user.id);
    requireThat(shift && shift.state==='Available',409,'SHIFT_REQUIRED','Start or resume your shift first.');
    next=nextState(j.status,actionName);
    if(actionName==='pickup'){
      const missing=db.prepare(`SELECT p.id FROM freight_packages p JOIN freight f ON f.id=p.freight_id WHERE f.job_id=?
        AND NOT EXISTS(SELECT 1 FROM cargo_scan_events s WHERE s.package_id=p.id AND s.stage='pickup' AND s.created_at>=COALESCE((SELECT MAX(received_at) FROM job_events WHERE job_id=? AND action='reattempt'),'')) LIMIT 1`).get(id,id);
      requireThat(!missing,409,'MISSING_SCAN','Scan every cargo package before completing pickup.');
    }
  } else {
    requireRole(user,'admin','dispatcher');
    if(actionName==='hold'&&j.status==='UNASSIGNED')next='ON_HOLD';
    if(actionName==='release'&&j.status==='ON_HOLD')next='UNASSIGNED';
    if(actionName==='cancel'&&['UNASSIGNED','ASSIGNED','ACCEPTED','ON_HOLD'].includes(j.status))next='CANCELLED';
    if(actionName==='reattempt'&&j.status==='FAILED')next='ASSIGNED';
  }
  requireThat(next,409,'INVALID_TRANSITION','This action is not valid for the current state and role. Delivery completion requires the evidence milestone.');
  let reason='';if(['fail','cancel','hold','reattempt'].includes(actionName))reason=v.text(body.reason,'Reason',1000);
  let occurredAt=timestamp();
  if(body.occurredAt!==undefined){const value=Date.parse(body.occurredAt);requireThat(Number.isFinite(value)&&value<=Date.now()+60000,400,'INVALID_TIME','Provide a valid occurrence timestamp.');occurredAt=new Date(value).toISOString();}
  db.prepare('UPDATE jobs SET status=?,version=version+1 WHERE id=?').run(next,id);
  if(next==='CANCELLED')db.prepare('UPDATE assignments SET active=0 WHERE job_id=?').run(id);
  appendEvent(db,user,id,actionName,j.status,next,{occurredAt,location:gps,reason});
  return detail(db,user,id);
}
module.exports={list,detail,create,assign,action,idempotent,audit,scopedJob,appendEvent,checkVersion};
