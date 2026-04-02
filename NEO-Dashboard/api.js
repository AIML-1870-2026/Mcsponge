const _cache = {};

async function fetchJSON(url) {
  if (_cache[url]) return _cache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  _cache[url] = data;
  return data;
}

async function fetchNeoWs(startDate, endDate) {
  const url = `${CONFIG.NEOWS_BASE}?start_date=${startDate}&end_date=${endDate}&api_key=${CONFIG.NASA_API_KEY}`;
  return fetchJSON(url);
}

async function fetchSBDB({ dateMin, dateMax, distMax = '0.2' } = {}) {
  const params = new URLSearchParams({ 'dist-max': distMax });
  if (dateMin) params.set('date-min', dateMin);
  if (dateMax) params.set('date-max', dateMax);
  params.set('sort', 'date');
  const apiUrl = `${CONFIG.SBDB_BASE}?${params}`;
  const url = `${CONFIG.JPL_PROXY}${encodeURIComponent(apiUrl)}`;
  return fetchJSON(url);
}

async function fetchSentry() {
  const url = `${CONFIG.JPL_PROXY}${encodeURIComponent(CONFIG.SENTRY_BASE)}`;
  return fetchJSON(url);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function offsetDate(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
