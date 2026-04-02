let currentTab = 'globe';
let globeLoaded = false;

const TABS = ['globe', 'neows', 'sbdb', 'sentry'];

function init() {
  bindTabNav();
  switchTab('globe');
}

function bindTabNav() {
  TABS.forEach(tab => {
    const btn = document.getElementById(`tab-btn-${tab}`);
    if (btn) btn.addEventListener('click', () => switchTab(tab));
  });
}

function switchTab(tab) {
  currentTab = tab;
  TABS.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const panel = document.getElementById(`tab-${t}`);
    if (btn) btn.classList.toggle('active', t === tab);
    if (panel) panel.classList.toggle('hidden', t !== tab);
  });

  if (tab === 'globe' && !globeLoaded) loadGlobeTab();
  else if (tab === 'neows') renderNeows();
  else if (tab === 'sbdb') renderSBDB();
  else if (tab === 'sentry') renderSentry();
}

async function loadGlobeTab() {
  const container = document.getElementById('globe-container');
  const status = document.getElementById('globe-status');
  if (status) status.textContent = 'Loading asteroid data…';
  try {
    const start = todayStr();
    const end = offsetDate(7);
    const data = await fetchNeoWs(start, end);
    if (status) status.textContent = '';
    initGlobe(data);
    globeLoaded = true;
  } catch (e) {
    if (status) status.innerHTML = `
      <div class="error-card" style="max-width:400px;margin:auto">
        <div class="error-title">Globe failed to load</div>
        <div class="error-msg">${e.message}</div>
        <button class="btn-retry" onclick="globeLoaded=false;loadGlobeTab()">Retry</button>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
