const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const pages = {
  Visitors: { icon:'♙', title:'Visitors', description:'Pre-approve and track visitors for your home.', action:'Pre-approve visitor', list:'/visitors', create:'/visitors/pre-approve' },
  MyPasses: { icon:'▣', title:'My passes', description:'Manage the visitor passes associated with your home.', action:'Create a visitor pass', list:'/visitors', create:'/visitors/pre-approve' },
  Payments: { icon:'₹', title:'Payments', description:'View maintenance, utility and rent invoices.', action:'Refresh invoices', list:'/payments' },
  Security: { icon:'◈', title:'Security', description:'Raise a security alert or manage household exit permissions.', action:'Raise a security alert', list:'/security/alerts', create:'/security/alert' },
  'Exit permissions': { icon:'↗', title:'Exit permissions', description:'Create and review household exit permissions.', action:'Add exit permission', list:'/security/exit-permissions', create:'/security/exit-permissions' },
  'Help desk': { icon:'▤', title:'Help desk', description:'Submit a complaint and follow its status.', action:'Raise a complaint', list:'/helpdesk/complaints', create:'/helpdesk/complaints' },
  'Ask Society': { icon:'☷', title:'Ask Society', description:'Post a question or update for your neighbors.', action:'Create a community post', list:'/community/posts', create:'/community/posts' },
  'Notice board': { icon:'▧', title:'Notice board', description:'Read announcements published for your community.', action:'Refresh notices', list:'/notice-board', create:'/notice-board' },
  Directory: { icon:'▦', title:'Directory', description:'Search residents who have chosen to share their contact details.', action:'Search residents', list:'/directory/residents' },
  'Home planner': { icon:'◷', title:'Home planner', description:'Create and manage household reminders.', action:'Add a reminder', list:'/home-planner/reminders', create:'/home-planner/reminders' },
  'Rent a parking': { icon:'▤', title:'Rent a parking', description:'View available parking and offer a space for rent.', action:'Offer my parking space', list:'/parking/available', create:'/parking/rent' },
  'Manage locks': { icon:'▣', title:'Manage lockers', description:'View and list community lockers.', action:'List a locker', list:'/locks/available', create:'/locks/listings' },
  'Elections & surveys': { icon:'✓', title:'Elections & surveys', description:'View community surveys and submit your response.', action:'Refresh surveys', list:'/elections/surveys', create:'/elections/surveys' },
  Communications: { icon:'✉', title:'Communications', description:'View and send community messages.', action:'Start a conversation', list:'/communications/messages', create:'/communications/messages' },
  Documents: { icon:'▱', title:'Documents', description:'Keep document metadata associated with your account.', action:'Add a document', list:'/documents', create:'/documents' },
  'My complex': { icon:'⌂', title:'My complex', description:'A summary of real records stored for your community.', list:'/complex/overview' },
  Notifications: { icon:'♧', title:'Notifications', description:'View system notifications available to your account.', list:'/notifications' },
  'Search residents': { icon:'⌕', title:'Search residents', description:'Search residents who have opted to share contact details.', action:'Search residents', list:'/directory/residents' },
  Settings: { icon:'⚙', title:'Household settings', description:'Manage family members, pets, vehicles and daily help.', action:'Update household details', list:'/users/me' },
  'Account management': { icon:'◎', title:'Account management', description:'Update your account profile.', action:'Update account details', list:'/users/me' },
  'Support & feedback': { icon:'♡', title:'Support & feedback', description:'Send a society or app support request.', action:'Send feedback', list:'/support/feedback', create:'/support/feedback' },
  'Trending services': { icon:'↗', title:'Trending services', description:'Browse services published for your community.', action:'Request a service', list:'/services/catalog?category=trending', create:'/services/bookings' },
  'Urban Company': { icon:'✳', title:'Home services', description:'Browse home services published for your community.', action:'Request a service', list:'/services/catalog?category=home', create:'/services/bookings' },
  'Additional services': { icon:'＋', title:'Additional services', description:'Browse travel, fuel, property and paperwork services.', action:'Request a service', list:'/services/catalog?category=additional', create:'/services/bookings' },
  Marketplace: { icon:'◇', title:'Buy & sell', description:'Browse items listed by your community.', action:'List an item for sale', list:'/marketplace/items', create:'/marketplace/items' },
  Homes: { icon:'⌂', title:'Homes', description:'Browse apartments listed for sale or rent.', action:'List a home', list:'/homes', create:'/homes/list' },
  Services: { icon:'✳', title:'Services', description:'Browse service listings available to your community.', action:'Request a service', list:'/services/catalog', create:'/services/bookings' },
};

