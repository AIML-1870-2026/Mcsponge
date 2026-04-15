let sizeSpeedData = null;
let sizeSpeedNEOs = [];
let sizeSpeedSelected = null;

const SS_CHART_H = 180;

const SS_SIZE_REFS = [
  { label: 'Person', meters: 2 },
  { label: 'School Bus', meters: 12 },
  { label: 'Basketball Court', meters: 28 },
  { label: 'Statue of Liberty', meters: 93 },
];

const SS_SPEED_REFS = [
  { label: 'Commercial Jet', kmps: 0.25 },
  { label: 'Rifle Bullet', kmps: 1.20 },
  { label: 'ISS Orbital Speed', kmps: 7.66 },
  { label: 'Earth Orbital Speed', kmps: 29.78 },
];

async function renderSizeSpeed() {
  const container = document.getElementById('tab-sizespeed');
  container.innerHTML = `<div class="skeleton-wrap">${Array(6).fill('<div class="skeleton-row"></div>').join('')}</div>`;
  try {
    const start = todayStr();
    const end = offsetDate(7);
    sizeSpeedData = await fetchNeoWs(start, end);
    sizeSpeedNEOs = ssFlattenNEOs(sizeSpeedData);
    sizeSpeedSelected = sizeSpeedNEOs[0] || null;
    container.innerHTML = ssShellHTML();
    ssBindEvents();
    if (sizeSpeedSelected) ssRenderDetail(sizeSpeedSelected);
  } catch (e) {
    container.innerHTML = `
      <div class="error-card" style="max-width:400px;margin:24px auto">
        <div class="error-title">Failed to load data</div>
        <div class="error-msg">${e.message}</div>
        <button class="btn-retry" onclick="renderSizeSpeed()">Retry</button>
      </div>`;
  }
}

function ssFlattenNEOs(data) {
  const list = [];
  Object.values(data.near_earth_objects).forEach(dayList => {
    dayList.forEach(neo => {
      const a = neo.close_approach_data[0];
      list.push({
        id: neo.id,
        name: neo.name.replace(/[()]/g, '').trim(),
        date: a.close_approach_date,
        missLD: parseFloat(a.miss_distance.lunar),
        missKm: parseFloat(a.miss_distance.kilometers),
        velocity: parseFloat(a.relative_velocity.kilometers_per_second),
        diamMin: neo.estimated_diameter.meters.estimated_diameter_min,
        diamMax: neo.estimated_diameter.meters.estimated_diameter_max,
        hazardous: neo.is_potentially_hazardous_asteroid,
      });
    });
  });
  return list.sort((a, b) => a.missLD - b.missLD);
}

function ssShellHTML() {
  const items = sizeSpeedNEOs.map((neo, i) => {
    const avgDiam = Math.round((neo.diamMin + neo.diamMax) / 2);
    return `
      <div class="ss-item${i === 0 ? ' ss-item-active' : ''}" data-id="${neo.id}">
        <div class="ss-item-top">
          <span class="ss-item-name${neo.hazardous ? ' ss-item-haz' : ''}">${neo.name}</span>
          ${neo.hazardous ? '<span class="badge badge-red" style="font-size:9px;padding:1px 5px;margin-left:4px">PHA</span>' : ''}
        </div>
        <div class="ss-item-meta">
          <span>${neo.missLD.toFixed(3)} LD</span>
          <span>~${avgDiam} m</span>
          <span>${neo.velocity.toFixed(1)} km/s</span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="ss-layout">
      <div class="ss-list" id="ss-list">${items}</div>
      <div class="ss-detail" id="ss-detail"></div>
    </div>`;
}

function ssRenderDetail(neo) {
  const detail = document.getElementById('ss-detail');
  if (!detail) return;
  const avgDiam = (neo.diamMin + neo.diamMax) / 2;

  // --- Size bar chart ---
  const sizeItems = [
    ...SS_SIZE_REFS.map(r => ({ ...r, isNeo: false })),
    { label: neo.name, meters: avgDiam, isNeo: true },
  ].sort((a, b) => a.meters - b.meters);
  const maxSize = sizeItems[sizeItems.length - 1].meters;

  const sizeBarsHTML = sizeItems.map(item => {
    const barH = Math.max(6, Math.round((item.meters / maxSize) * SS_CHART_H));
    return `
      <div class="ss-bar-col">
        <span class="ss-bar-meters">${Math.round(item.meters)} m</span>
        <div class="ss-bar-body${item.isNeo ? ' ss-bar-neo' : ''}" style="height:${barH}px"></div>
        <span class="ss-bar-name">${item.isNeo ? '🚀 ' : ''}${item.label}</span>
      </div>`;
  }).join('');

  // --- Speed comparison bars ---
  const speedItems = [
    ...SS_SPEED_REFS.map(r => ({ ...r, isNeo: false })),
    { label: neo.name, kmps: neo.velocity, isNeo: true },
  ].sort((a, b) => a.kmps - b.kmps);
  const maxSpeed = speedItems[speedItems.length - 1].kmps;

  const speedBarsHTML = speedItems.map(item => {
    const pct = Math.max(2, Math.round((item.kmps / maxSpeed) * 100));
    return `
      <div class="ss-speed-row">
        <span class="ss-speed-label${item.isNeo ? ' ss-speed-neo' : ''}">${item.isNeo ? '🚀 ' : ''}${item.label}</span>
        <div class="ss-speed-track">
          <div class="ss-speed-fill${item.isNeo ? ' ss-speed-fill-neo' : ''}" style="width:${pct}%"></div>
        </div>
        <span class="ss-speed-val${item.isNeo ? ' ss-speed-neo' : ''}">${item.kmps.toFixed(2)} km/s</span>
      </div>`;
  }).join('');

  const mult = (neo.velocity / 1.20).toFixed(1);

  detail.innerHTML = `
    <div class="ss-detail-header">
      <h3 class="ss-detail-name">${neo.hazardous ? '<span style="color:var(--red)">⚠ </span>' : ''}${neo.name}</h3>
      <span class="ss-detail-sub">${neo.date} &nbsp;·&nbsp; ${neo.missLD.toFixed(3)} LD away &nbsp;·&nbsp; ${(neo.missKm / 1000).toFixed(0).toLocaleString()}K km</span>
    </div>

    <div class="ss-section">
      <div class="ss-section-label"><span class="ss-section-bar"></span> How Big Is It?</div>
      <div class="ss-size-chart">${sizeBarsHTML}</div>
      <div class="ss-diam-note">Estimated diameter: <span class="ss-cyan">${Math.round(neo.diamMin)}–${Math.round(neo.diamMax)}</span> m</div>
    </div>

    <div class="ss-section">
      <div class="ss-section-label"><span class="ss-section-bar"></span> Speed Check</div>
      <div class="ss-speed-chart">${speedBarsHTML}</div>
      <div class="ss-summary">
        <strong>${neo.name}</strong> is traveling at <strong>${neo.velocity.toFixed(2)} km/s</strong> — about <strong>${mult}×</strong> faster than a rifle bullet.
      </div>
    </div>
  `;
}

function ssBindEvents() {
  document.querySelectorAll('.ss-item').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.ss-item').forEach(e => e.classList.remove('ss-item-active'));
      el.classList.add('ss-item-active');
      const neo = sizeSpeedNEOs.find(n => n.id === el.dataset.id);
      if (neo) { sizeSpeedSelected = neo; ssRenderDetail(neo); }
    });
  });
}
