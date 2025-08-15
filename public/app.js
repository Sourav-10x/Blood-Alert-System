
const TABS = document.querySelectorAll('.tab');
const PANELS = document.querySelectorAll('.tab-panel');
const toastBox = document.getElementById('toast');

function toast(msg, type='ok'){
  toastBox.textContent = msg;
  toastBox.className = '';
  toastBox.classList.add(type);
  toastBox.style.display = 'block';
  setTimeout(()=> toastBox.style.display='none', 2200);
}

// ----------- Router (tabs) -----------
document.querySelectorAll('[data-open]').forEach(btn=>{
  btn.addEventListener('click', ()=> openTab(btn.getAttribute('data-open')));
});
TABS.forEach(tab=>{
  tab.addEventListener('click', ()=> openTab(tab.dataset.tab));
});
function openTab(id){
  TABS.forEach(t=> t.classList.toggle('active', t.dataset.tab === id));
  PANELS.forEach(p=> p.classList.toggle('active', p.id === id));
  if(id==='dashboard') { renderStats(); renderRecentRequests(); renderChart(); }
  if(id==='donor') { renderDonorTable(); }
  if(id==='request') { renderRequestTable(); }
  if(id==='inventory') { renderInventoryTable(); }
}
// Dashboard "Add" button for inventory quick access
document.getElementById('btnAddInventory').addEventListener('click', () => {
  openTab('inventory'); 
  document.getElementById('invEmail').focus();
});

// ----------- LocalStorage Data Layer -----------
const storage = {
  get(key){ return JSON.parse(localStorage.getItem(key) || '[]'); },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); },
  push(key, item){ const arr = storage.get(key); arr.unshift(item); storage.set(key, arr); }
};

// Seed once
(function seed(){
  if(!localStorage.getItem('seeded')){
    const donors = [
      {name:'Aarav', email:'aarav@example.com', phone:'9991112222', bloodGroup:'O+', area:'Andheri', state:'MH', age:28, weight:72, lastDonationDate:'2025-02-01'},
      {name:'Diya', email:'diya@example.com', phone:'8882223333', bloodGroup:'A-', area:'Whitefield', state:'KA', age:24, weight:58, lastDonationDate:'2025-03-12'},
      {name:'Kabir', email:'kabir@example.com', phone:'7773334444', bloodGroup:'B+', area:'Gachibowli', state:'TS', age:31, weight:80, lastDonationDate:'2024-12-15'}
    ];
    const requests = [
      {hospitalName:'City Care', contactEmail:'er@city.com', bloodGroup:'O+', unitsRequired:2, area:'Andheri', state:'MH', status:'pending', createdAt:Date.now()},
      {hospitalName:'Apollo', contactEmail:'blood@apollo.com', bloodGroup:'A-', unitsRequired:3, area:'Whitefield', state:'KA', status:'notified', createdAt:Date.now()-86400000}
    ];
    const inv = [
      {type:'IN', bloodGroup:'O+', email:'aarav@example.com', quantity:450, timestamp: Date.now()-86400000*2},
      {type:'OUT', bloodGroup:'A-', email:'patient@hospital.com', quantity:300, timestamp: Date.now()-3600000}
    ];
    storage.set('donors', donors);
    storage.set('requests', requests);
    storage.set('inventory', inv);
    localStorage.setItem('seeded','1');
  }
})();

// ----------- Eligibility (90 days, age 18-60, weight ≥ 50) -----------
function isEligible(d){
  const ageOK = (parseInt(d.age,10) >= 18 && parseInt(d.age,10) <= 60);
  const weightOK = (parseInt(d.weight,10) >= 50);
  const last = d.lastDonationDate ? new Date(d.lastDonationDate).getTime() : 0;
  const days = (Date.now() - last) / (1000*60*60*24);
  const daysOK = (last === 0) ? true : days >= 90;
  return ageOK && weightOK && daysOK;
}
function formatDate(ts){
  if(!ts) return '—';
  const d = new Date(ts);
  if (isNaN(d)) return ts; // if already string
  return d.toLocaleString();
}

// ----------- Stats -----------
function renderStats(){
  const donors = storage.get('donors');
  const requests = storage.get('requests');
  const inventory = storage.get('inventory');
  const units = inventory.reduce((sum, r)=> sum + (r.type==='IN' ? r.quantity : -r.quantity), 0);
  document.getElementById('statDonors').textContent = donors.length;
  document.getElementById('statRequests').textContent = requests.length;
  document.getElementById('statUnits').textContent = Math.max(0, units);
}

