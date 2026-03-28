
const CHART_HOURS = [
  '9A', '10A', '11A', '12P', '1P', '2P', '3P', '4P', '5P', '6P', '7P', 'Now'
];

const SENSOR_DATA = {
  moisture: {
    data:  [62, 65, 68, 71, 69, 67, 64, 63, 66, 70, 72, 74],
    color: '#3b82f6',
    avg:   '67.6',
    max:   '74',
    min:   '62',
    label: 'Moisture (%)'
  },
  turb: {
    data:  [3.1, 4.8, 4.2, 3.9, 3.5, 3.0, 2.9, 3.2, 3.8, 4.0, 4.5, 4.8],
    color: '#f59e0b',
    avg:   '3.74',
    max:   '4.8',
    min:   '2.9',
    label: 'Turbidity (NTU)'
  },
  temp: {
    data:  [27, 28, 29, 29.5, 30, 30.5, 31, 31.2, 31.5, 31.6, 31.7, 31.8],
    color: '#ef4444',
    avg:   '30.2',
    max:   '31.8',
    min:   '27.0',
    label: 'Temperature (°C)'
  },
  tds: {
    data:  [320, 335, 348, 360, 355, 342, 338, 350, 362, 370, 375, 380],
    color: '#8b5cf6',
    avg:   '352.9',
    max:   '380',
    min:   '320',
    label: 'TDS (ppm)'
  }
};

const SENSOR_SIM = {
  moisture: {
    base: 74, r: 2,
    safeMin: 40, safeMax: 80,
    scaleMin: 0, scaleMax: 100,
    dashValId: 'd-moisture', dashBarId: 'b-moisture', dashBarColor: '#3b82f6',
    gaugeId: 'g-moisture',   gaugeValId: 'gv-moisture', sensorValId: 'sv-moisture',
    unit: '%'
  },
  turb: {
    base: 4.8, r: 0.2,
    safeMin: 0, safeMax: 5,
    scaleMin: 0, scaleMax: 10,
    dashValId: 'd-turb',   dashBarId: 'b-turb',   dashBarColor: '#f59e0b',
    gaugeId:   'g-turb',   gaugeValId: 'gv-turb', sensorValId: 'sv-turb',
    unit: ' NTU'
  },
  temp: {
    base: 31.8, r: 0.15,
    safeMin: 10, safeMax: 30,
    scaleMin: 0, scaleMax: 40,
    dashValId: 'd-temp',   dashBarId: 'b-temp',   dashBarColor: '#ef4444',
    gaugeId:   'g-temp',   gaugeValId: 'gv-temp', sensorValId: 'sv-temp',
    unit: '°C'
  },
  tds: {
    base: 380, r: 8,
    safeMin: 0, safeMax: 500,
    scaleMin: 0, scaleMax: 1000,
    dashValId: 'd-tds',   dashBarId: 'b-tds',   dashBarColor: '#8b5cf6',
    gaugeId:   'g-tds',   gaugeValId: 'gv-tds', sensorValId: 'sv-tds',
    unit: ' ppm'
  }
};

const PAGE_TITLES = {
  dashboard: 'Dashboard Overview',
  sensors:   'Sensor Details',
  history:   'Historical Data',
  arch:      'System Architecture',
  settings:  'System Settings'
};
