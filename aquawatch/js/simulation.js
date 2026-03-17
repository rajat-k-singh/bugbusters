
const SIM_INTERVAL_MS = 4000;

/**
 * Calculates a new simulated sensor value by randomly
 * fluctuating within ± range of the base value.
 * @param {number} base - resting value
 * @param {number} r    - max fluctuation amount
 * @returns {number} new value rounded to 1 decimal place
 */
function simulateValue(base, r) {
  return +(base + (Math.random() - 0.5) * 2 * r).toFixed(1);
}

/**
 * Calculates percentage position for the dashboard bar
 * based on safe range min/max.
 * @param {number} value
 * @param {number} min - safe range min
 * @param {number} max - safe range max
 * @returns {string} clamped percentage string e.g. "73"
 */
function toDashPercent(value, min, max) {
  return Math.min(100, Math.max(3, ((value - min) / (max - min)) * 100)).toFixed(0);
}

/**
 * Calculates percentage position for the sensor gauge
 * based on the full scale range.
 * @param {number} value
 * @param {number} scaleMin
 * @param {number} scaleMax
 * @returns {string} clamped percentage string
 */
function toGaugePercent(value, scaleMin, scaleMax) {
  return Math.min(100, Math.max(3, ((value - scaleMin) / (scaleMax - scaleMin)) * 100)).toFixed(0);
}

/**
 * Updates a single DOM element's text content safely.
 * Does nothing if the element is not found.
 * @param {string} id
 * @param {string|number} text
 */
function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Updates a single DOM element's CSS width property safely.
 * @param {string} id
 * @param {string} width - e.g. "73%"
 */
function setElWidth(id, width) {
  const el = document.getElementById(id);
  if (el) el.style.width = width;
}

function simulationTick() {
  Object.keys(SENSOR_SIM).forEach(key => {
    const s   = SENSOR_SIM[key];
    const val = simulateValue(s.base, s.r);

    const dashPct = toDashPercent(val, s.safeMin, s.safeMax);
    setElText(s.dashValId, val);
    setElWidth(s.dashBarId, dashPct + '%');

    const gaugePct = toGaugePercent(val, s.scaleMin, s.scaleMax);
    setElWidth(s.gaugeId, gaugePct + '%');
    setElText(s.gaugeValId, val);
    setElText(s.sensorValId, val + s.unit);

    const chartDataset = SENSOR_DATA[key].data;
    chartDataset.push(val);
    chartDataset.shift();

    // ── Refresh main chart if this sensor is active ───────
    if (key === activeMain && mainChart) {
      mainChart.data.datasets[0].data = [...chartDataset];
      mainChart.update('none'); // 'none' skips animation for smooth live update
    }
  });
}

setInterval(simulationTick, SIM_INTERVAL_MS);