// ----------- Donor Registration -----------
const donorForm = document.getElementById('formDonor');
donorForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(donorForm).entries());
  storage.push('donors', formData);
  donorForm.reset();
  renderDonorTable();
  renderStats();
  toast('Donor registered successfully');
});

function renderDonorTable(){
  const tbody = document.getElementById('donorTable');
  const donors = storage.get('donors');
  const q = (document.getElementById('donorSearch')?.value || '').toLowerCase();
  tbody.innerHTML = '';
  donors
    .filter(d=>!q || [d.area,d.state,d.bloodGroup].join(' ').toLowerCase().includes(q))
    .forEach(d=>{
      const el = document.createElement('tr');
      el.innerHTML = `
        <td>${d.name}</td>
        <td>${d.bloodGroup}</td>
        <td>${d.email}</td>
        <td>${d.phone}</td>
        <td>${d.area}</td>
        <td>${d.state}</td>
        <td>${d.lastDonationDate || '—'}</td>
      `;
      tbody.appendChild(el);
    });
}
document.getElementById('donorSearch').addEventListener('input', renderDonorTable);
document.getElementById('btnExportDonors').addEventListener('click', ()=>{
  const donors = storage.get('donors');
  const header = ['Name','Blood','Email','Phone','Area','State','LastDonation'];
  const rows = donors.map(d=>[d.name,d.bloodGroup,d.email,d.phone,d.area,d.state,d.lastDonationDate||'']);
  const csv = [header, ...rows].map(r=>r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='donors.csv'; a.click();
  URL.revokeObjectURL(url);
});

// ----------- Emergency Request -----------
const reqForm = document.getElementById('formRequest');
reqForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(reqForm).entries());
  const reqObj = {...formData, status:'pending', createdAt: Date.now()};
  storage.push('requests', reqObj);
  reqForm.reset();
  renderRequestTable();
  renderRecentRequests();
  toast('Emergency request raised. Donors being notified…', 'warn');

  // Simulate notify + mark notified
  setTimeout(()=>{
    // find donors same blood & location and eligible
    const donors = storage.get('donors');
    const matches = donors.filter(d =>
      d.bloodGroup === reqObj.bloodGroup &&
      d.area?.toLowerCase() === reqObj.area?.toLowerCase() &&
      d.state?.toLowerCase() === reqObj.state?.toLowerCase() &&
      isEligible(d)
    );
    // mark request as notified if any
    const all = storage.get('requests');
    const idx = all.findIndex(r => r.createdAt === reqObj.createdAt);
    if(idx>-1){ all[idx].status = matches.length ? 'notified' : 'pending'; storage.set('requests', all); }
    renderRequestTable();
    renderRecentRequests();
    if(matches.length) toast(Notified `${matches.length} donor(s).`);
    else toast(No `eligible donors found in that area.`, 'err');
  }, 800);
});