const createFields = {
  Visitors: [['title','Visitor name','text',true],['description','Visit details (type, date and time)','text',true],['phone','Phone number','tel',false]],
  MyPasses: [['title','Visitor name','text',true],['description','Visit details (type, date and time)','text',true]],
  Security: [['title','Alert type','text',true],['description','What is happening?','textarea',true]],
  'Help desk': [['title','Complaint subject','text',true],['description','Describe the issue','textarea',true]],
  'Ask Society': [['title','Post title','text',true],['description','Message','textarea',true]],
  'Notice board': [['title','Announcement title','text',true],['description','Announcement details','textarea',true]],
  'Elections & surveys': [['title','Survey title','text',true],['description','Question and available options','textarea',true]],
  'Exit permissions': [['title','Person allowed to exit','text',true],['description','Date, time and guardian details','textarea',true]],
  'Home planner': [['title','Reminder','text',true],['description','Date and time','text',true]],
  'Rent a parking': [['title','Parking space','text',true],['description','Location, availability and rent','text',true],['amount','Monthly rent (INR)','number',true]],
  'Manage locks': [['title','Locker','text',true],['description','Location and sale/rent details','text',true],['amount','Price (INR)','number',false]],
  Communications: [['title','Recipient or group','text',true],['description','Message','textarea',true]],
  Documents: [['title','Document name','text',true],['description','Document category or storage reference','text',true]],
  'Support & feedback': [['title','Subject','text',true],['description','Details','textarea',true]],
  'Trending services': [['title','Service requested','text',true],['description','Preferred date and details','textarea',false]],
  'Urban Company': [['title','Service requested','text',true],['description','Preferred date and details','textarea',false]],
  'Additional services': [['title','Service requested','text',true],['description','Preferred date and details','textarea',false]],
  Services: [['title','Service requested','text',true],['description','Preferred date and details','textarea',false]],
  Marketplace: [['title','Item for sale','text',true],['description','Condition and price','textarea',true],['amount','Price (INR)','number',false]],
  Homes: [['title','Property listing','text',true],['description','Sale/rent, location and details','textarea',true],['amount','Price (INR)','number',false]],
};

const apiCache = {};
let currentUser = null;
let currentPage = 'Dashboard';
let authMode = 'login';
let directoryMode = 'residents';
const apiUrl = () => (localStorage.getItem('nivora:apiUrl') || 'http://localhost:3000').replace(/\/$/, '');
const authToken = () => sessionStorage.getItem('nivora:accessToken');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// Remove the old browser-only demo records left by earlier preview versions.
for (const key of Object.keys(localStorage)) if (key.startsWith('nivora:') && !['nivora:apiUrl','nivora:user'].includes(key)) localStorage.removeItem(key);

