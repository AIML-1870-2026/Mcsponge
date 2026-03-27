/* ── State ── */
const state = {
  lat: null,
  lon: null,
  unit: 'imperial',
  forecastList: [],
  currentRaw: null,
};

/* ── DOM refs ── */
const splashEl        = document.getElementById('splash');
const splashInput     = document.getElementById('splashInput');
const splashSearchBtn = document.getElementById('splashSearchBtn');
const splashGeoBtn    = document.getElementById('splashGeoBtn');
const splashSuggest   = document.getElementById('splashSuggestions');
const splashErrorEl   = document.getElementById('splashError');

const cityInput     = document.getElementById('cityInput');
const searchBtn     = document.getElementById('searchBtn');
const geoBtn        = document.getElementById('geoBtn');
const suggestionsEl = document.getElementById('suggestions');
const themeToggle   = document.getElementById('themeToggle');
const loadingEl     = document.getElementById('loadingOverlay');
const errorEl       = document.getElementById('errorMsg');
const btnF          = document.getElementById('btnF');
const btnC          = document.getElementById('btnC');

/* ── Utility ── */
const show = id => document.getElementById(id).classList.remove('hidden');
const hide = id => document.getElementById(id).classList.add('hidden');
const setLoading = on => on ? loadingEl.classList.remove('hidden') : loadingEl.classList.add('hidden');
const showError  = msg => { errorEl.textContent = msg; errorEl.classList.remove('hidden'); };
const clearError = ()  => errorEl.classList.add('hidden');

function countryFlag(code) {
  return [...code.toUpperCase()].map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('');
}

function formatTime(unixUTC, tz) {
  const d = new Date((unixUTC + tz) * 1000);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}

function toDisplay(f) {
  return state.unit === 'metric' ? `${Math.round((f - 32) * 5 / 9)}°C` : `${Math.round(f)}°F`;
}
function windDisplay(mph) {
  return state.unit === 'metric' ? `${Math.round(mph * 1.60934)} km/h` : `${Math.round(mph)} mph`;
}

const iconUrl = code => `https://openweathermap.org/img/wn/${code}@2x.png`;

/* ── Moon Phase ── */
function getMoonPhase() {
  const knownNew = new Date('2000-01-06T18:14:00Z');
  const phase = ((Date.now() - knownNew) / 86400000 % 29.53058867 + 29.53058867) % 29.53058867;
  const phases = [
    [1.85,  '🌑 New Moon'],        [7.38,  '🌒 Waxing Crescent'],
    [9.22,  '🌓 First Quarter'],   [14.77, '🌔 Waxing Gibbous'],
    [16.61, '🌕 Full Moon'],       [22.15, '🌖 Waning Gibbous'],
    [23.99, '🌗 Last Quarter'],    [29.53, '🌘 Waning Crescent'],
  ];
  return (phases.find(([max]) => phase < max) || phases[0])[1];
}

/* ── Feels-Like Note ── */
function feelsLikeNote(tempF, feelsF, humidity, windMph) {
  const diff = feelsF - tempF;
  if (diff < -3 && windMph > 5) return 'wind chill';
  if (diff > 3 && humidity > 60) return 'humidity effect';
  return '';
}

/* ── AQI Data ── */
const AQI_LEVELS = [
  { label: 'Good',      desc: 'Air quality is satisfactory.',                           cls: 'aqi-1' },
  { label: 'Fair',      desc: 'Acceptable; some risk for sensitive groups.',             cls: 'aqi-2' },
  { label: 'Moderate',  desc: 'Sensitive groups may experience health effects.',         cls: 'aqi-3' },
  { label: 'Poor',      desc: 'Everyone may begin to experience health effects.',        cls: 'aqi-4' },
  { label: 'Very Poor', desc: 'Health warnings — emergency conditions for everyone.',    cls: 'aqi-5' },
];

