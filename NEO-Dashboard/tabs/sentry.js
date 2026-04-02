let sentryData = null;
let sentryRows = [];
let sentrySortCol = 'ps_cum';
let sentrySortDir = -1;
let sentryFilter = { torinoMin: 0 };

const TORINO_LABELS = [
  'No hazard', 'Normal', 'Meriting attention', 'Meriting attention',
  'Meriting concern', 'Threatening', 'Threatening', 'Threatening',
  'Certain collision', 'Certain collision', 'Certain collision'
];

const PALERMO_COLOR = ps => {
  if (ps < -2) return '#00d4ff';
  if (ps < 0) return '#ffb830';
  return '#ff4444';
};

async function renderSentry() {
  const container = document.getElementById('tab-sentry');
  container.innerHTML = sentrySkeletonHTML();
  try {
    sentryData = await fetchSentry();
    sentryRows = parseSentry(sentryData);
    container.innerHTML = sentryHTML();
    bindSentryEvents();
    renderSentryTable();
  } catch (e) {
    container.innerHTML = sentryErrorHTML(e.message);
  }
}

function parseSentry(data) {
  if (!data || (!data.data && !Array.isArray(data))) throw new Error('Unexpected Sentry API response');
  const list = Array.isArray(data) ? data : (data.data || []);
  return list.map(obj => {
    const diamKm = parseFloat(obj.diameter);
    // range field is "YYYY-YYYY" e.g. "2027-2119"
    const parts = obj.range ? obj.range.split('-') : [];
    return {
      des: obj.des || '—',
      name: obj.fullname || obj.des || '—',
      ip: parseFloat(obj.ip) || 0,
      ps: parseFloat(obj.ps_cum) || 0,
      ts: parseInt(obj.ts_max) || 0,
      yearMin: parts[0] || '—',
      yearMax: parts[1] || '—',
      energy: parseFloat(obj.energy) || 0,
      diameter: isNaN(diamKm) ? null : Math.round(diamKm * 1000), // km → m
      ps_cum: parseFloat(obj.ps_cum) || 0,
    };
  });
}

function sentryHTML() {
  return `
    <div class="sentry-intro">
      <div class="scale-card">
        <h4>Palermo Scale</h4>
        <p>Compares impact probability to background hazard rate. <strong>&lt;−2</strong>: routine, <strong>−2 to 0</strong>: merits attention, <strong>&gt;0</strong>: exceeds background risk.</p>
      </div>
      <div class="scale-card">
        <h4>Torino Scale</h4>
        <p>0–10 integer. <strong>0</strong>: no hazard. <strong>1–3</strong>: merits attention. <strong>4–7</strong>: threatening. <strong>8–10</strong>: certain collision.</p>
      </div>
    </div>

    <div class="controls-row">
      <label>Min Torino Scale:
        <select id="sentry-torino" class="ctrl-select">
          <option value="0" selected>Show all</option>
          <option value="1">Torino ≥ 1</option>
          <option value="2">Torino ≥ 2</option>
        </select>
      </label>
    </div>

    <div id="sentry-table-wrap">
      <table class="data-table" id="sentry-table">
        <thead>
          <tr>
            <th>Object</th>
            <th data-col="ip" class="sortable">Impact Prob.</th>
            <th data-col="ps_cum" class="sortable active-sort">Palermo ▼</th>
            <th data-col="ts" class="sortable">Torino</th>
            <th>Impact Window</th>
            <th data-col="energy" class="sortable">Energy (MT)</th>
            <th data-col="diameter" class="sortable">Diameter (m)</th>
          </tr>
        </thead>
        <tbody id="sentry-tbody"></tbody>
      </table>
    </div>
  `;
}

function renderSentryTable() {
  const tbody = document.getElementById('sentry-tbody');
  if (!tbody) return;
  let rows = [...sentryRows].filter(r => r.ts >= sentryFilter.torinoMin);
  rows.sort((a, b) => {
    const av = a[sentrySortCol], bv = b[sentrySortCol];
    return (av < bv ? -1 : av > bv ? 1 : 0) * sentrySortDir;
  });

  tbody.innerHTML = rows.map(r => {
    const pColor = PALERMO_COLOR(r.ps);
    const ipPct = (r.ip * 100).toFixed(6);
    const ipFraction = r.ip > 0 ? `1 in ${Math.round(1 / r.ip).toLocaleString()}` : '—';
    const tLabel = TORINO_LABELS[Math.min(r.ts, 10)] || '—';
    const tColor = r.ts === 0 ? '#00d4ff' : r.ts <= 3 ? '#ffb830' : '#ff4444';
    return `
      <tr>
        <td><a href="https://cneos.jpl.nasa.gov/sentry/details.html#?des=${encodeURIComponent(r.des)}" target="_blank" class="neo-link">${r.name}</a></td>
        <td class="mono">${ipFraction}<div class="dim">${ipPct}%</div></td>
        <td><span class="palermo-badge" style="color:${pColor};border-color:${pColor}">${r.ps.toFixed(2)}</span></td>
        <td><span class="torino-badge" style="background:${tColor}22;color:${tColor};border-color:${tColor}">${r.ts} — ${tLabel}</span></td>
        <td class="mono">${r.yearMin} – ${r.yearMax}</td>
        <td>${r.energy > 0 ? r.energy.toFixed(1) : '—'}</td>
        <td>${r.diameter ? r.diameter.toLocaleString() : '—'}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" class="empty-row">No objects match the current filter.</td></tr>';
}

function bindSentryEvents() {
  document.getElementById('sentry-torino')?.addEventListener('change', e => {
    sentryFilter.torinoMin = parseInt(e.target.value);
    renderSentryTable();
  });
  document.querySelectorAll('#sentry-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sentrySortCol === col) sentrySortDir *= -1;
      else { sentrySortCol = col; sentrySortDir = -1; }
      document.querySelectorAll('#sentry-table th').forEach(t => {
        t.classList.remove('active-sort');
        t.textContent = t.textContent.replace(/[▲▼]/g, '');
      });
      th.classList.add('active-sort');
      th.textContent += sentrySortDir === 1 ? ' ▲' : ' ▼';
      renderSentryTable();
    });
  });
}

function sentrySkeletonHTML() {
  return `<div class="skeleton-wrap">${Array(8).fill('<div class="skeleton-row"></div>').join('')}</div>`;
}

function sentryErrorHTML(msg) {
  return `
    <div class="error-card">
      <div class="error-title">Failed to load Sentry data</div>
      <div class="error-msg">${msg}</div>
      <button class="btn-retry" onclick="renderSentry()">Retry</button>
    </div>
  `;
}