async function apiRequest(path, options = {}) {
  if (!authToken()) throw new Error('Sign in to load or save community data.');
  const response = await fetch(`${apiUrl()}${path}`, {
    ...options,
    headers: { 'Content-Type':'application/json', Authorization:`Bearer ${authToken()}`, ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(Array.isArray(payload.message) ? payload.message.join(', ') : (payload.message || `API request failed (${response.status}).`));
  return payload;
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => element.classList.remove('show'), 3500);
}

function setAccount(user) {
  currentUser = user || null;
  const name = user?.name || 'Sign in';
  const initials = user?.name ? user.name.split(/\s+/).map((part) => part[0]).slice(0,2).join('').toUpperCase() : '↪';
  $('#accountButton').textContent = initials;
  $('.profile-mini .avatar').textContent = initials;
  $('.profile-mini b').textContent = name;
  $('.profile-mini small').textContent = user ? `${user.role || 'resident'} · ${user.societyId || ''}` : 'Connect to your community';
  $('.society-picker b').textContent = user?.societyId || 'Your community';
  $('.society-picker small').textContent = 'Resident portal';
}

function renderAuth() {
  const signingUp = authMode === 'register';
  $('#authTitle').textContent = signingUp ? 'Create your account' : 'Welcome back';
  $('#authSubtitle').textContent = signingUp ? 'Join your community in just a few steps.' : 'Sign in to continue to your community.';
  $('#authSubmit').innerHTML = `${signingUp ? 'Create account' : 'Sign in'} <span>→</span>`;
  $('#authSwitchText').textContent = signingUp ? 'Already have an account?' : 'New to your community?';
  $('#authModeToggle').textContent = signingUp ? 'Sign in' : 'Create an account';
  $('#authFields').innerHTML = `${signingUp ? '<label>Full name<input name="name" autocomplete="name" minlength="2" placeholder="Your name" required /></label>' : ''}<label>Email address<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label><label>Password<input name="password" type="password" autocomplete="${signingUp ? 'new-password' : 'current-password'}" minlength="8" placeholder="${signingUp ? 'At least 8 characters' : 'Enter your password'}" required /></label>`;
}

function recordsFor(page) { return Array.isArray(apiCache[page]) ? apiCache[page] : []; }
function detailOf(record) { return record.description || record.status || ''; }
function rowAction(page, record) {
  if (page === 'Payments') return record.status === 'completed' ? 'Paid' : 'Pay now';
  if (page === 'Rent a parking') return 'Book';
  if (page === 'Marketplace') return 'Reserve';
  if (['Services','Trending services','Urban Company','Additional services'].includes(page)) return 'Request';
  if (page === 'Elections & surveys') return 'Vote';
  if (page === 'Directory' || page === 'Search residents') return record.phone ? 'Call' : 'Resident';
  return record.status || 'View';
}

function renderFeature(page) {
  const config = pages[page];
  if (!config) return;
  if (page === 'Logout') { signOut(); return; }
  const profile = ['Settings','Account management'].includes(page);
  const rows = profile ? profileRows(apiCache[page]) : recordsFor(page);
  const rowsHtml = rows.map((record) => {
    const title = profile ? record[0] : (record.name || record.title || 'Untitled record');
    const detail = profile ? record[1] : page === 'Payments' ? [record.description,record.data?.amount?`₹${Number(record.data.amount).toLocaleString('en-IN')}`:''].filter(Boolean).join(' · ') : page === 'Directory' && directoryMode === 'vehicles' ? (record.vehicles || []).join(' · ') : detailOf(record);
    const action = profile ? 'Edit' : rowAction(page, record);
    const id = profile ? '' : record._id;
    const button = action === 'Paid' || action === 'Resident' ? `<span class="feature-chip">${esc(action)}</span>` : `<button class="feature-row-button" data-row-action="${esc(action)}" data-row-id="${esc(id)}" data-row-title="${esc(title)}" aria-label="${esc(action)} ${esc(title)}">${action === 'Call' ? '☎' : '→'}</button>`;
    return `<div class="feature-row"><div class="feature-row-icon">${esc(config.icon)}</div><div class="feature-row-main"><b>${esc(title)}</b><small>${esc(detail || 'No additional details')}</small></div><span class="feature-chip">${esc(action)}</span>${button}</div>`;
  }).join('') || `<div class="empty-message">No ${esc(config.title.toLowerCase())} to show yet.</div>`;
  const admin = currentUser?.role === 'admin';
  const servicePages = ['Services','Trending services','Urban Company','Additional services'];
  const action = page === 'Payments' ? 'Refresh invoices' : (['Notice board','Elections & surveys'].includes(page) ? (admin ? (page === 'Notice board' ? 'Publish notice' : 'Create survey') : config.action) : (servicePages.includes(page) && admin ? 'Publish service' : config.action));
  const actionButton = action ? `<button class="primary-button" data-action="${esc(action)}">${esc(action)}</button>` : '';
  const profileFields = profile ? profileEditor(apiCache[page]) : '';
  $('#featurePage').innerHTML = `<div class="feature-heading"><div><div class="section-kicker">${esc(currentUser?.societyId || 'COMMUNITY')}</div><h1>${esc(config.title)}</h1><p>${esc(config.description)}</p></div><div class="feature-actions"><button class="secondary-button" data-page="Dashboard">← Dashboard</button>${actionButton}</div></div><div class="feature-columns"><section class="feature-panel"><h2>${esc(config.title)}</h2>${rowsHtml}${['Directory','Search residents'].includes(page) ? `<form class="inline-form" data-search-residents><input name="q" placeholder="Search residents by name or email" aria-label="Search residents"/><button type="submit">Search</button></form>` : ''}</section>${profile ? `<aside class="feature-panel"><h2>Edit profile</h2>${profileFields}<button class="primary-button" data-action="Save profile">Save profile</button></aside>` : ''}</div>`;
  if (page === 'Directory') {
    const input = $('#featurePage').querySelector('[data-search-residents] input');
    input.insertAdjacentHTML('beforebegin', '<select name="mode" aria-label="Directory category"><option value="residents">Residents</option><option value="vehicles">Vehicles</option><option value="emergency">Emergency contacts</option></select>');
    $('#featurePage').querySelector('[data-search-residents] select').value = directoryMode;
  }
  $('#featurePage').hidden = false;
}

function profileRows(user) {
  if (!user || typeof user !== 'object') return [];
  return [
    ['Name', user.name || ''], ['Email', user.email || ''], ['Phone', user.phone || ''],
    ['Family members', (user.familyMembers || []).map((item) => `${item.name} (${item.relation || 'family'})`).join(', ')],
    ['Vehicles', (user.vehicles || []).join(', ')], ['Pets', (user.pets || []).join(', ')], ['Daily help', (user.dailyHelp || []).join(', ')],
  ];
}

function profileEditor(user) {
  if (!user) return '<p class="feature-note">Sign in to load your profile.</p>';
  return `<form id="profileForm"><label>Name<input name="name" value="${esc(user.name || '')}" required /></label><label>Email<input name="email" type="email" value="${esc(user.email || '')}" required /></label><label>Phone<input name="phone" value="${esc(user.phone || '')}" /></label><label>Family members (one per line: name, relationship)<textarea name="familyMembers">${esc((user.familyMembers || []).map((item) => `${item.name}, ${item.relation || ''}`).join('\n'))}</textarea></label><label>Vehicles (one per line)<textarea name="vehicles">${esc((user.vehicles || []).join('\n'))}</textarea></label><label>Pets (one per line)<textarea name="pets">${esc((user.pets || []).join('\n'))}</textarea></label><label>Daily help (one per line)<textarea name="dailyHelp">${esc((user.dailyHelp || []).join('\n'))}</textarea></label><label><input type="checkbox" name="shareContactDetails" ${user.shareContactDetails ? 'checked' : ''}/> Share my contact details with community residents</label></form>`;
}

function renderDashboard(data = {}) {
  const visitors = Array.isArray(data.visitors) ? data.visitors : [];
  const invoices = Array.isArray(data.invoices) ? data.invoices : [];
  const complaints = Array.isArray(data.complaints) ? data.complaints : [];
  const notices = Array.isArray(data.notices) ? data.notices : [];
  const reminders = Array.isArray(data.reminders) ? data.reminders : [];
  const pending = invoices.filter((item) => item.status !== 'completed');
  const unpaid = pending.reduce((total, item) => total + (Number(item.data?.amount) || 0), 0);
  const greeting = currentUser?.name ? `Welcome, ${esc(currentUser.name)}` : 'Welcome to Nivora';
  const visitorRows = visitors.slice(0,4).map((record) => `<div class="visitor-row"><div class="visitor-avatar person">${esc(record.title?.slice(0,1) || '•')}</div><div class="visitor-info"><b>${esc(record.title || 'Visitor')}</b><span>${esc(detailOf(record))}</span></div><div class="visitor-time"><b>${esc(record.status || 'open')}</b></div><span class="status-pill expected">${esc(record.data?.type || 'visitor')}</span></div>`).join('') || '<div class="empty-message">No visitor records yet.</div>';
  const noticeRows = notices.slice(0,2).map((record) => `<div class="notice-secondary"><span class="secondary-icon">♧</span><span><b>${esc(record.title || 'Announcement')}</b><small>${esc(detailOf(record))}</small></span></div>`).join('') || '<div class="empty-message">No announcements have been published.</div>';
  const reminderRows = reminders.slice(0,3).map((record) => `<div class="planner-event"><div class="event-time"><b>•</b></div><div class="event-mark"></div><div class="event-details"><b>${esc(record.title)}</b><span>${esc(detailOf(record))}</span></div></div>`).join('') || '<div class="empty-message">No reminders yet.</div>';
  $('#dashboardPage').innerHTML = `<section class="welcome-row"><div><div class="eyebrow"><span class="sun">☀</span> ${esc(new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date()).toUpperCase())}</div><h1>${greeting}</h1><p>Here is what is happening in your community today.</p></div><button class="primary-button" data-action="Pre-approve visitor">＋ Pre-approve visitor</button></section><section class="stats-grid"><article class="stat-card"><div class="stat-heading"><span>Visitors</span></div><div class="stat-value">${visitors.length}</div><div class="stat-foot">For your household</div></article><article class="stat-card"><div class="stat-heading"><span>Invoices due</span></div><div class="stat-value">${pending.length}</div><div class="stat-foot">Unpaid amount ₹${unpaid.toLocaleString('en-IN')}</div></article><article class="stat-card"><div class="stat-heading"><span>Open requests</span></div><div class="stat-value">${complaints.filter((item) => !['resolved','completed'].includes(item.status)).length}</div><div class="stat-foot">Need your attention</div></article><article class="stat-card"><div class="stat-heading"><span>Announcements</span></div><div class="stat-value">${notices.length}</div><div class="stat-foot">For your community</div></article></section><section class="dashboard-grid"><article class="panel visitor-panel"><div class="panel-header"><div><div class="section-kicker">GATE ACTIVITY</div><h2>Visitors</h2></div><button class="subtle-button" data-page="Visitors">View all →</button></div><div class="visitor-list">${visitorRows}</div></article><article class="panel notice-panel"><div class="panel-header"><div><div class="section-kicker">COMMUNITY</div><h2>Announcements</h2></div><button class="round-arrow" data-page="Notice board">↗</button></div>${noticeRows}</article></section><section class="bottom-grid"><article class="panel shortcuts-panel"><div class="panel-header"><div><div class="section-kicker">FEATURES</div><h2>Community services</h2></div><button class="subtle-button" data-page="My complex">View summary →</button></div><div class="shortcut-grid">${[['Visitors','Visitors'],['Payments','Payments'],['Security','Security'],['Directory','Directory'],['Help desk','Help desk'],['Home planner','Home planner']].map(([label,page])=>`<button class="shortcut" data-page="${page}"><b>${label}</b><small>Open ${label.toLowerCase()}</small></button>`).join('')}</div></article><article class="panel planner-panel"><div class="panel-header"><div><div class="section-kicker">HOUSEHOLD</div><h2>Reminders</h2></div><button class="round-arrow" data-page="Home planner">↗</button></div>${reminderRows}<button class="add-reminder" data-action="Add a reminder">＋ Add a reminder</button></article></section>`;
  $('#authScreen').hidden=true;
  $('.app-shell').hidden=false;
  $('#dashboardPage').style.display = '';
  $('#featurePage').hidden = true;
}

async function loadDashboard() {
  if (!authToken()) { renderSignedOut(); return; }
  try {
    const [visitors,invoices,complaints,notices,reminders,user] = await Promise.all([
      apiRequest('/visitors'), apiRequest('/payments'), apiRequest('/helpdesk/complaints'), apiRequest('/notice-board'), apiRequest('/home-planner/reminders'), apiRequest('/users/me'),
    ]);
    setAccount(user);
    renderDashboard({ visitors,invoices,complaints,notices,reminders });
  } catch (error) { onApiError(error); renderSignedOut(error.message); }
}

function renderSignedOut(message = '') {
  currentPage='Dashboard';
  $('#currentPage').textContent='Dashboard';
  $('#featurePage').hidden=true;
  $('#dashboardPage').style.display='';
  $$('.nav-item[data-page]').forEach((item)=>item.classList.toggle('active',item.dataset.page==='Dashboard'));
  $('.app-shell').hidden=true;
  $('#authScreen').hidden=false;
  renderAuth();
  setAuthMessage(message);
}

function setAuthMessage(message = '') {
  const box=$('#authMessage');
  box.textContent=message;
  box.hidden=!message;
}

async function loadFeature(page, query = '', requestedDirectoryMode = directoryMode) {
  if (!authToken()) { authMode='login'; showAuth(); return; }
  const config = pages[page];
  if (!config) return;
  try {
    let path = config.list;
    if (page === 'Directory') {
      directoryMode = requestedDirectoryMode || 'residents';
      path = directoryMode === 'vehicles' ? '/directory/vehicles' : directoryMode === 'emergency' ? '/directory/emergency' : '/directory/residents';
      if (query && directoryMode !== 'emergency') path += `?q=${encodeURIComponent(query)}`;
    } else if (page === 'Search residents') path += `?q=${encodeURIComponent(query)}`;
    const result = await apiRequest(path);
    apiCache[page] = page === 'My complex' ? Object.entries(result.counts || {}).map(([title,count]) => ({ title, description:`${count} records`, status:'Summary' })) : result;
    if (['Settings','Account management'].includes(page)) { setAccount(result); }
    renderFeature(page);
  } catch (error) { onApiError(error); toast(`${config.title}: ${error.message}`); }
}

function onApiError(error) {
  if (/401|unauthorized/i.test(error.message)) { clearSession(); renderSignedOut('Your session expired. Sign in again.'); }
}

function clearSession() {
  sessionStorage.removeItem('nivora:accessToken');
  localStorage.removeItem('nivora:user');
  currentUser = null;
  Object.keys(apiCache).forEach((key) => delete apiCache[key]);
  setAccount(null);
}

async function signOut() {
  try { if (authToken()) await apiRequest('/auth/logout',{method:'POST',body:'{}'}); } catch { /* discard local session even if API is offline */ }
  clearSession();
  currentPage='Dashboard';
  renderSignedOut();
  toast('Signed out.');
}

function navigate(page) {
  if (page === 'Logout') { void signOut(); return; }
  if (page === 'Dashboard') { currentPage=page; $('#currentPage').textContent='Dashboard'; $$('.nav-item[data-page]').forEach((item)=>item.classList.toggle('active',item.dataset.page==='Dashboard')); void loadDashboard(); return; }
  if (!authToken()) { authMode='login'; showAuth(); return; }
  currentPage = page;
  $('#currentPage').textContent = pages[page]?.title || page;
  $('#dashboardPage').style.display='none';
  $('#featurePage').hidden=false;
  $$('.nav-item[data-page]').forEach((item) => item.classList.toggle('active', item.dataset.page === page));
  void loadFeature(page);
  window.scrollTo({top:0,behavior:'smooth'});
}

function openCreateForm(page, customAction) {
  if (!authToken()) { authMode='login'; showAuth(); return; }
  if (page === 'Payments') { void loadFeature('Payments'); toast('Invoices must be created by a community administrator.'); return; }
  if (['Directory','Search residents'].includes(page)) { $('#featurePage').querySelector('[data-search-residents] input')?.focus(); return; }
  if ((page === 'Notice board' || page === 'Elections & surveys') && currentUser?.role !== 'admin') { void loadFeature(page); return toast('Only community administrators can publish this content.'); }
  if (['Settings','Account management'].includes(page)) { $('#featurePage').querySelector('#profileForm')?.scrollIntoView({behavior:'smooth'}); return; }
  const fields = createFields[page] || [['title','Title','text',true],['description','Details','textarea',false]];
  const serviceAdmin = currentUser?.role === 'admin' && ['Services','Trending services','Urban Company','Additional services'].includes(page);
  const renderFields = serviceAdmin ? [['title','Service name','text',true],['description','Description','textarea',true],['category','Catalog category (trending, home, additional)','text',true]] : fields;
  $('#actionTitle').textContent = customAction || pages[page]?.action || 'Create record';
  $('#actionFields').innerHTML = renderFields.map(([name,label,type,required]) => `<label>${esc(label)}${type==='textarea'?`<textarea name="${name}" ${required?'required':''}></textarea>`:`<input name="${name}" type="${type}" ${required?'required':''} ${type==='number'?'min="0" step="0.01"':''}/>`}</label>`).join('');
  $('#actionForm').dataset.page=page;
  $('#actionForm').dataset.action=customAction || pages[page]?.action || 'Create record';
  $('#actionForm').dataset.serviceAdmin=String(serviceAdmin);
  $('#actionModal').showModal();
}

async function submitCreate(event) {
  event.preventDefault();
  const form=event.currentTarget;
  const page=form.dataset.page;
  const values=Object.fromEntries(new FormData(form).entries());
  const config=pages[page];
  const serviceAdmin=form.dataset.serviceAdmin==='true';
  if (!config?.create) return toast('This feature does not accept new records from your account.');
  const {title,description,amount,...extra}=values;
  const body={ title:title || config.title, description:description || '', data:extra };
  if (amount !== undefined && amount !== '') body.amount=Number(amount);
  try {
    await apiRequest(serviceAdmin?'/services/catalog':config.create,{method:'POST',body:JSON.stringify(body)});
    $('#actionModal').close(); form.reset();
    toast(`${config.title} saved.`);
    await loadFeature(page);
    if (currentPage==='Dashboard') await loadDashboard();
  } catch(error) { toast(`Could not save: ${error.message}`); }
}

async function submitProfile(event) {
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const lines=(name)=>String(data.get(name)||'').split(/\r?\n/).map((line)=>line.trim()).filter(Boolean);
  const familyMembers=lines('familyMembers').map((line)=>{const [name,...rel]=line.split(',');return {name:name.trim(),relation:rel.join(',').trim()};});
  const body={name:data.get('name'),email:data.get('email'),phone:data.get('phone'),familyMembers,vehicles:lines('vehicles'),pets:lines('pets'),dailyHelp:lines('dailyHelp'),shareContactDetails:data.has('shareContactDetails')};
  try { const user=await apiRequest('/users/me',{method:'PUT',body:JSON.stringify(body)}); setAccount(user); apiCache[currentPage]=user; renderFeature(currentPage); toast('Profile saved.'); }
  catch(error){toast(`Profile update failed: ${error.message}`);}
}

async function beginPayment(invoiceId) {
  if (!invoiceId) return toast('This invoice is not in the database.');
  try {
    const order=await apiRequest('/payments/pay',{method:'POST',body:JSON.stringify({invoiceId})});
    if (!window.Razorpay) await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=()=>reject(new Error('Razorpay Checkout could not load.'));document.head.appendChild(script);});
    const checkout=new window.Razorpay({key:order.keyId,amount:order.amount,currency:order.currency,name:'Nivora',description:order.description,order_id:order.orderId,theme:{color:'#255b48'},handler:async(response)=>{try{await apiRequest('/payments/verify',{method:'POST',body:JSON.stringify({invoiceId:order.invoiceId,...response})});toast('Test payment verified and invoice updated.');await loadFeature('Payments');}catch(error){toast(`Payment verification failed: ${error.message}`);}},modal:{ondismiss:()=>toast('Checkout closed; invoice is still unpaid.')}});
    checkout.open();
  } catch(error){toast(`Could not start Razorpay test checkout: ${error.message}`);}
}

