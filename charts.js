
let mainChart    = null;
let histChart    = null;
let activeMain   = 'moisture'; 
let activeHist   = 'moisture'; // active sensor for history chart
let activeHistP  = '24h';   

function baseScaleOptions() {
  return {
    x: {
      grid: { color: '#00000006' },
      ticks: { font: { size: 10 }, color: '#888' }
    },
    y: {
      grid: { color: '#00000008' },
      ticks: { font: { size: 10, family: 'DM Mono' }, color: '#888' }
    }
  };
}

function initMainChart() {
  const d   = SENSOR_DATA[activeMain];
  const ctx = document.getElementById('mainChart').getContext('2d');

  mainChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: CHART_HOURS,
      datasets: [{
        data:                 [...d.data],
        borderColor:          d.color,
        backgroundColor:      d.color + '18',
        fill:                 true,
        tension:              0.4,
        pointRadius:          3,
        pointBackgroundColor: d.color,
        borderWidth:          2
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: baseScaleOptions()
    }
  });
}

/**
 * Called by tab buttons on the Dashboard screen.
 * Switches the main line chart to a different sensor parameter.
 * @param {string} key   - sensor key: 'ph' | 'turb' | 'temp' | 'do'
 * @param {HTMLElement} btn - the clicked tab button element
 */
function switchMain(key, btn) {
  // Update active tab styling
  document.querySelectorAll('.tab-set .tab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');

  // Update active key and chart data
  activeMain = key;
  const d = SENSOR_DATA[key];

  mainChart.data.datasets[0].data                = [...d.data];
  mainChart.data.datasets[0].borderColor         = d.color;
  mainChart.data.datasets[0].backgroundColor     = d.color + '18';
  mainChart.data.datasets[0].pointBackgroundColor = d.color;
  mainChart.update();
}

// ── History Bar Chart ──────────────────────────────────────
function initHistChart() {
  const d   = SENSOR_DATA[activeHist];
  const { labels, values } = getHistDataset(d);

  if (histChart) histChart.destroy();

  const ctx = document.getElementById('histChart').getContext('2d');
  histChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data:            values,
        backgroundColor: d.color + '55',
        borderColor:     d.color,
        borderWidth:     1.5,
        borderRadius:    4
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        ...baseScaleOptions(),
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#888' } }
      }
    }
  });

  // Update stats panel
  document.getElementById('histTitle').textContent = d.label + ' — Last ' + activeHistP;
  document.getElementById('h-avg').textContent = d.avg;
  document.getElementById('h-max').textContent = d.max;
  document.getElementById('h-min').textContent = d.min;
}

/**
 * Builds labels + values arrays based on the selected period.
 * @param {object} d - sensor data object from SENSOR_DATA
 * @returns {{ labels: string[], values: number[] }}
 */
function getHistDataset(d) {
  if (activeHistP === '7d') {
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: d.data.slice(0, 7).map(v => +(v + (Math.random() - .5) * 0.2).toFixed(2))
    };
  }
  if (activeHistP === '30d') {
    return {
      labels: Array.from({ length: 10 }, (_, i) => 'Day ' + (i * 3 + 1)),
      values: d.data.slice(0, 10).map(v => +(v + (Math.random() - .5) * 0.3).toFixed(2))
    };
  }
  // Default: 24h
  return {
    labels: CHART_HOURS,
    values: [...d.data]
  };
}

/**
 * Called by period buttons on the History screen (24h / 7d / 30d).
 * @param {string} period - '24h' | '7d' | '30d'
 * @param {HTMLElement} btn
 */
function setHistPeriod(period, btn) {
  document.querySelectorAll('.history-controls .hctrl')
    .forEach((b, i) => { if (i < 3) b.classList.remove('on'); });
  btn.classList.add('on');
  activeHistP = period;
  initHistChart();
}

/**
 * Called by parameter buttons on the History screen.
 * @param {string} key - 'ph' | 'turb' | 'temp' | 'do'
 * @param {HTMLElement} btn
 */
function setHistParam(key, btn) {
  ['moisture', 'turb', 'temp', 'tds'].forEach(id => {
    document.getElementById('hp-' + id).classList.remove('on');
  });
  btn.classList.add('on');
  activeHist = key;
  initHistChart();
}
