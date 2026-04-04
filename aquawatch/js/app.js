
/**
 * Shows the selected screen and updates sidebar nav state.
 * Also lazily initializes the History chart on first visit.
 * @param {string} name       - screen key: 'dashboard' | 'sensors' | 'history' | 'arch' | 'settings'
 * @param {HTMLElement} [el]  - the nav-item element that was clicked
 */
function showScreen(name, el) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  // Show the target screen
  document.getElementById('screen-' + name).classList.add('active');
  // Update topbar title
  document.getElementById('pageTitle').textContent = PAGE_TITLES[name];
  // Update sidebar nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');

  // Lazy-initialize history chart the first time the screen is opened
  if (name === 'history' && !histChart) {
    setTimeout(initHistChart, 50);
  }
}

function updateClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString();
}

// ── Settings Helpers ───────────────────────────────────────

/**
 * Provides visual feedback when a settings save button is clicked.
 * Temporarily changes the button text to "✓ Saved!" then restores it.
 * @param {HTMLElement} btn   - the button element
 * @param {string} originalText - text to restore after 1.5s
 */
function savedFeedback(btn, originalText) {
  btn.textContent = '✓ Saved!';
  setTimeout(() => { btn.textContent = originalText; }, 1500);
}

function setStatusLine(text) {
  const el = document.getElementById('statusLine');
  if (el) el.textContent = text;
}

function setLiveModeLabel(text) {
  const el = document.getElementById('liveModeLabel');
  if (el) el.textContent = text;
}

function setIntervalLabel(ms) {
  const el = document.getElementById('intervalLabel');
  if (el) el.textContent = `${Math.round(ms / 100) / 10}s interval`;
}

function clamp01(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function pushChartPoint(key, val) {
  if (!SENSOR_DATA[key] || !Number.isFinite(val)) return;
  const chartDataset = SENSOR_DATA[key].data;
  chartDataset.push(val);
  chartDataset.shift();
  if (key === activeMain && mainChart) {
    mainChart.data.datasets[0].data = [...chartDataset];
    mainChart.update('none');
  }
}

function updateLiveUI(reading) {
  // reading: { temp, turb, tds, moisture }
  const mapping = {
    moisture: { unit: '%',   decimals: 0 },
    turb:     { unit: '',    decimals: 1 },
    temp:     { unit: '°C',  decimals: 1 },
    tds:      { unit: '',    decimals: 0 }
  };

  Object.keys(mapping).forEach(key => {
    const val = reading[key];
    if (!Number.isFinite(val)) return;

    // Dashboard number
    const dashId = SENSOR_SIM[key]?.dashValId;
    if (dashId) {
      const fmt = mapping[key].decimals === 0 ? Math.round(val) : +val.toFixed(mapping[key].decimals);
      const suffix = mapping[key].unit ? (' ' + mapping[key].unit) : '';
      const el = document.getElementById(dashId);
      if (el) el.textContent = '' + fmt;
      // apply red class only for temperature on main card
      if (dashId === 'd-temp') {
        el?.classList.toggle('red', val > SENSOR_SIM.temp.safeMax);
      }
    }

    // Dashboard bar width based on safe range
    const s = SENSOR_SIM[key];
    if (s) {
      const dashPct = Math.min(100, Math.max(3, ((val - s.safeMin) / (s.safeMax - s.safeMin)) * 100));
      const bar = document.getElementById(s.dashBarId);
      if (bar) bar.style.width = dashPct.toFixed(0) + '%';
    }

    // Sensor gauge + value
    if (SENSOR_SIM[key]) {
      const s2 = SENSOR_SIM[key];
      const gaugePct = Math.min(100, Math.max(3, ((val - s2.scaleMin) / (s2.scaleMax - s2.scaleMin)) * 100));
      const g = document.getElementById(s2.gaugeId);
      if (g) g.style.width = gaugePct.toFixed(0) + '%';
      const gv = document.getElementById(s2.gaugeValId);
      if (gv) gv.textContent = '' + (mapping[key].decimals === 0 ? Math.round(val) : +val.toFixed(mapping[key].decimals));
      const sv = document.getElementById(s2.sensorValId);
      if (sv) sv.textContent = (mapping[key].decimals === 0 ? Math.round(val) : +val.toFixed(mapping[key].decimals)) + s2.unit;
    }

    // Feed chart
    pushChartPoint(key, val);
  });
}

async function startLiveBlynkIfConfigured() {
  const b = window.BLYNK;
  if (!b || !b.token) return;

  window.__AQUAWATCH_LIVE_MODE__ = true;
  setLiveModeLabel('Blynk');
  setStatusLine('Fetching live data from Blynk…');
  setIntervalLabel(b.intervalMs || 5000);

  async function tick() {
    try {
      const reading = await b.fetchPins(b.token);
      updateLiveUI(reading);
      setStatusLine('Live: connected to Blynk');
    } catch (e) {
      // If Blynk fails, fall back to simulation so the UI isn't dead.
      window.__AQUAWATCH_LIVE_MODE__ = false;
      setLiveModeLabel('Simulation');
      setStatusLine('Live fetch failed. Falling back to simulation.');
      console.warn('Live mode disabled (Blynk fetch failed):', e);
    }
  }

  await tick();
  setInterval(tick, b.intervalMs || 5000);
}

function loadBlynkSettingsToUI() {
  const token = localStorage.getItem('aquawatch_blynk_token') || '';
  const intervalMs = Number.parseInt(localStorage.getItem('aquawatch_blynk_interval_ms') || '5000', 10);
  const tokenInput = document.getElementById('blynkTokenInput');
  const intervalInput = document.getElementById('blynkIntervalInput');
  if (tokenInput) tokenInput.value = token;
  if (intervalInput) intervalInput.value = Number.isFinite(intervalMs) ? intervalMs : 5000;
}

function applyBlynkSettingsFromStorage() {
  if (!window.BLYNK) return;
  const token = localStorage.getItem('aquawatch_blynk_token') || '';
  const intervalMs = Number.parseInt(localStorage.getItem('aquawatch_blynk_interval_ms') || '5000', 10);
  window.BLYNK.token = token.trim();
  window.BLYNK.intervalMs = Number.isFinite(intervalMs) ? intervalMs : 5000;
}

function saveBlynkSettings(btn) {
  const tokenInput = document.getElementById('blynkTokenInput');
  const intervalInput = document.getElementById('blynkIntervalInput');
  const token = (tokenInput?.value || '').trim();
  const intervalMs = Number.parseInt(intervalInput?.value || '5000', 10);

  localStorage.setItem('aquawatch_blynk_token', token);
  localStorage.setItem('aquawatch_blynk_interval_ms', String(Number.isFinite(intervalMs) ? intervalMs : 5000));

  if (btn) savedFeedback(btn, 'Save & Enable Live');

  applyBlynkSettingsFromStorage();
  startLiveBlynkIfConfigured();
}

function initApp() {
  // Start clock and tick immediately
  updateClock();
  setInterval(updateClock, 1000);

  initMainChart();

  setLiveModeLabel('Simulation');
  setStatusLine('Simulation running. Set token in Settings to enable Blynk.');

  loadBlynkSettingsToUI();
  applyBlynkSettingsFromStorage();
  startLiveBlynkIfConfigured();
}

document.addEventListener('DOMContentLoaded', initApp);
