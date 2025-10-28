// Front-end behaviour for Mailist (no backend) - stores campaigns in localStorage

const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

let quillMain, quillFollow;

function init(){
  // Tabs
  const tabNew = qs('#tab-new');
  const tabCampaigns = qs('#tab-campaigns');
  const newSection = qs('#new-campaign');
  const campaignsSection = qs('#campaigns');

  tabNew.onclick = ()=>{tabNew.classList.add('active');tabCampaigns.classList.remove('active');newSection.classList.remove('hidden');campaignsSection.classList.add('hidden')}
  tabCampaigns.onclick = ()=>{tabCampaigns.classList.add('active');tabNew.classList.remove('active');campaignsSection.classList.remove('hidden');newSection.classList.add('hidden');renderCampaigns()}

  // Quill editors
  quillMain = new Quill('#editor',{modules:{toolbar:'#toolbar'},theme:'snow'});
  quillFollow = new Quill('#followup-editor',{modules:{toolbar:'#followup-toolbar'},theme:'snow'});

  // Buttons
  qs('#btn-contacts').addEventListener('click', ()=>openContacts())
  qs('#contacts-cancel').addEventListener('click', closeContacts)
  qs('#contacts-parse').addEventListener('click', parseContacts)

  qs('#btn-add-followup').addEventListener('click', ()=>openFollowup())
  qs('#followup-cancel').addEventListener('click', closeFollowup)
  qs('#followup-add').addEventListener('click', addFollowup)

  qs('#btn-schedule').addEventListener('click', toggleSchedulePanel)
  qs('#btn-save').addEventListener('click', saveCampaign)

  loadDraftFollowups();
  renderCampaigns();
}

// Contacts modal
function openContacts(){qs('#modal-contacts').classList.remove('hidden')}
function closeContacts(){qs('#modal-contacts').classList.add('hidden')}
function parseContacts(){
  const raw = qs('#contacts-text').value || '';
  const parts = raw.split(/[,;\n\s]+/).map(s=>s.trim()).filter(Boolean);
  const emails = parts.filter(e=>/^\S+@\S+\.\S+$/.test(e));
  if(!emails.length){alert('Aucun email valide trouvé');return}
  // store in draft area (simple list preview)
  const preview = qs('#contacts-text');
  preview.value = emails.join('\n');
  // store a draft in localStorage for the new campaign form
  localStorage.setItem('mailist:contacts:current', JSON.stringify(emails));
  closeContacts();
  alert(`${emails.length} contacts ajoutés (stockés temporairement)`);
}

// Followup modal
function openFollowup(){qs('#modal-followup').classList.remove('hidden')}
function closeFollowup(){qs('#modal-followup').classList.add('hidden')}

function addFollowup(){
  const days = parseInt(qs('#followup-days').value,10)||1;
  const html = quillFollow.root.innerHTML;
  const followups = JSON.parse(localStorage.getItem('mailist:followups')||'[]');
  followups.push({days,content:html});
  localStorage.setItem('mailist:followups', JSON.stringify(followups));
  closeFollowup();
  loadDraftFollowups();
}

