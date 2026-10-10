const app=document.querySelector('#app');
const view={user:null,page:'jobs',job:null,jobs:[],total:0,offset:0,catalogue:null,shift:null,users:[],audit:[],search:'',filter:'all',busy:false,gps:null};
let stream=null;
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const h=escapeHtml;
const labelStatus=value=>String(value).toLowerCase().replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
const time=value=>value?new Date(value).toLocaleString(): 'Not specified';
const button=(text,action,cls='')=>`<button type="button" class="${cls}" data-action="${action}">${text}</button>`;
function toast(message){const element=document.querySelector('#toast');element.textContent=message;element.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>element.classList.remove('visible'),6500);}
async function api(url,{method='GET',body,key}={}){
  const headers={'X-RushIT-Client':'web'};
  if(body!==undefined)headers['Content-Type']='application/json';
  if(key)headers['Idempotency-Key']=key;
  const response=await fetch('/api/v1'+url,{method,headers,credentials:'same-origin',body:body===undefined?undefined:JSON.stringify(body)});
  const data=await response.json();
  if(!response.ok){
    if(response.status===401&&view.user){view.user=null;stream?.close();render();}
    throw new Error(data.error?.message||'Request failed.');
  }
  return data;
}
function connect(){stream?.close();stream=new EventSource('/api/v1/events');stream.addEventListener('refresh',()=>{
  if(view.busy)return;
  if(['create','users','review','cargo-new','messages','documents'].includes(view.page))return; // Preserve forms while typing.
  if(view.job){toast('Operations changed. Refresh this job before your next action.');return;}
  load().catch(error=>toast(error.message));
});}
async function load(){
  if(!view.user)return;
  if(view.page==='jobs'){
    const result=await api('/jobs?limit=25&offset='+view.offset);view.jobs=result.items;view.total=result.total;
    if(view.user.role==='driver')view.shift=(await api('/shifts')).shift;
  }
  if(view.page==='users')view.users=(await api('/users')).items;
  if(view.page==='audit')view.audit=(await api('/audit')).items;
  if(view.page==='shifts')view.shift=(await api('/shifts')).shift;
  render();
}
function render(){
  if(!view.user){app.innerHTML=`<main class="auth-shell"><section class="auth-story" aria-label="Welcome to Rush IT"><div class="auth-brand">${RushBrand.mark}${RushBrand.wordmark}<p>Every delivery. Better connected.</p></div><div class="story-copy"><span class="eyebrow">YOUR COURIER WORKSPACE</span><h1>Precision in every move.<br>Confidence at every stop.</h1><p>Drivers, dispatch and deliveries.<br>One connected operating platform.</p></div>${RushBrand.artwork}<div class="story-footer"><span>Designed around people.</span><span>Built for the road. ↗</span></div></section><section class="auth-form-panel"><div class="auth-mobile-brand">${RushBrand.mark}${RushBrand.wordmark}</div><div class="auth-form-header"><span class="secure-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7Z"/><path d="m8 12 3 3 5-6"/></svg>Organisation sign-in</span><h2>Welcome back</h2><p>Sign in to your Rush IT account.</p></div><form id="login"><label for="login-email">Email address</label><div class="auth-input"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg><input id="login-email" name="email" type="email" autocomplete="username" placeholder="name@organisation.com" required maxlength="254"></div><label for="login-password">Password</label><div class="auth-input"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg><input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required maxlength="256"><button type="button" class="password-toggle" data-action="toggle-password" aria-label="Show password" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div><p id="login-error" class="error" role="alert"></p><button class="primary sign-in">Sign in <span aria-hidden="true">→</span></button></form><div class="auth-divider"><span>Protected access. Clear accountability.</span></div><div class="auth-help"><strong>Need access to your organisation?</strong><p>Contact your administrator to request an account or help with your password.</p></div><p class="auth-capabilities">Password sign-in is available. SSO, MFA and biometric sign-in are not enabled in this build.</p><div class="auth-bottom"><span>Rush IT · Courier operations</span><button type="button" class="link" data-action="login-privacy">Privacy & sign-in information</button></div></section></main>`;return;}
  const u=view.user;const admin=u.role==='admin';const operations=u.role!=='driver';
  const navigation=[['jobs',operations?'Dispatch':'My jobs'],...(operations?[['shifts','Active shifts']]:[]),...(admin?[['users','Users'],['audit','Audit trail']]:[])];
  const title=view.job?'Job details':view.page==='create'?'New booking':view.page==='users'?'People & access':view.page==='audit'?'Audit trail':view.page==='shifts'?'Driver availability':operations?'Dispatch workspace':'Your working day';
  app.innerHTML=`<aside><div class="brand workspace-brand">${RushBrand.mark}${RushBrand.wordmark}</div><nav>${navigation.map(([page,text])=>button(text,'page:'+page,view.page===page?'active':'')).join('')}</nav><div class="profile"><div><strong>${h(u.name)}</strong><small>${h(u.role)} · authenticated</small></div>${button('Sign out','logout')}</div></aside><main class="workspace"><header><div><p class="eyebrow">${operations?'OPERATIONS CONSOLE':'DRIVER WORKSPACE'}</p><h1>${title}</h1></div><span class="connection">${navigator.onLine?'● Connected':'● Offline — writes unavailable'}</span></header><div class="notice">Foundation build · shared server data and enforced permissions. Native mobile, offline sync, maps and delivery evidence are scheduled milestones.</div>${view.job?jobDetails():view.page==='create'?createForm():view.page==='users'?usersPage():view.page==='audit'?auditPage():view.page==='shifts'?shiftsPage():jobsPage()}<footer>Rush IT · independent courier platform · persistent local development database</footer></main>`;
}
function jobsPage(){
  const operations=view.user.role!=='driver';
  let list=view.jobs.filter(j=>`${j.reference} ${j.customer_name} ${j.destination} ${j.id}`.toLowerCase().includes(view.search.toLowerCase()));
  if(view.filter!=='all')list=list.filter(j=>view.filter==='urgent'?['Urgent','Critical','Time Sensitive'].includes(j.priority):j.status===view.filter);
  const urgent=view.jobs.filter(j=>['Urgent','Critical','Time Sensitive'].includes(j.priority)).length;
  return `<div class="stats"><div><span>Accessible jobs</span><strong>${view.total}</strong></div><div><span>Urgent on this page</span><strong>${urgent}</strong></div><div><span>${operations?'Review scope':'Shift status'}</span><strong>${operations?'Organisation':view.shift? h(view.shift.state):'Not started'}</strong></div></div>${!operations?`<div class="actions">${view.shift?button(view.shift.state==='Break'?'Resume shift':'Take break',view.shift.state==='Break'?'shift:resume':'shift:break')+button('Finish shift','shift:finish'):button('Start shift','shift:start','primary')}</div>`:''}<div class="toolbar"><h2>${operations?'Bookings & assignments':'Assigned work'}</h2><input id="search" aria-label="Search current page" placeholder="Search this page" value="${h(view.search)}"><select id="filter" aria-label="Filter jobs"><option value="all">All states</option>${['UNASSIGNED','ASSIGNED','ARRIVED_DELIVERY','FAILED','DELIVERED','urgent'].map(s=>`<option value="${s}" ${view.filter===s?'selected':''}>${s==='urgent'?'Urgent priority':labelStatus(s)}</option>`).join('')}</select>${operations?button('+ Create booking','create','primary'):''}${button('Refresh','refresh')}</div><div class="cards">${list.map(j=>`<button type="button" class="card" data-action="open:${j.id}"><div class="card-top"><span class="chip ${['Critical','Urgent'].includes(j.priority)?'urgent':''}">${h(j.priority)}</span><span class="chip">${h(labelStatus(j.status))}</span></div><h2>${h(j.destination||'Delivery')}</h2><p>${h(j.reference)}</p><p>${h(j.customer_name)} · ${h(j.service)}</p><small>${h(j.driver_name||'Awaiting assignment')}</small><small>${h(j.id.slice(0,8))} · revision ${j.version}</small></button>`).join('')}</div>${list.length===0?'<section class="empty"><h2>You’re all caught up.</h2><p>Assignments will appear here when dispatch allocates your work.</p></section>':''}<div class="toolbar">${view.offset>0?button('← Previous','previous'):''}<small>Showing ${view.total?view.offset+1:0}–${Math.min(view.offset+25,view.total)} of ${view.total}</small>${view.offset+25<view.total?button('Next →','next'):''}</div>`;
}
const driverActions={ASSIGNED:['accept','Accept job'],ACCEPTED:['travel_pickup','Travel to pickup'],EN_ROUTE_PICKUP:['arrive_pickup','Confirm pickup arrival'],ARRIVED_PICKUP:['pickup','Confirm pickup'],PICKED_UP:['travel_delivery','Travel to delivery'],EN_ROUTE_DELIVERY:['arrive_delivery','Confirm delivery arrival']};
function jobDetails(){const j=view.job;const operations=view.user.role!=='driver';const action=driverActions[j.status];return `${button('← Back to jobs','back','link')}<section class="detail-head"><div><p class="eyebrow">JOB ${h(j.id.slice(0,8))} / REVISION ${j.version}</p><h2>${h(j.reference)}</h2><p class="muted">${h(j.customer.name)} · ${h(j.service)}</p></div><div><span class="chip">${h(labelStatus(j.status))}</span> <span class="chip">${h(j.priority)}</span></div></section><div class="stats"><div><span>Shipment</span><strong>${j.shipment.item_count} items</strong></div><div><span>Weight / volume</span><strong>${j.shipment.weight_kg} kg</strong><small>${j.shipment.volume_m3} m³</small></div><div><span>Assigned driver</span><strong>${h(j.assignment?.name||'Unassigned')}</strong></div></div><div class="detail-grid"><section class="panel"><h2>Pickup & delivery</h2>${j.legs.map(l=>`<article class="stop"><p class="eyebrow">${l.sequence}. ${h(l.kind.toUpperCase())}</p><h3>${h(l.company)}</h3><p>${h(l.address)}, ${h(l.suburb)}</p><p class="muted">${h(time(l.window_start))} → ${h(time(l.window_end))}</p>${l.contact?`<p>Contact: ${h(l.contact)} ${h(l.phone)}</p>`:''}${l.instructions?`<p class="instructions">${h(l.instructions)}</p>`:''}<a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address+' '+l.suburb)}">Open navigation ↗</a></article>`).join('')}<h3>Delivery policy</h3><p>${h(j.policy.name)} · version ${j.policy.version}</p><p class="muted">Evidence upload and POD completion are not available in this foundation milestone.</p></section><section class="panel"><h2>Operational actions</h2>${button('Refresh job','refresh-job')}${operations?`${['UNASSIGNED','ASSIGNED','ACCEPTED'].includes(j.status)?`<form id="assign"><label>Assign driver<select name="driverId" required><option value="">Choose driver</option>${(view.catalogue?.drivers||[]).map(d=>`<option value="${d.id}">${h(d.name)}</option>`).join('')}</select></label><button class="primary">Save assignment</button></form>`:''}<div class="actions">${j.status==='UNASSIGNED'?button('Hold job','job:hold'):''}${j.status==='ON_HOLD'?button('Release hold','job:release'):''}${['UNASSIGNED','ASSIGNED','ACCEPTED','ON_HOLD'].includes(j.status)?button('Cancel job','job:cancel','danger'):''}${j.status==='FAILED'?button('Authorise reattempt','job:reattempt'):''}</div>`:`<p class="muted">Location is not continuously tracked. You can attach one GPS sample to your next action.</p>${button('Capture optional GPS sample','gps')}<p class="muted">${view.gps?'GPS sample ready; fresh samples expire after five minutes.':'No GPS sample attached.'}</p><div class="actions">${action?button(action[1],'job:'+action[0],'primary'):''}${j.status==='ARRIVED_DELIVERY'?button('Report failed attempt','job:fail','danger'):''}</div>${j.status==='ARRIVED_DELIVERY'?'<p class="notice">Pickup and arrival can be recorded. Successful delivery will be enabled with server-validated POD in the next execution milestone.</p>':''}`}<h3>Event timeline</h3>${j.events.map(e=>`<div class="event"><strong>${h(labelStatus(e.action))}</strong><p>${h(e.detail)}</p><small>${h(e.actor_name)} · ${h(time(e.received_at))}</small><small>${e.location_json?'GPS sample recorded':'No GPS sample'}</small></div>`).join('')}</section></div>`;}
function createForm(){const c=view.catalogue;return `${button('← Cancel','back','link')}<section class="panel"><form id="create-job" class="grid-form"><label>Customer<select name="customerId" required>${c.customers.map(x=>`<option value="${x.id}">${h(x.name)}</option>`).join('')}</select></label><label>Reference<input name="reference" required maxlength="120"></label><label>Service<input name="service" value="Standard" maxlength="40" required></label><label>Priority<select name="priority">${['Standard','Priority','Express','Urgent','Critical','Time Sensitive'].map(s=>`<option>${s}</option>`).join('')}</select></label>${['pickup','delivery'].map(kind=>`<h2 class="full">${labelStatus(kind)}</h2><label>Company<input name="${kind}Company" maxlength="150" required></label><label>Street address<input name="${kind}Address" required maxlength="250"></label><label>Suburb<input name="${kind}Suburb" required maxlength="100"></label><label>Contact<input name="${kind}Contact" maxlength="120"></label><label>Phone<input name="${kind}Phone" maxlength="40"></label><label>Instructions<textarea name="${kind}Instructions" maxlength="2000"></textarea></label><label>Window starts (your browser timezone)<input name="${kind}Start" type="datetime-local"></label><label>Window ends<input name="${kind}End" type="datetime-local"></label>`).join('')}<h2 class="full">Shipment & evidence policy</h2><label>Items<input name="items" type="number" min="1" max="10000" value="1" required></label><label>Weight (kg)<input name="weightKg" type="number" min="0" max="100000" step="0.01" required value="0"></label><label>Volume (m³)<input name="volumeM3" type="number" min="0" max="10000" step="0.001" required value="0"></label><label>Package type<input name="packageType" value="Parcel" maxlength="80" required></label><label>POD policy<select name="policyId">${c.policies.map(p=>`<option value="${p.id}">${h(p.name)}</option>`).join('')}</select></label><div class="full"><button class="primary">Create unassigned booking</button></div></form></section>`;}
function usersPage(){return `<section class="panel"><h2>Add an account</h2><form id="create-user" class="grid-form"><label>Name<input name="name" required maxlength="120"></label><label>Email<input name="email" type="email" required maxlength="254"></label><label>Role<select name="role"><option value="driver">Driver</option><option value="dispatcher">Dispatcher</option><option value="admin">Organisation admin</option></select></label><label>Initial password<input name="password" type="password" autocomplete="new-password" minlength="12" maxlength="256" required></label><div class="full"><button class="primary">Create account</button></div></form><p class="muted">Secure account invitation, forced initial password change and recovery are production-hardening milestones.</p></section><section class="panel table-wrap"><h2>Organisation accounts</h2><table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>${view.users.map(u=>`<tr><td>${h(u.name)}</td><td>${h(u.email)}</td><td>${h(u.role)}</td></tr>`).join('')}</tbody></table></section>`;}
function auditPage(){return `<section class="panel table-wrap"><h2>Latest 100 audit records</h2><table><thead><tr><th>Time</th><th>Action</th><th>Change</th><th>Resource</th></tr></thead><tbody>${view.audit.map(a=>`<tr><td>${h(time(a.created_at))}</td><td>${h(a.action)}</td><td>${h(a.detail)}</td><td>${h(a.resource_id.slice(0,8))}</td></tr>`).join('')}</tbody></table></section>`;}
function shiftsPage(){return `<section class="panel table-wrap"><h2>Active driver shifts</h2><table><thead><tr><th>Driver</th><th>Status</th><th>Started</th></tr></thead><tbody>${(view.shift||[]).map(s=>`<tr><td>${h(s.name)}</td><td><span class="chip">${h(s.state)}</span></td><td>${h(time(s.started_at))}</td></tr>`).join('')}</tbody></table>${!view.shift?.length?'<p class="muted">No active shifts. Drivers become available when they start a shift.</p>':''}</section>`;}
async function mutate(url,body){return api(url,{method:'POST',body,key:crypto.randomUUID()});}
async function openJob(id){view.job=await api('/jobs/'+id);view.gps=null;if(view.user.role!=='driver')view.catalogue=await api('/catalogue');render();}
app.addEventListener('click',async event=>{
  const target=event.target.closest('[data-action]');if(!target||view.busy)return;
  const action=target.dataset.action;
  if(action==='toggle-password'){
    const input=document.querySelector('#login-password');const visible=input.type==='password';
    input.type=visible?'text':'password';target.setAttribute('aria-label',visible?'Hide password':'Show password');target.setAttribute('aria-pressed',String(visible));return;
  }
  if(action==='login-privacy'){
    const dialog=document.createElement('dialog');dialog.className='privacy-dialog';
    dialog.innerHTML=`<h2>Sign-in & privacy</h2><p>This local Rush IT build uses your email and password to authenticate your organisation account. Only a salted password hash is stored on the server.</p><p>An HttpOnly session cookie keeps you signed in for up to eight hours. Signing out revokes it. This login does not collect continuous location or biometric data.</p><p>Operational records are stored in the local development database. Retention, access/correction requests and production hosting require the governance review before real operational use.</p><form method="dialog"><button class="primary">Close</button></form>`;
    dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();return;
  }
  view.busy=true;target.disabled=true;
  try{
    if(action==='logout'){await api('/auth/logout',{method:'POST',body:{}});view.user=null;view.job=null;stream?.close();render();}
    else if(action.startsWith('page:')){view.page=action.slice(5);view.job=null;view.offset=0;await load();}
    else if(action==='create'){view.catalogue=await api('/catalogue');view.page='create';view.job=null;render();}
    else if(action==='back'){view.job=null;view.page='jobs';await load();}
    else if(action==='refresh'){await load();}
    else if(action.startsWith('open:'))await openJob(action.slice(5));
    else if(action==='refresh-job')await openJob(view.job.id);
    else if(action==='next'||action==='previous'){view.offset+=action==='next'?25:-25;await load();}
    else if(action.startsWith('shift:')){view.shift=(await mutate('/shifts',{action:action.slice(6)})).shift;await load();}
    else if(action==='gps'){
      if(!navigator.geolocation)throw new Error('Location is unavailable on this device.');
      const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:10000,maximumAge:0}));
      view.gps={latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy,sampledAt:new Date(position.timestamp).toISOString()};render();
    }
    else if(action.startsWith('job:')){
      const command=action.slice(4);let reason;
      if(['hold','cancel','fail','reattempt'].includes(command)){reason=prompt('Record the operational reason:');if(!reason?.trim())return;}
      const body={action:command,version:view.job.version,occurredAt:new Date().toISOString()};
      if(reason)body.reason=reason;if(view.gps)body.location=view.gps;
      view.job=await mutate('/jobs/'+view.job.id+'/actions',body);view.gps=null;render();toast('Action accepted by the server.');
    }
  }catch(error){toast(error.message);}finally{view.busy=false;if(target.isConnected)target.disabled=false;}
});
app.addEventListener('submit',async event=>{
  event.preventDefault();if(view.busy)return;const form=event.target;const data=Object.fromEntries(new FormData(form));
  view.busy=true;const submit=form.querySelector('button:not([type="button"])');submit.disabled=true;
  try{
    if(form.id==='login'){view.user=(await api('/auth/login',{method:'POST',body:data})).user;view.page='dashboard';view.job=null;view.offset=0;connect();await load();}
    if(form.id==='create-user'){await api('/users',{method:'POST',body:data});await load();toast('Account created.');}
    if(form.id==='assign'){view.job=await mutate('/jobs/'+view.job.id+'/assignment',{driverId:data.driverId,version:view.job.version});render();toast('Assignment saved.');}
    if(form.id==='create-job'){
      const body={customerId:data.customerId,reference:data.reference,service:data.service,priority:data.priority,policyId:data.policyId,
        shipment:{items:Number(data.items),weightKg:Number(data.weightKg),volumeM3:Number(data.volumeM3),packageType:data.packageType}};
      for(const kind of ['pickup','delivery'])body[kind]={company:data[kind+'Company'],address:data[kind+'Address'],suburb:data[kind+'Suburb'],contact:data[kind+'Contact'],phone:data[kind+'Phone'],instructions:data[kind+'Instructions'],...(data[kind+'Start']?{windowStart:new Date(data[kind+'Start']).toISOString()}:{}),...(data[kind+'End']?{windowEnd:new Date(data[kind+'End']).toISOString()}: {})};
      view.job=await mutate('/jobs',body);view.page='jobs';render();toast('Booking created. Allocate it to a driver.');
    }
  }catch(error){if(form.id==='login'){document.querySelector('#login-error').textContent=error.message;}else toast(error.message);}
  finally{view.busy=false;if(submit.isConnected)submit.disabled=false;}
});
app.addEventListener('change',event=>{if(event.target.id==='filter'){view.filter=event.target.value;render();}});
app.addEventListener('input',event=>{if(event.target.id==='search')view.search=event.target.value;});
app.addEventListener('keydown',event=>{if(event.target.id==='search'&&event.key==='Enter'){event.preventDefault();render();}});
window.addEventListener('online',()=>{toast('Connection restored. Refresh to retrieve authoritative state.');});
window.addEventListener('offline',()=>toast('Offline. This foundation cannot queue mutations yet. No action is reported as synced.'));
(async()=>{try{view.user=(await api('/auth/me')).user;connect();await load();}catch{render();}})();


