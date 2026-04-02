let sbdbData = null;
let sbdbRows = [];
let sbdbSortCol = 0; // index into fields array
let sbdbSortDir = 1;
let sbdbWindow = 30;
let sbdbDistMax = '0.2';

// SBDB field order from API: des, name, cd, dist, dist_min, dist_max, v_rel, v_inf, t_sigma_f, h
const F = { des: 0, name: 1, cd: 2, dist: 3, v_rel: 6, h: 9 };

async function renderSBDB() {
  const container = document.getElementById('tab-sbdb');
  container.innerHTML = sbdbSkeletonHTML();
  try {
    await loadSBDB();
    container.innerHTML = sbdbHTML();
    bindSBDBEvents();
    renderSBDBTable();
    renderTimeline();
  } catch (e) {
    container.innerHTML = sbdbErrorHTML(e.message);
  }
}

async function loadSBDB() {
  const dateMin = todayStr();
  const dateMax = offsetDate(sbdbWindow);
  sbdbData = await fetchSBDB({ dateMin, dateMax, distMax: sbdbDistMax });

  if (!sbdbData.fields) throw new Error(sbdbData.message || 'Unexpected API response');

  // Build a lookup map so order changes don't break anything
  const fi = {};
  sbdbData.fields.forEach((f, i) => { fi[f] = i; });

  sbdbRows = (sbdbData.data || []).map(row => {
    const distAU = parseFloat(row[fi['dist']]);
    const missKm = distAU * 1.496e8;          // AU → km
    const missLD = missKm / CONFIG.LUNAR_DISTANCE_KM;
    const vRel = parseFloat(row[fi['v_rel']]);
    const h = parseFloat(row[fi['h']]);
    const diamEst = !isNaN(h) ? Math.pow(10, (3.1236 - 0.5 * Math.log10(0.154) - h / 5)).toFixed(0) : '—';
    return {
      des: row[fi['des']] ?? '—',
      name: row[fi['des']] ?? '—',
      date: row[fi['cd']] ?? '—',
      missKm,
      missLD,
      vRel: isNaN(vRel) ? null : vRel,
      diamEst,
      sigma: row[fi['t_sigma_f']] ?? '—',
    };
  });
}

function sbdbHTML() {
  return `
    <div class="controls-row">
      <label>Window:
        <select id="sbdb-window" class="ctrl-select">
          <option value="7">7 days</option>
          <option value="30" selected>30 days</option>
          <option value="365">1 year</option>
        </select>
      </label>
      <label>Max distance (LD):
        <input id="sbdb-dist" type="range" min="1" max="10" step="0.5" value="5" class="ctrl-range" />
        <span id="sbdb-dist-val">5 LD</span>
      </label>
    </div>

    <div id="sbdb-table-wrap">
      <table class="data-table" id="sbdb-table">
        <thead>
          <tr>
            <th>Object</th>
            <th>Date (UTC)</th>
            <th>Miss Distance</th>
            <th>Velocity (km/s)</th>
            <th>Diameter (m)</th>
            <th>±Uncertainty</th>
          </tr>
        </thead>
        <tbody id="sbdb-tbody"></tbody>
      </table>
    </div>

    <h3 class="section-title">Historical & Upcoming Timeline</h3>
    <div id="sbdb-timeline" class="timeline-scroll"></div>
  `;
}

function renderSBDBTable() {
  const tbody = document.getElementById('sbdb-tbody');
  if (!tbody) return;
  const rows = [...sbdbRows];
  tbody.innerHTML = rows.map(r => {
    const trips = (r.missKm / CONFIG.EARTH_CIRCUMFERENCE_KM).toFixed(0);
    const flights = (r.missKm / CONFIG.NYC_LONDON_KM).toFixed(0);
    return `
      <tr>
        <td class="mono">${r.name}</td>
        <td>${r.date}</td>
        <td>
          <strong>${r.missLD.toFixed(3)} LD</strong>
          <div class="dim">${(r.missKm / 1000).toFixed(0)}K km · ${trips} trips around Earth · ${flights} NYC↔London</div>
        </td>
        <td>${r.vRel !== null ? r.vRel.toFixed(2) : '—'}</td>
        <td>${r.diamEst}</td>
        <td class="mono dim">${r.sigma}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="6" class="empty-row">No approaches found for this window.</td></tr>';
}

function renderTimeline() {
  const el = document.getElementById('sbdb-timeline');
  if (!el || !sbdbRows.length) return;

  const notable = [
    { name: 'Apophis 2029', date: '2029-04-13', note: '~0.1 LD', color: '#ff4444' },
    { name: '2023 DZ2', date: '2023-03-25', note: 'past flyby', color: '#ffb830' },
  ];

  const items = sbdbRows.slice(0, 20).map(r => ({
    name: r.name,
    date: r.date.slice(0, 10),
    note: `${r.missLD.toFixed(2)} LD`,
    color: r.missLD < 1 ? '#ff4444' : r.missLD < 5 ? '#ffb830' : '#00d4ff',
  }));

  const all = [...notable, ...items].sort((a, b) => a.date.localeCompare(b.date));
  el.innerHTML = `
    <div class="timeline-track">
      ${all.map(ev => `
        <div class="timeline-event" style="border-color:${ev.color}">
          <div class="tl-dot" style="background:${ev.color}"></div>
          <div class="tl-name">${ev.name}</div>
          <div class="tl-date">${ev.date}</div>
          <div class="tl-note" style="color:${ev.color}">${ev.note}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function bindSBDBEvents() {
  document.getElementById('sbdb-window')?.addEventListener('change', async e => {
    sbdbWindow = parseInt(e.target.value);
    const container = document.getElementById('tab-sbdb');
    container.innerHTML = sbdbSkeletonHTML();
    try {
      await loadSBDB();
      container.innerHTML = sbdbHTML();
      bindSBDBEvents();
      renderSBDBTable();
      renderTimeline();
    } catch (err) {
      container.innerHTML = sbdbErrorHTML(err.message);
    }
  });

  document.getElementById('sbdb-dist')?.addEventListener('input', e => {
    const ld = parseFloat(e.target.value);
    document.getElementById('sbdb-dist-val').textContent = `${ld} LD`;
    sbdbDistMax = (ld * 0.002569).toFixed(4); // LD → AU (1 LD = 0.002569 AU)
  });
}

function sbdbSkeletonHTML() {
  return `<div class="skeleton-wrap">${Array(6).fill('<div class="skeleton-row"></div>').join('')}</div>`;
}

function sbdbErrorHTML(msg) {
  return `
    <div class="error-card">
      <div class="error-title">Failed to load SBDB data</div>
      <div class="error-msg">${msg}</div>
      <button class="btn-retry" onclick="renderSBDB()">Retry</button>
    </div>
  `;
}