/* ── Alert Generation ── */
function generateAlerts(current) {
  const alerts = [];
  const id   = current.weather[0].id;
  const temp = current.main.temp;
  const wind = current.wind.speed;
  const vis  = current.visibility;

  if (id >= 200 && id < 300)
    alerts.push({ icon: '⚡', title: 'Thunderstorm', msg: current.weather[0].description });
  if (id === 502 || id === 503 || id === 504 || id === 522)
    alerts.push({ icon: '🌧️', title: 'Heavy Rain Warning', msg: 'Heavy rainfall may cause flooding.' });
  if (id === 511)
    alerts.push({ icon: '🌨️', title: 'Freezing Rain', msg: 'Surfaces may be icy and dangerous.' });
  if (id >= 600 && id < 700)
    alerts.push({ icon: '❄️', title: 'Snow Advisory', msg: current.weather[0].description });
  if (temp <= 15)
    alerts.push({ icon: '🥶', title: 'Extreme Cold Warning', msg: `Temperature is ${Math.round(temp)}°F. Limit time outdoors.` });
  if (temp >= 100)
    alerts.push({ icon: '🌡️', title: 'Extreme Heat Warning', msg: `Temperature is ${Math.round(temp)}°F. Stay hydrated.` });
  if (wind >= 40)
    alerts.push({ icon: '💨', title: 'High Wind Warning', msg: `Winds at ${Math.round(wind)} mph.` });
  if (vis && vis < 500)
    alerts.push({ icon: '🌫️', title: 'Very Low Visibility', msg: `Visibility: ${(vis / 1000).toFixed(1)} km.` });

  return alerts;
}