async function handleRowAction(button) {
  const action=button.dataset.rowAction;
  const id=button.dataset.rowId;
  const page=currentPage;
  try {
    if (action==='Pay now') return void beginPayment(id);
    if (action==='Request' && ['Services','Trending services','Urban Company','Additional services'].includes(page)) { const service=recordsFor(page).find((record)=>record._id===id); await apiRequest('/services/bookings',{method:'POST',body:JSON.stringify({title:service?.title || 'Service request',description:service?.description || '',data:{serviceListingId:id}})}); }
    else if (page==='Rent a parking' && action==='Book') await apiRequest(`/parking/book/${encodeURIComponent(id)}`,{method:'POST',body:'{}'});
    else if (page==='Marketplace' && action==='Reserve') await apiRequest(`/marketplace/buy/${encodeURIComponent(id)}`,{method:'POST',body:'{}'});
    else if (page==='Elections & surveys' && action==='Vote') { const option=window.prompt('Enter your survey response'); if(!option)return; await apiRequest(`/elections/vote/${encodeURIComponent(id)}`,{method:'POST',body:JSON.stringify({option})}); }
    else if (action==='Call') { const person=recordsFor(page).find((record)=>record._id===id); if(person?.phone) window.location.href=`tel:${person.phone}`; else toast('This resident has not shared a phone number.'); return; }
    else if (action==='Edit' && ['Settings','Account management'].includes(page)) return void $('#featurePage').querySelector('#profileForm')?.scrollIntoView({behavior:'smooth'});
    else { toast(`${action} is not available for this record yet.`); return; }
    toast(`${action} completed.`); await loadFeature(page);
  } catch(error){toast(`${action} failed: ${error.message}`);}
}

