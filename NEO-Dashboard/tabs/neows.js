let neowsData = null;
let neowsAllNEOs = [];
let neowsSortCol = 'date';
let neowsSortDir = 1;
let neowsFilter = { hazardOnly: false, search: '' };

const REFERENCES = [
  { label: 'Person', height: 1.8, icon: '🧍' },
  { label: 'Bus', height: 3, icon: '🚌' },
  { label: 'Eiffel Tower', height: 330, icon: '🗼' },
  { label: 'Football Stadium', height: 70, icon: '🏟️' },
];

const VEL_REFS = [
  { label: 'Sound', kmps: 0.34 },
  { label: 'Bullet', kmps: 1.0 },
  { label: 'ISS', kmps: 7.7 },
  { label: 'Earth orbit', kmps: 29.8 },
];

async function renderNeows() {
  const container = document.getElementById('tab-neows');
  container.innerHTML = skeletonHTML();
  try {
    const start = todayStr();
    const end = offsetDate(7);
    neowsData = await fetchNeoWs(start, end);
    neowsAllNEOs = flattenNEOs(neowsData);
    container.innerHTML = neowsHTML();
    bindNeowsEvents();
    renderNeowsTable();
  } catch (e) {
    container.innerHTML = errorHTML('NeoWs', e.message);
  }
}

function flattenNEOs(data) {
  const list = [];
  Object.values(data.near_earth_objects).forEach(dayList => {
    dayList.forEach(neo => {
      const a = neo.close_approach_data[0];
      list.push({
        id: neo.id,
        name: neo.name.replace(/[()]/g, ''),
        date: a.close_approach_date,
        missKm: parseFloat(a.miss_distance.kilometers),
        missLD: parseFloat(a.miss_distance.lunar),
        velocity: parseFloat(a.relative_velocity.kilometers_per_second),
        diamMin: neo.estimated_diameter.meters.estimated_diameter_min,
        diamMax: neo.estimated_diameter.meters.estimated_diameter_max,
        hazardous: neo.is_potentially_hazardous_asteroid,
        jplUrl: neo.nasa_jpl_url,
      });
    });
  });
  return list;
}

function neowsHTML() {
  const neos = neowsAllNEOs;
  const closest = neos.reduce((a, b) => a.missLD < b.missLD ? a : b);
  const largest = neos.reduce((a, b) => (a.diamMax > b.diamMax ? a : b));
  const fastest = neos.reduce((a, b) => a.velocity > b.velocity ? a : b);
  const hazCount = neos.filter(n => n.hazardous).length;
  return `
    <div class="stat-cards">
      <div class="stat-card accent-cyan">
        <div class="stat-label">Closest Approach</div>
        <div class="stat-value">${closest.missLD.toFixed(3)} LD</div>
        <div class="stat-sub">${closest.name} · ${(closest.missKm / 1000).toFixed(0)}K km</div>
      </div>
      <div class="stat-card accent-amber">
        <div class="stat-label">Largest Object</div>
        <div class="stat-value">${largest.diamMax.toFixed(0)} m</div>
        <div class="stat-sub">${largest.name}</div>
      </div>
      <div class="stat-card accent-cyan">
        <div class="stat-label">Fastest Flyby</div>
        <div class="stat-value">${fastest.velocity.toFixed(2)} km/s</div>
        <div class="stat-sub">${fastest.name}</div>
      </div>
      <div class="stat-card ${hazCount > 0 ? 'accent-red' : 'accent-cyan'}">
        <div class="stat-label">Potentially Hazardous</div>
        <div class="stat-value">${hazCount} / ${neos.length}</div>
        <div class="stat-sub">this week</div>
      </div>
    </div>

    <div class="controls-row">
      <input id="neo-search" class="ctrl-input" placeholder="Search by name…" type="text" />
      <label class="ctrl-toggle"><input id="neo-haz-only" type="checkbox" /> Hazardous only</label>
    </div>

    <div id="neo-table-wrap">
      <table class="data-table" id="neo-table">
        <thead>
          <tr>
            <th data-col="name">Name</th>
            <th data-col="date" class="active-sort">Date ▲</th>
            <th data-col="missLD">Miss Dist (LD)</th>
            <th data-col="diamMax">Diameter (m)</th>
            <th data-col="velocity">Velocity (km/s)</th>
            <th>Hazardous</th>
          </tr>
        </thead>
        <tbody id="neo-tbody"></tbody>
      </table>
    </div>

    <div id="size-panel" class="side-panel hidden">
      <button class="panel-close" id="size-close">✕</button>
      <h3 id="size-panel-title">Size Comparison</h3>
      <div id="size-viz"></div>
      <div id="vel-panel"></div>
    </div>
  `;
}