function renderRequestTable(){
  const tbody = document.getElementById('requestTable');
  const all = storage.get('requests');
  const filter = document.getElementById('reqFilter').value;
  const rows = (filter==='all' ? all : all.filter(r=>r.status===filter));
  tbody.innerHTML = '';
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="reqChk" data-ts="${r.createdAt}"></td>
      <td>${r.hospitalName}</td>
      <td>${r.bloodGroup}</td>
      <td>${r.unitsRequired}</td>
      <td>${r.area}/${r.state}</td>
      <td><span class="badge" style="border-color:${r.status==='fulfilled'?'#0aa57a': r.status==='notified'?'#ffb020':'#2b2b3f'}">${r.status}</span></td>
      <td>${formatDate(r.createdAt)}</td>
    `;
    tbody.appendChild(tr);
  });
}
document.getElementById('reqFilter').addEventListener('change', renderRequestTable);
document.getElementById('selectAllReq').addEventListener('change', (e)=>{
  document.querySelectorAll('.reqChk').forEach(chk=> chk.checked = e.target.checked);
});
document.getElementById('btnFulfillSelected').addEventListener('click', ()=>{
  const all = storage.get('requests');
  const selected = [...document.querySelectorAll('.reqChk:checked')].map(c=> Number(c.dataset.ts));
  const updated = all.map(r=> selected.includes(r.createdAt) ? {...r, status:'fulfilled'} : r);
  storage.set('requests', updated);
  renderRequestTable();
  renderRecentRequests();
  toast('Marked selected requests as fulfilled', 'ok');
});

function renderRecentRequests(){
  const tbody = document.getElementById('recentRequests');
  const all = storage.get('requests').slice(0,6);
  tbody.innerHTML='';
  all.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.hospitalName}</td>
      <td>${r.bloodGroup}</td>
      <td>${r.unitsRequired}</td>
      <td>${r.area}/${r.state}</td>
      <td>${r.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------- Matching (dashboard section) -----------
document.getElementById('btnFindMatches').addEventListener('click', ()=>{
  const blood = document.getElementById('matchBlood').value;
  const area = document.getElementById('matchArea').value.trim().toLowerCase();
  const state = document.getElementById('matchState').value.trim().toLowerCase();
  const donors = storage.get('donors')
    .filter(d => d.bloodGroup===blood &&
      (!area || d.area?.toLowerCase()===area) &&
      (!state || d.state?.toLowerCase()===state)
    );

  const tbody = document.getElementById('matchResults');
  tbody.innerHTML='';
  donors.forEach(d=>{
    const tr = document.createElement('tr');
    const eligible = isEligible(d);
    tr.innerHTML = `
      <td>${d.name} <small class="muted">(${d.email})</small></td>
      <td>${d.bloodGroup}</td>
      <td>${d.area}/${d.state}</td>
      <td>${d.lastDonationDate || '—'}</td>
      <td><span class="badge" style="border-color:${eligible ? '#0aa57a' : '#ff4d6d'}">${eligible?'Yes':'No'}</span></td>
    `;
    tbody.appendChild(tr);
  });
  toast(Found `${donors.length} donor(s)`, donors.length ? 'ok':'warn');
});

// ----------- Inventory -----------
document.getElementById('btnInvAdd').addEventListener('click', ()=>{
  const type = document.getElementById('invType').value;
  const bloodGroup = document.getElementById('invBlood').value;
  const email = document.getElementById('invEmail').value.trim();
  const qty = Number(document.getElementById('invQty').value);
  if(!email || !qty){ toast('Enter email and quantity', 'err'); return; }
  storage.push('inventory', {type, bloodGroup, email, quantity: qty, timestamp: Date.now()});
  document.getElementById('invEmail').value = '';
  document.getElementById('invQty').value = '';
  renderInventoryTable();
  renderStats();
  renderChart(true);
  toast('Inventory record added', 'ok');
});

function renderInventoryTable(){
  const tbody = document.getElementById('inventoryTable');
  const inv = storage.get('inventory');
  tbody.innerHTML='';
  inv.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.type}</td>
      <td>${r.bloodGroup}</td>
      <td>${r.email}</td>
      <td>${r.quantity}</td>
      <td>${formatDate(r.timestamp)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------- Chart -----------
let invChart;
function computeInventoryTotals(){
  const groups = ['O+','O-','A+','A-','B+','B-','AB+','AB-'];
  const totals = Object.fromEntries(groups.map(g=>[g,0]));
  storage.get('inventory').forEach(r=>{
    totals[r.bloodGroup] += (r.type==='IN' ? r.quantity : -r.quantity);
  });
  return {labels: groups, data: groups.map(g=> Math.max(0, totals[g]))};
}
function renderChart(update=false){
  const ctx = document.getElementById('invChart').getContext('2d');
  const {labels, data} = computeInventoryTotals();
  if(update && invChart){
    invChart.data.labels = labels;
    invChart.data.datasets[0].data = data;
    invChart.update();
    return;
  }
  invChart?.destroy();
  invChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Units Available (ml)',
        data,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color:'#fff' } }
      },
      scales: {
        x: { ticks:{ color:'#cfd1d6' }, grid:{ color:'#232336' } },
        y: { ticks:{ color:'#cfd1d6' }, grid:{ color:'#232336' }, beginAtZero:true }
      }
    }
  });
}

// ----------- Auth (mock) -----------
document.getElementById('formLogin').addEventListener('submit', (e)=>{
  e.preventDefault();
  const {email, role} = Object.fromEntries(new FormData(e.target).entries());
  localStorage.setItem('auth', JSON.stringify({email, role}));
  toast(Logged in as `${role}`, 'ok');
  openTab('dashboard');
});
document.getElementById('formRegister').addEventListener('submit', (e)=>{
  e.preventDefault();
  const {orgName, email, role} = Object.fromEntries(new FormData(e.target).entries());
  localStorage.setItem('auth', JSON.stringify({email, role, orgName}));
  toast(`Account created for ${orgName}`, 'ok');
  openTab('dashboard');
});

// ----------- Initial render -----------
openTab('dashboard');
renderStats();
renderRecentRequests();
renderDonorTable();
renderRequestTable();
renderInventoryTable();
setTimeout(()=> renderChart(), 0);