function showAuth() { authMode='login'; $('.app-shell').hidden=true; $('#authScreen').hidden=false; renderAuth(); setAuthMessage(''); }

$('#accountButton').addEventListener('click',()=>authToken()?navigate('Account management'):showAuth());
$('#authModeToggle').addEventListener('click',()=>{authMode=authMode==='login'?'register':'login';renderAuth();setAuthMessage('');});
$('#authForm').addEventListener('submit',async(event)=>{
  event.preventDefault();
  const form=Object.fromEntries(new FormData(event.currentTarget).entries());
  const origin=String(form.apiOrigin || apiUrl()).replace(/\/$/,'');
  localStorage.setItem('nivora:apiUrl',origin); delete form.apiOrigin; setAuthMessage('');
  try {
    const response=await fetch(`${origin}/auth/${authMode==='login'?'login':'register'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok){const error=new Error(payload.message||'Please check the information and try again.');error.status=response.status;throw error;}
    sessionStorage.setItem('nivora:accessToken',payload.accessToken);localStorage.setItem('nivora:user',JSON.stringify(payload.user));setAccount(payload.user);setAuthMessage('');toast(`Welcome, ${payload.user.name}.`);await loadDashboard();
  } catch(error) {
    let message;
    if(authMode==='login' && error.status===401) message="We couldn't sign you in. Check your email and password. If you don't have an account, choose “Create an account”.";
    else if(authMode==='register' && error.status===409) message='An account with this email already exists. Please sign in instead.';
    else if(error instanceof TypeError) message='We couldn’t reach the community server. Check that the API is running and try again.';
    else if(error.status===400) message='Please check the details you entered and try again.';
    else message=error.message || 'Something went wrong. Please try again.';
    setAuthMessage(message);
  }
});
$('#actionForm').addEventListener('submit',submitCreate);
$('#menuToggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#actionModal').addEventListener('click',(event)=>{if(event.target===event.currentTarget)event.currentTarget.close();});
document.addEventListener('click',(event)=>{
  const pageButton=event.target.closest('[data-page]'); if(pageButton){navigate(pageButton.dataset.page);return;}
  if(event.target.closest('[data-auth-open]')){showAuth();return;}
  const actionButton=event.target.closest('[data-action]'); if(actionButton){const action=actionButton.dataset.action;if(action.startsWith('Refresh')){void loadFeature(currentPage);return;}if(action==='Save profile'){const form=$('#featurePage').querySelector('#profileForm');if(form)form.requestSubmit();return;}openCreateForm(currentPage==='Dashboard'?(action.toLowerCase().includes('visitor')?'Visitors':'Home planner'):currentPage,action);return;}
  const row=event.target.closest('[data-row-action]'); if(row)void handleRowAction(row);
});
document.addEventListener('submit',(event)=>{
  if(event.target.id==='profileForm'){void submitProfile(event);return;}
  if(event.target.matches('[data-search-residents]')){event.preventDefault();const form=new FormData(event.target);void loadFeature(currentPage,form.get('q')||'',form.get('mode')||'residents');}
});
$('#searchInput').addEventListener('keydown',(event)=>{if(event.key!=='Enter')return;const value=event.currentTarget.value.trim();const item=$$('.nav-item[data-page]').find((button)=>button.dataset.page.toLowerCase().includes(value.toLowerCase()));if(item)navigate(item.dataset.page);else if(value){navigate('Search residents');setTimeout(()=>{const input=$('[data-search-residents] input');if(input){input.value=value;void loadFeature('Search residents',value);}},100);}});
$('.notification-button').addEventListener('click',()=>navigate('Notifications'));
$('#allFeatures')?.addEventListener('click',()=>navigate('My complex'));

$$('.nav-item[data-page]').forEach((button)=>button.addEventListener('click',()=>{}));
const storedUser=(()=>{try{return JSON.parse(localStorage.getItem('nivora:user')||'null');}catch{return null;}})();
if(authToken()&&storedUser)setAccount(storedUser);else setAccount(null);
$('.profile-mini').addEventListener('click',()=>authToken()?navigate('Account management'):showAuth());
$('#currentPage').textContent='Dashboard';
renderDashboard();
if(authToken())void loadDashboard();else renderSignedOut();