function renderNeowsTable() {
  let neos = [...neowsAllNEOs];
  if (neowsFilter.hazardOnly) neos = neos.filter(n => n.hazardous);
  if (neowsFilter.search) {
    const s = neowsFilter.search.toLowerCase();
    neos = neos.filter(n => n.name.toLowerCase().includes(s));
  }
  neos.sort((a, b) => {
    const av = a[neowsSortCol], bv = b[neowsSortCol];
    return (av < bv ? -1 : av > bv ? 1 : 0) * neowsSortDir;
  });

  const tbody = document.getElementById('neo-tbody');
  if (!tbody) return;
  tbody.innerHTML = neos.map(n => `
    <tr class="clickable-row" data-id="${n.id}">
      <td><a href="${n.jplUrl}" target="_blank" class="neo-link">${n.name}</a></td>
      <td>${n.date}</td>
      <td>${n.missLD.toFixed(4)} <span class="dim">(${(n.missKm / 1000).toFixed(0)}K km)</span></td>
      <td>${n.diamMin.toFixed(0)}–${n.diamMax.toFixed(0)}</td>
      <td>${n.velocity.toFixed(2)}</td>
      <td><span class="badge ${n.hazardous ? 'badge-red' : 'badge-green'}">${n.hazardous ? 'YES' : 'NO'}</span></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.clickable-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') return;
      const neo = neowsAllNEOs.find(n => n.id === row.dataset.id);
      if (neo) showSizePanel(neo);
    });
  });
}

function showSizePanel(neo) {
  const panel = document.getElementById('size-panel');
  const avgDiam = (neo.diamMin + neo.diamMax) / 2;
  document.getElementById('size-panel-title').textContent = `${neo.name} — Size & Speed`;

  const maxRef = REFERENCES[REFERENCES.length - 1].height;
  const scaleMax = Math.max(avgDiam, maxRef);
  const vizHTML = REFERENCES.map(r => {
    const refPct = (r.height / scaleMax) * 100;
    const astPct = (avgDiam / scaleMax) * 100;
    return `
      <div class="size-row">
        <div class="size-icon">${r.icon}</div>
        <div class="size-bars">
          <div class="size-bar" style="height:${refPct}%" title="${r.label}: ${r.height}m"></div>
          <div class="size-bar ast-bar" style="height:${astPct}%" title="${neo.name}: ~${avgDiam.toFixed(0)}m"></div>
        </div>
        <div class="size-labels">
          <span>${r.label} ${r.height}m</span>
          <span class="dim">vs ~${avgDiam.toFixed(0)}m</span>
        </div>
      </div>
    `;
  }).join('');

  const velMax = VEL_REFS[VEL_REFS.length - 1].kmps;
  const velHTML = VEL_REFS.map(r => {
    const pct = Math.min((r.kmps / velMax) * 100, 100);
    return `<div class="vel-row"><span class="vel-label">${r.label}</span><div class="vel-bar-track"><div class="vel-bar" style="width:${pct}%"></div></div><span class="vel-val">${r.kmps} km/s</span></div>`;
  }).join('');
  const neoPct = Math.min((neo.velocity / velMax) * 100, 100);
  const velSection = `
    <h4 style="margin:16px 0 8px">Velocity: ${neo.velocity.toFixed(2)} km/s</h4>
    ${velHTML}
    <div class="vel-row"><span class="vel-label" style="color:#00d4ff">${neo.name}</span><div class="vel-bar-track"><div class="vel-bar" style="width:${neoPct}%;background:#00d4ff"></div></div><span class="vel-val">${neo.velocity.toFixed(2)} km/s</span></div>
  `;

  document.getElementById('size-viz').innerHTML = vizHTML;
  document.getElementById('vel-panel').innerHTML = velSection;
  panel.classList.remove('hidden');
}

function bindNeowsEvents() {
  document.getElementById('neo-search')?.addEventListener('input', e => {
    neowsFilter.search = e.target.value;
    renderNeowsTable();
  });
  document.getElementById('neo-haz-only')?.addEventListener('change', e => {
    neowsFilter.hazardOnly = e.target.checked;
    renderNeowsTable();
  });
  document.getElementById('size-close')?.addEventListener('click', () => {
    document.getElementById('size-panel').classList.add('hidden');
  });
  document.querySelectorAll('#neo-table th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (neowsSortCol === col) neowsSortDir *= -1;
      else { neowsSortCol = col; neowsSortDir = 1; }
      document.querySelectorAll('#neo-table th').forEach(t => t.classList.remove('active-sort'));
      th.classList.add('active-sort');
      th.textContent = th.textContent.replace(/[▲▼]/g, '') + (neowsSortDir === 1 ? ' ▲' : ' ▼');
      renderNeowsTable();
    });
  });
}

function skeletonHTML() {
  return `<div class="skeleton-wrap">${Array(6).fill('<div class="skeleton-row"></div>').join('')}</div>`;
}

function errorHTML(source, msg) {
  return `
    <div class="error-card">
      <div class="error-title">Failed to load ${source} data</div>
      <div class="error-msg">${msg}</div>
      <button class="btn-retry" onclick="renderNeows()">Retry</button>
    </div>
  `;
}