function loadDraftFollowups(){
  const ul = qs('#followups-ul'); ul.innerHTML='';
  const followups = JSON.parse(localStorage.getItem('mailist:followups')||'[]');
  followups.forEach((f,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>J+${f.days}</strong> — <span class=small>aperçu</span> <div class=small>${stripText(f.content).slice(0,150)}</div> <button class='small' data-i='${i}' onclick='removeFollowup(this.dataset.i)'>Supprimer</button>`;
    ul.appendChild(li);
  })
}
function removeFollowup(i){
  const followups = JSON.parse(localStorage.getItem('mailist:followups')||'[]');
  followups.splice(i,1);
  localStorage.setItem('mailist:followups', JSON.stringify(followups));
  loadDraftFollowups();
}

function stripText(html){
  const tmp = document.createElement('div'); tmp.innerHTML=html; return tmp.textContent||tmp.innerText||'';
}

function toggleSchedulePanel(){qs('#schedule-panel').classList.toggle('hidden')}

function saveCampaign(){
  const subject = qs('#subject').value||'(sans sujet)';
  const content = quillMain.root.innerHTML;
  const contacts = JSON.parse(localStorage.getItem('mailist:contacts:current')||'[]');
  const followups = JSON.parse(localStorage.getItem('mailist:followups')||'[]');
  const schedule = {start:qs('#schedule-start').value||null,frequency:qs('#schedule-frequency').value||'once'};
  if(!contacts.length){ if(!confirm('Aucun contact détecté. Enregistrer quand même ?')) return }
  const campaigns = JSON.parse(localStorage.getItem('mailist:campaigns')||'[]');
  const id = 'cmp-'+Date.now();
  const campaign = {id,subject,content,contacts,followups,schedule,created: new Date().toISOString(),status:'running',stats:{sent:0,opens:0,clicks:0,unsubs:0}};
  campaigns.push(campaign);
  localStorage.setItem('mailist:campaigns', JSON.stringify(campaigns));
  // clear draft
  localStorage.removeItem('mailist:followups');
  localStorage.removeItem('mailist:contacts:current');
  qs('#contacts-text').value='';
  qs('#subject').value=''; quillMain.root.innerHTML='';
  alert('Campagne enregistrée. Elle apparaîtra dans Campagnes.');
}

function renderCampaigns(){
  const running = qs('#campaigns-running'); running.innerHTML='';
  const finished = qs('#campaigns-finished'); finished.innerHTML='';
  const campaigns = JSON.parse(localStorage.getItem('mailist:campaigns')||'[]');
  campaigns.forEach(c=>{
    const el = document.createElement('div'); el.className='campaign';
    el.innerHTML = `<div class='meta'><div><strong>${escapeHtml(c.subject)}</strong><div class=small>Créée: ${new Date(c.created).toLocaleString()}</div></div><div><button class='pause' data-id='${c.id}'>${c.status==='running'?'Mettre en pause':'Reprendre'}</button></div></div>`;
    // stats (simulate percentages)
    const total = (c.contacts||[]).length || 1;
    const sent = c.stats.sent || 0;
    const pctSent = Math.round((sent/total)*100);
    const opens = c.stats.opens || 0; const pctOpen = Math.round((opens/total)*100);
    const clicks = c.stats.clicks || 0; const pctClick = Math.round((clicks/total)*100);
    const unsubs = c.stats.unsubs || 0; const pctUnsub = Math.round((unsubs/total)*100);

    el.innerHTML += `<div class='stat-row'> <div class='stat'><div class='small'>Envoyés</div><strong>${sent}</strong><div class='small'>${pctSent}%</div></div> <div class='stat'><div class='small'>Ouverts</div><strong>${opens}</strong><div class='small'>${pctOpen}%</div></div> <div class='stat'><div class='small'>Clicks</div><strong>${clicks}</strong><div class='small'>${pctClick}%</div></div> <div class='stat'><div class='small'>Unsubscribes</div><strong>${unsubs}</strong><div class='small'>${pctUnsub}%</div></div></div>`;

    el.innerHTML += `<div style='margin-top:8px' class='small'>Contacts: ${(c.contacts||[]).length}</div>`;

    // actions
    const actions = document.createElement('div'); actions.style.marginTop='10px';
    const pause = el.querySelector('button.pause');
    pause.addEventListener('click', ()=>togglePause(c.id));

    const finishBtn = document.createElement('button'); finishBtn.textContent='Marquer terminé'; finishBtn.className='small'; finishBtn.addEventListener('click', ()=>markFinished(c.id));
    actions.appendChild(finishBtn);
    el.appendChild(actions);

    if(c.status==='finished') finished.appendChild(el); else running.appendChild(el);
  })
}

function togglePause(id){
  const campaigns = JSON.parse(localStorage.getItem('mailist:campaigns')||'[]');
  const c = campaigns.find(x=>x.id===id); if(!c) return; c.status = c.status==='running' ? 'paused' : 'running';
  localStorage.setItem('mailist:campaigns', JSON.stringify(campaigns)); renderCampaigns();
}
function markFinished(id){
  const campaigns = JSON.parse(localStorage.getItem('mailist:campaigns')||'[]');
  const c = campaigns.find(x=>x.id===id); if(!c) return; c.status='finished'; localStorage.setItem('mailist:campaigns', JSON.stringify(campaigns)); renderCampaigns();
}

function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

window.addEventListener('DOMContentLoaded', init);