/* ── Best Time Outside ── */
function getBestTime(list) {
  const scored = list.slice(0, 8).map(item => {
    const id   = item.weather[0].id;
    const temp = item.main.temp;
    const pop  = (item.pop || 0) * 100;
    const wind = item.wind?.speed || 0;
    let score  = 100;
    if (id >= 200 && id < 700) score -= 60;
    score -= pop * 0.4;
    if (temp < 32) score -= 40; else if (temp < 45) score -= 20;
    if (temp > 95) score -= 30; else if (temp > 85) score -= 10;
    if (wind > 30) score -= 30; else if (wind > 20) score -= 12;
    return { item, score };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best.score < 10) return null;
  return {
    time: new Date(best.item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    temp: best.item.main.temp,
    desc: best.item.weather[0].description,
    pop:  Math.round((best.item.pop || 0) * 100),
    icon: best.item.weather[0].icon,
  };
}

/* ── API ── */
const apiFetch = async url => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};
const geocode        = q   => apiFetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${CONFIG.API_KEY}`);
const reverseGeocode = (lat,lon) => apiFetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${CONFIG.API_KEY}`);
const fetchCurrent   = (lat,lon) => apiFetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=imperial`);
const fetchForecast  = (lat,lon) => apiFetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=imperial`);
const fetchAQI       = (lat,lon) => apiFetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}`);

/* ── Render: Alerts ── */
function renderAlerts(current) {
  const alerts = generateAlerts(current);
  const list   = document.getElementById('alertsList');
  if (!alerts.length) { hide('alertsSection'); return; }
  list.innerHTML = alerts.map(a => `
    <div class="alert-item">
      <span class="alert-icon">${a.icon}</span>
      <div class="alert-body">
        <div class="alert-title">${a.title}</div>
        <div class="alert-msg">${a.msg}</div>
      </div>
    </div>`).join('');
  show('alertsSection');
}

/* ── Render: Current Conditions ── */
function renderCurrent(data) {
  const flag = data.sys?.country ? countryFlag(data.sys.country) : '';
  document.getElementById('currentCity').textContent = `${data.name} ${flag}`;
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const iconEl = document.getElementById('currentIcon');
  iconEl.src = iconUrl(data.weather[0].icon);
  iconEl.alt = data.weather[0].description;
  document.getElementById('currentDesc').textContent = data.weather[0].description;

  document.getElementById('currentTemp').textContent = toDisplay(data.main.temp);
  document.getElementById('feelsLike').textContent   = toDisplay(data.main.feels_like);
  document.getElementById('humidity').textContent    = `${data.main.humidity}%`;
  document.getElementById('wind').textContent        = windDisplay(data.wind.speed);
  document.getElementById('pressure').textContent    = `${data.main.pressure} hPa`;
  document.getElementById('visibility').textContent  = data.visibility ? `${(data.visibility/1000).toFixed(1)} km` : '—';
  document.getElementById('sunrise').textContent     = formatTime(data.sys.sunrise, data.timezone);
  document.getElementById('sunset').textContent      = formatTime(data.sys.sunset,  data.timezone);
  document.getElementById('moonPhase').textContent   = getMoonPhase();

  const note = feelsLikeNote(data.main.temp, data.main.feels_like, data.main.humidity, data.wind.speed);
  document.getElementById('feelsLikeNote').textContent = note;
}

/* ── Render: Hourly ── */
function renderHourly(list) {
  document.getElementById('hourlyStrip').innerHTML = list.slice(0, 8).map(item => {
    const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const pop  = item.pop ? `💧${Math.round(item.pop * 100)}%` : '&nbsp;';
    return `
      <div class="hourly-item">
        <div class="h-time">${time}</div>
        <img src="${iconUrl(item.weather[0].icon)}" alt="${item.weather[0].description}" />
        <div class="h-temp">${toDisplay(item.main.temp)}</div>
        <div class="h-pop">${pop}</div>
      </div>`;
  }).join('');
}

/* ── Render: 7-Day Forecast ── */
function renderForecast(list) {
  const days = {};
  list.forEach(item => {
    const key = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!days[key]) days[key] = { temps: [], icons: [], descs: [], pops: [] };
    days[key].temps.push(item.main.temp);
    days[key].icons.push(item.weather[0].icon);
    days[key].descs.push(item.weather[0].description);
    days[key].pops.push(item.pop || 0);
  });

  document.getElementById('forecastGrid').innerHTML = Object.entries(days).slice(0, 7).map(([day, d]) => {
    const high = Math.max(...d.temps);
    const low  = Math.min(...d.temps);
    const mid  = Math.floor(d.icons.length / 2);
    const pop  = Math.round(Math.max(...d.pops) * 100);
    return `
      <div class="forecast-card">
        <span class="f-day">${day}</span>
        <img src="${iconUrl(d.icons[mid])}" alt="${d.descs[mid]}" />
        <span class="f-desc">${d.descs[mid]}</span>
        <span class="f-temps">
          <span class="f-high">${toDisplay(high)}</span>
          <span class="f-low">${toDisplay(low)}</span>
        </span>
        ${pop > 0 ? `<span class="f-pop">💧${pop}%</span>` : ''}
      </div>`;
  }).join('');
}

/* ── Render: Temperature Chart ── */
let tempChartInst = null;

function renderChart(list) {
  const items     = list.slice(0, 16);
  const isDark    = document.documentElement.getAttribute('data-theme') === 'dark';
  const tickColor = isDark ? '#8b949e' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  if (tempChartInst) tempChartInst.destroy();
  tempChartInst = new Chart(document.getElementById('tempChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: items.map(i => new Date(i.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })),
      datasets: [{
        label: state.unit === 'metric' ? 'Temperature (°C)' : 'Temperature (°F)',
        data: items.map(i => state.unit === 'metric' ? Math.round((i.main.temp - 32) * 5 / 9) : Math.round(i.main.temp)),
        borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.12)',
        pointBackgroundColor: '#58a6ff', fill: true, tension: 0.4, pointRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { labels: { color: tickColor } } },
      scales: {
        x: { ticks: { color: tickColor, maxRotation: 45 }, grid: { color: gridColor } },
        y: { ticks: { color: tickColor }, grid: { color: gridColor } }
      }
    }
  });
}

/* ── Render: AQI ── */
function renderAQI(data) {
  const card = document.getElementById('aqiCard');
  if (!data?.list?.[0]) {
    card.innerHTML = '<span style="color:var(--text2);font-size:0.9rem;">Air quality data unavailable.</span>';
    return;
  }
  const { aqi }        = data.list[0].main;
  const { pm2_5, pm10, o3, no2 } = data.list[0].components;
  const level = AQI_LEVELS[aqi - 1] || AQI_LEVELS[0];

  card.innerHTML = `
    <div class="aqi-left">
      <div class="aqi-badge ${level.cls}">${aqi}</div>
      <div>
        <div class="aqi-label">${level.label}</div>
        <div class="aqi-desc">${level.desc}</div>
      </div>
    </div>
    <div class="aqi-pollutants">
      <div class="pollutant"><span>PM2.5</span><span>${pm2_5.toFixed(1)} µg/m³</span></div>
      <div class="pollutant"><span>PM10</span><span>${pm10.toFixed(1)} µg/m³</span></div>
      <div class="pollutant"><span>O₃</span><span>${o3.toFixed(1)} µg/m³</span></div>
      <div class="pollutant"><span>NO₂</span><span>${no2.toFixed(1)} µg/m³</span></div>
    </div>`;
}

/* ── Render: Best Time Outside ── */
function renderBestTime(list) {
  const result = getBestTime(list);
  const card   = document.getElementById('bestTimeCard');
  if (!result) {
    card.innerHTML = '<span class="best-time-none">No great windows today — conditions are rough outside. 🌧️</span>';
    return;
  }
  card.innerHTML = `
    <img src="${iconUrl(result.icon)}" alt="${result.desc}" />
    <div>
      <div class="best-time-time">${result.time}</div>
      <div class="best-time-temp">${toDisplay(result.temp)}</div>
      <div class="best-time-desc">${result.desc}${result.pop > 0 ? ` · 💧${result.pop}%` : ''}</div>
    </div>`;
}

/* ── Render: Precipitation Chart ── */
let precipChartInst = null;

function renderPrecipChart(list) {
  const items     = list.slice(0, 8);
  const isDark    = document.documentElement.getAttribute('data-theme') === 'dark';
  const tickColor = isDark ? '#8b949e' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  if (precipChartInst) precipChartInst.destroy();
  precipChartInst = new Chart(document.getElementById('precipChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: items.map(i => new Date(i.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })),
      datasets: [
        {
          label: 'Rain Chance (%)',
          data: items.map(i => Math.round((i.pop || 0) * 100)),
          backgroundColor: 'rgba(88,166,255,0.5)',
          borderColor: '#58a6ff',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Amount (mm)',
          data: items.map(i => parseFloat(((i.rain?.['3h'] || 0) + (i.snow?.['3h'] || 0)).toFixed(2))),
          type: 'line',
          borderColor: '#a5d6ff',
          backgroundColor: 'rgba(165,214,255,0.15)',
          pointBackgroundColor: '#a5d6ff',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: tickColor } } },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: {
          type: 'linear', position: 'left', min: 0, max: 100,
          ticks: { color: tickColor, callback: v => `${v}%` },
          grid: { color: gridColor }
        },
        y1: {
          type: 'linear', position: 'right', min: 0,
          ticks: { color: tickColor, callback: v => `${v}mm` },
          grid: { display: false }
        }
      }
    }
  });
}

/* ── Splash transition ── */
function transitionToDashboard(cityName) {
  if (cityName) cityInput.value = cityName;
  splashEl.classList.add('fade-out');
  setTimeout(() => { splashEl.style.display = 'none'; }, 500);
  document.getElementById('appHeader').classList.remove('hidden');
  document.getElementById('appMain').classList.remove('hidden');
}

/* ── Full weather load ── */
async function loadWeather(lat, lon) {
  setLoading(true);
  clearError();

  try {
    const [curRes, fcRes, aqiRes] = await Promise.allSettled([
      fetchCurrent(lat, lon),
      fetchForecast(lat, lon),
      fetchAQI(lat, lon),
    ]);

    if (curRes.status === 'rejected') throw curRes.reason;
    if (fcRes.status  === 'rejected') throw fcRes.reason;

    const current  = curRes.value;
    const forecast = fcRes.value;
    const aqi      = aqiRes.status === 'fulfilled' ? aqiRes.value : null;

    state.currentRaw   = current;
    state.forecastList = forecast.list;
    state.lat = lat;
    state.lon = lon;

    renderAlerts(current);
    renderCurrent(current);
    renderHourly(forecast.list);
    renderForecast(forecast.list);
    renderChart(forecast.list);
    renderAQI(aqi);
    renderBestTime(forecast.list);
    renderPrecipChart(forecast.list);

    document.getElementById('dashboard').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    showError(e.message || 'Failed to load weather data.');
  } finally {
    setLoading(false);
  }
}

/* ── Unit toggle ── */
function applyUnitChange() {
  if (!state.currentRaw) return;
  renderCurrent(state.currentRaw);
  renderHourly(state.forecastList);
  renderForecast(state.forecastList);
  renderChart(state.forecastList);
  renderBestTime(state.forecastList);
}
btnF.addEventListener('click', () => {
  if (state.unit === 'imperial') return;
  state.unit = 'imperial';
  btnF.classList.add('active'); btnC.classList.remove('active');
  applyUnitChange();
});
btnC.addEventListener('click', () => {
  if (state.unit === 'metric') return;
  state.unit = 'metric';
  btnC.classList.add('active'); btnF.classList.remove('active');
  applyUnitChange();
});

/* ── Theme toggle ── */
themeToggle.addEventListener('click', () => {
  const html   = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  if (state.forecastList.length) {
    renderChart(state.forecastList);
    renderPrecipChart(state.forecastList);
  }
});

/* ── Keyboard navigation for suggestions ── */
const arrowIndex = { splash: -1, header: -1 };

function handleArrowNav(e, suggestEl, key) {
  if (suggestEl.classList.contains('hidden')) return false;
  const items = [...suggestEl.querySelectorAll('li:not(.no-results)')];
  if (!items.length) return false;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    arrowIndex[key] = Math.min(arrowIndex[key] + 1, items.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    arrowIndex[key] = Math.max(arrowIndex[key] - 1, -1);
  } else if (e.key === 'Enter' && arrowIndex[key] >= 0) {
    items[arrowIndex[key]].click();
    arrowIndex[key] = -1;
    return true;
  } else {
    return false;
  }

  items.forEach((li, i) => li.classList.toggle('selected', i === arrowIndex[key]));
  if (arrowIndex[key] >= 0) items[arrowIndex[key]].scrollIntoView({ block: 'nearest' });
  return true;
}

/* ── Suggestions builder ── */
function buildSuggestions(results, inputEl, suggestEl, onSelect, key) {
  suggestEl.innerHTML = '';
  arrowIndex[key] = -1;

  if (!results.length) {
    const li = document.createElement('li');
    li.className = 'no-results';
    li.textContent = 'No cities found';
    suggestEl.appendChild(li);
    suggestEl.classList.remove('hidden');
    return;
  }

  results.forEach(r => {
    const li   = document.createElement('li');
    const flag = r.country ? countryFlag(r.country) : '';
    li.textContent = [r.name, r.state, r.country].filter(Boolean).join(', ') + ' ' + flag;
    li.addEventListener('click', () => {
      inputEl.value = r.name;
      suggestEl.classList.add('hidden');
      onSelect(r);
    });
    suggestEl.appendChild(li);
  });
  suggestEl.classList.remove('hidden');
}

/* ── Splash search ── */
let splashTimer = null;

splashInput.addEventListener('input', () => {
  clearTimeout(splashTimer);
  const q = splashInput.value.trim();
  if (q.length < 2) { splashSuggest.classList.add('hidden'); return; }
  splashTimer = setTimeout(async () => {
    try {
      buildSuggestions(await geocode(q), splashInput, splashSuggest, r => {
        localStorage.setItem('lastCity', JSON.stringify({ lat: r.lat, lon: r.lon, name: r.name }));
        transitionToDashboard(r.name);
        loadWeather(r.lat, r.lon);
      }, 'splash');
    } catch (_) {}
  }, 300);
});

async function doSplashSearch() {
  const q = splashInput.value.trim();
  if (!q) return;
  splashSuggest.classList.add('hidden');
  splashErrorEl.classList.add('hidden');
  splashSearchBtn.disabled = true;
  try {
    const results = await geocode(q);
    if (!results.length) throw new Error('City not found. Try a different name.');
    const r = results[0];
    localStorage.setItem('lastCity', JSON.stringify({ lat: r.lat, lon: r.lon, name: r.name }));
    transitionToDashboard(r.name);
    loadWeather(r.lat, r.lon);
  } catch (e) {
    splashErrorEl.textContent = e.message;
    splashErrorEl.classList.remove('hidden');
    splashSearchBtn.disabled = false;
  }
}

splashSearchBtn.addEventListener('click', doSplashSearch);
splashInput.addEventListener('keydown', e => {
  if (handleArrowNav(e, splashSuggest, 'splash')) return;
  if (e.key === 'Enter') doSplashSearch();
});

splashGeoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    splashErrorEl.textContent = 'Geolocation is not supported by your browser.';
    splashErrorEl.classList.remove('hidden');
    return;
  }
  splashGeoBtn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude: lat, longitude: lon } }) => {
      let name = '';
      try { const p = await reverseGeocode(lat, lon); if (p.length) name = p[0].name; } catch (_) {}
      localStorage.setItem('lastCity', JSON.stringify({ lat, lon, name }));
      transitionToDashboard(name);
      loadWeather(lat, lon);
    },
    () => {
      splashErrorEl.textContent = 'Location access denied. Please search manually.';
      splashErrorEl.classList.remove('hidden');
      splashGeoBtn.disabled = false;
    }
  );
});

/* ── Close suggestions on outside click ── */
document.addEventListener('click', e => {
  if (!e.target.closest('#splash .search-input-wrap'))    splashSuggest.classList.add('hidden');
  if (!e.target.closest('#appHeader .search-input-wrap')) suggestionsEl.classList.add('hidden');
});

/* ── Header search ── */
let suggestTimer = null;

cityInput.addEventListener('input', () => {
  clearTimeout(suggestTimer);
  const q = cityInput.value.trim();
  if (q.length < 2) { suggestionsEl.classList.add('hidden'); return; }
  suggestTimer = setTimeout(async () => {
    try {
      buildSuggestions(await geocode(q), cityInput, suggestionsEl, r => {
        localStorage.setItem('lastCity', JSON.stringify({ lat: r.lat, lon: r.lon, name: r.name }));
        loadWeather(r.lat, r.lon);
      }, 'header');
    } catch (_) {}
  }, 300);
});

async function doSearch() {
  const q = cityInput.value.trim();
  if (!q) return;
  suggestionsEl.classList.add('hidden');
  setLoading(true); clearError();
  try {
    const results = await geocode(q);
    if (!results.length) throw new Error('City not found. Try a different name.');
    const r = results[0];
    cityInput.value = r.name;
    localStorage.setItem('lastCity', JSON.stringify({ lat: r.lat, lon: r.lon, name: r.name }));
    loadWeather(r.lat, r.lon);
  } catch (e) {
    setLoading(false);
    showError(e.message);
  }
}

searchBtn.addEventListener('click', doSearch);
cityInput.addEventListener('keydown', e => {
  if (handleArrowNav(e, suggestionsEl, 'header')) return;
  if (e.key === 'Enter') doSearch();
});

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) { showError('Geolocation is not supported by your browser.'); return; }
  setLoading(true); clearError();
  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude: lat, longitude: lon } }) => {
      try {
        const p = await reverseGeocode(lat, lon);
        if (p.length) cityInput.value = p[0].name;
        localStorage.setItem('lastCity', JSON.stringify({ lat, lon, name: cityInput.value }));
      } catch (_) {}
      loadWeather(lat, lon);
    },
    () => { setLoading(false); showError('Location access denied. Please search manually.'); }
  );
});

/* ── Pre-fill splash from localStorage ── */
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('lastCity');
  if (saved) { try { splashInput.value = JSON.parse(saved).name || ''; } catch (_) {} }
  splashInput.focus();
});
