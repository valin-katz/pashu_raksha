/* ============================================================
   PashuRaksha — app.js
   Livestock Health Surveillance System
============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================
let currentRole = 'officer';
let mapInstance = null;
let chartsInit = {};

const ROLES = {
  farmer:   { label: 'Farmer / Livestock Owner',  short: 'Farmer',          user: 'Ramesh Yadav',     loc: 'Babina Village, Jhansi',   avatar: 'RY' },
  fieldvet: { label: 'Field Veterinarian',          short: 'Field Vet',       user: 'Dr. Anita Sharma', loc: 'Babina Block, Jhansi',     avatar: 'AS' },
  paravet:  { label: 'Para-veterinary Worker',      short: 'Para-vet',        user: 'Suresh Kumar',     loc: 'Moth Block, Jhansi',       avatar: 'SK' },
  officer:  { label: 'District Health Officer',     short: 'District Officer', user: 'Dr. Deepak Kumar', loc: 'Jhansi District, UP',      avatar: 'DK' },
};

const TITLE_MAP = {
  dashboard:   'Dashboard',
  mastitis:    'Bovine Mastitis Sensor AI Lab',
  map:         'Risk Map',
  report:      'Report Symptoms',
  alerts:      'Alerts & Advisories',
  records:     'Animal Health Records',
  lab:         'Lab & Referrals',
  vaccination: 'Vaccination Tracker',
  settings:    'Settings',
};

// ============================================================
// ROLE SELECTION
// ============================================================
function selectRole(role, el) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  currentRole = role;
}

function setLang(lang, btn) {
  document.querySelectorAll('.role-lang-row .lang-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function enterApp() {
  const screen = document.getElementById('role-screen');
  const app    = document.getElementById('app');
  screen.classList.add('hidden');
  setTimeout(() => {
    screen.style.display = 'none';
    app.classList.add('visible');
    applyRole(currentRole);
    switchView('dashboard', document.querySelector('[data-view="dashboard"]'));
    // Init dashboard charts on first load
    setTimeout(initDashboardCharts, 100);
  }, 320);
}

function changeRole() {
  const screen = document.getElementById('role-screen');
  const app    = document.getElementById('app');
  app.classList.remove('visible');
  screen.style.display = 'flex';
  screen.style.opacity = '0';
  screen.style.transform = 'translateY(-8px)';
  screen.classList.remove('hidden');
  requestAnimationFrame(() => {
    screen.style.transition = 'opacity 200ms ease, transform 200ms ease';
    screen.style.opacity = '1';
    screen.style.transform = 'translateY(0)';
  });
}

function applyRole(role) {
  const cfg = ROLES[role] || ROLES.officer;
  document.getElementById('sidebar-role-name').textContent  = cfg.short;
  document.getElementById('sidebar-user-name').textContent  = cfg.user;
  document.getElementById('sidebar-user-role').textContent  = cfg.loc;
  document.getElementById('sidebar-avatar').textContent     = cfg.avatar;
}

// ============================================================
// NAVIGATION
// ============================================================
function switchView(viewId, navEl) {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  // Show target
  const target = document.getElementById('view-' + viewId);
  if (target) target.classList.add('active');

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');

  // Update breadcrumb
  const titleEl = document.getElementById('header-title');
  if (titleEl) titleEl.textContent = TITLE_MAP[viewId] || viewId;

  // Lazy init
  requestAnimationFrame(() => {
    if (viewId === 'dashboard' && !chartsInit.dashboard) {
      initDashboardCharts();
      chartsInit.dashboard = true;
    }
    if (viewId === 'map' && !mapInstance) {
      initMap();
    }
    if (viewId === 'vaccination' && !chartsInit.vacc) {
      initVaccChart();
      chartsInit.vacc = true;
    }
    if (viewId === 'mastitis') {
      if (!chartsInit.mastitis) {
        initMastitisModule();
        chartsInit.mastitis = true;
      } else {
        updateTrajectoryChart();
      }
    }
  });
}

// ============================================================
// LANGUAGE TOGGLE
// ============================================================
const LANG = {
  en: { reportTitle: 'Report Animal Health Symptoms' },
  hi: { reportTitle: '\u092a\u0936\u0941 \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u0932\u0915\u094d\u0937\u0923 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0915\u0930\u0947\u0902' },
  mr: { reportTitle: '\u092a\u0936\u0942 \u0906\u0930\u094b\u0917\u094d\u092f \u0932\u0915\u094d\u0937\u0923\u0947 \u0928\u094b\u0902\u0926\u0935\u093e' },
};

function headerLang(lang, btn) {
  document.querySelectorAll('.header-lang button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const s = LANG[lang] || LANG.en;
  const el = document.getElementById('report-title-text');
  if (el) el.textContent = s.reportTitle;
}

// ============================================================
// TABS (Report form)
// ============================================================
function switchTab(tabId, btn) {
  ['tab-basic', 'tab-symptoms', 'tab-history'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById('tab-' + tabId);
  if (target) target.style.display = 'block';

  document.querySelectorAll('#report-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ============================================================
// SYMPTOM CHIPS
// ============================================================
function toggleChip(label) {
  const cb = label.querySelector('input[type=checkbox]');
  // Wait for the browser to process the click before reading checked state
  setTimeout(() => {
    if (cb.checked) label.classList.add('checked');
    else label.classList.remove('checked');
  }, 0);
}

// ============================================================
// AI TRIAGE ENGINE
// ============================================================
const HIGH_RISK = ['fever', 'bleed', 'swollen', 'death', 'breath'];
const MED_RISK  = ['nasal', 'sores', 'lameness', 'abort'];

const TRIAGE = {
  critical: {
    color:    '#DC2626',
    bgCls:    'badge-danger',
    label:    'Critical Risk',
    diseases: 'Haemorrhagic Septicaemia, Anthrax',
    recs: [
      'Immediately isolate all affected animals from the herd',
      'Do NOT move animals — impose farm-level quarantine now',
      'Call the nearest veterinary officer immediately (Helpline: 1800-xxx)',
      'Collect and securely seal a sample for lab confirmation',
      'Notify your block-level animal health officer within the hour',
    ],
  },
  high: {
    color:    '#EA580C',
    bgCls:    'badge-high',
    label:    'High Risk',
    diseases: 'Foot & Mouth Disease, PPR',
    recs: [
      'Isolate affected animals from the rest of the herd within 24 hours',
      'Report to the nearest veterinary dispensary today',
      'Restrict all livestock movement from your farm',
      'Vaccinate unaffected animals if stock is available',
    ],
  },
  moderate: {
    color:    '#D97706',
    bgCls:    'badge-warning',
    label:    'Moderate Risk',
    diseases: 'Bovine Respiratory Disease, Internal Parasites',
    recs: [
      'Monitor affected animals closely every 12 hours',
      'Ensure clean drinking water and adequate nutrition',
      'Consult a para-vet or field veterinarian within 48 hours',
    ],
  },
  low: {
    color:    '#16A34A',
    bgCls:    'badge-success',
    label:    'Low Risk',
    diseases: 'Nutritional deficiency, Minor infection',
    recs: [
      'Observe animals for 3 to 5 days',
      'Ensure adequate feed, water and clean shelter',
      'Contact a para-vet if symptoms persist or worsen',
    ],
  },
};

function runTriage() {
  const checked = Array.from(
    document.querySelectorAll('#symptom-chips input:checked')
  ).map(c => c.value);
  const deaths = parseInt(document.getElementById('f-deaths')?.value || '0', 10) || 0;

  let score = 0;
  checked.forEach(sym => {
    if (HIGH_RISK.includes(sym))      score += 2;
    else if (MED_RISK.includes(sym))  score += 1;
    else                              score += 0.5;
  });
  if (deaths > 0) score += 2;

  const level =
    score >= 6 ? 'critical' :
    score >= 3 ? 'high'     :
    score >= 1 ? 'moderate' : 'low';

  const rule = TRIAGE[level];
  const pct  = Math.min(Math.round((score / 10) * 100), 100);

  // Show panel
  const panel = document.getElementById('triage-panel');
  if (!panel) return;
  panel.classList.add('visible');

  // Badge
  const badge = document.getElementById('triage-badge');
  badge.className = 'badge ' + rule.bgCls;
  badge.textContent = rule.label;

  // Risk bar
  const fill  = document.getElementById('triage-fill');
  const score_el = document.getElementById('triage-score');
  fill.style.width      = '0';
  fill.style.background = rule.color;
  score_el.style.color  = rule.color;
  setTimeout(() => { fill.style.width = pct + '%'; }, 50);
  score_el.textContent = pct + '%';

  // Diseases
  document.getElementById('triage-diseases').textContent = rule.diseases;

  // Recommendations
  document.getElementById('triage-recs').innerHTML =
    rule.recs.map(r => `<div class="triage-rec-item">${r}</div>`).join('');

  // Switch to symptom tab
  switchTab('symptoms', document.querySelectorAll('#report-tabs .tab-btn')[1]);

  // Scroll into view
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

// ============================================================
// MAP FILTER (visual only)
// ============================================================
function mf(btn) {
  const grp = btn.closest('.map-controls');
  // Only deactivate siblings in the same logical group (between separators)
  // For simplicity, track button groups by proximity
  const allBtns = grp ? Array.from(grp.querySelectorAll('.map-filter-btn')) : [];
  // Find separator divs to determine group boundaries
  const parent  = btn.parentElement;
  if (parent && parent.classList.contains('map-filter-group')) {
    parent.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
  } else {
    // Fallback: just toggle this button
    btn.classList.toggle('active');
    return;
  }
  btn.classList.add('active');
}

// ============================================================
// ALERT FILTER
// ============================================================
function filterAlerts(type, btn) {
  document.querySelectorAll('#alert-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#alert-list .alert-row').forEach(row => {
    const sev = row.dataset.sev;
    if (type === 'all')       row.style.display = 'flex';
    else if (type === 'advisory') row.style.display = sev === 'advisory' ? 'flex' : 'none';
    else row.style.display = sev === type ? 'flex' : 'none';
  });
}

// ============================================================
// CHART PERIOD (visual only)
// ============================================================
function setPeriod(period, btn) {
  document.querySelectorAll('.chart-p').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ============================================================
// CHART: DISEASE TREND
// ============================================================
function initDashboardCharts() {
  const CHART_DEFAULTS = {
    font: { family: "'Inter', sans-serif" },
    tooltip: {
      backgroundColor: '#fff',
      borderColor: '#E8E5DC',
      borderWidth: 1,
      titleColor: '#18181A',
      bodyColor: '#52524E',
      padding: 10,
      cornerRadius: 5,
      titleFont: { family: "'Inter', sans-serif", size: 12, weight: '600' },
      bodyFont: { family: "'Inter', sans-serif", size: 12 },
    },
  };

  // --- Trend chart ---
  const trendCtx = document.getElementById('trend-chart');
  if (trendCtx && !Chart.getChart(trendCtx)) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'HS',
            data:   [2, 1, 0, 0, 1, 3, 8, 12, 14, 18, 41, 38],
            borderColor: '#DC2626',
            backgroundColor: 'rgba(220,38,38,0.06)',
            borderWidth: 1.5, pointRadius: 3, pointBackgroundColor: '#DC2626',
            tension: 0.35, fill: true,
          },
          {
            label: 'FMD',
            data:   [4, 6, 3, 2, 1, 2, 5, 10, 18, 22, 29, 25],
            borderColor: '#D97706',
            backgroundColor: 'transparent',
            borderWidth: 1.5, pointRadius: 3, pointBackgroundColor: '#D97706',
            tension: 0.35, fill: false,
          },
          {
            label: 'PPR',
            data:   [1, 0, 0, 1, 2, 4, 6, 8, 10, 12, 12, 9],
            borderColor: '#1D4ED8',
            backgroundColor: 'transparent',
            borderWidth: 1.5, pointRadius: 3, pointBackgroundColor: '#1D4ED8',
            tension: 0.35, fill: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            position: 'top', align: 'end',
            labels: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#52524E', boxWidth: 20, boxHeight: 2, padding: 14, usePointStyle: true, pointStyle: 'line' },
          },
          tooltip: CHART_DEFAULTS.tooltip,
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: "'Inter',sans-serif", size: 11 }, color: '#8A8880' }, border: { color: '#E8E5DC' } },
          y: { beginAtZero: true, grid: { color: '#F1F0EC' }, ticks: { font: { family: "'Inter',sans-serif", size: 11 }, color: '#8A8880', maxTicksLimit: 5 }, border: { display: false } },
        },
      },
    });
  }

  // --- Donut chart ---
  const donutCtx = document.getElementById('disease-donut');
  if (donutCtx && !Chart.getChart(donutCtx)) {
    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['HS', 'FMD', 'Brucellosis', 'PPR', 'Others'],
        datasets: [{
          data: [41, 29, 16, 12, 7],
          backgroundColor: ['#DC2626', '#D97706', '#C2410C', '#1D4ED8', '#94A3B8'],
          borderWidth: 0, hoverOffset: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: CHART_DEFAULTS.tooltip },
      },
    });
  }
}

// ============================================================
// CHART: VACCINATION
// ============================================================
function initVaccChart() {
  const ctx = document.getElementById('vacc-chart');
  if (!ctx || Chart.getChart(ctx)) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Babina', 'Moth', 'Gursarai', 'Chirgaon', 'Mauranipur', 'Garautha'],
      datasets: [
        { label: 'Vaccinated', data: [3640, 2180, 1850, 1750, 820, 2637], backgroundColor: '#1C4532', borderRadius: 3 },
        { label: 'Remaining',  data: [360,  620,  1150, 1450, 1330, 963],  backgroundColor: '#EFEDE7', borderRadius: 3 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top', align: 'end',
          labels: { font: { family: "'Inter',sans-serif", size: 11 }, color: '#52524E', boxWidth: 10, boxHeight: 10, padding: 12 },
        },
        tooltip: {
          backgroundColor: '#fff', borderColor: '#E8E5DC', borderWidth: 1,
          titleColor: '#18181A', bodyColor: '#52524E', padding: 10, cornerRadius: 5,
          titleFont: { family: "'Inter',sans-serif", size: 12, weight: '600' },
          bodyFont: { family: "'Inter',sans-serif", size: 12 },
        },
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { family: "'Inter',sans-serif", size: 11 }, color: '#8A8880' }, border: { color: '#E8E5DC' } },
        y: { stacked: true, beginAtZero: true, grid: { color: '#F1F0EC' }, ticks: { font: { family: "'Inter',sans-serif", size: 11 }, color: '#8A8880', maxTicksLimit: 5 }, border: { display: false } },
      },
    },
  });
}

// ============================================================
// MAP
// ============================================================
function initMap() {
  if (mapInstance) return;

  // Add popup CSS override
  const style = document.createElement('style');
  style.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      border: 1px solid #E8E5DC;
      padding: 0;
    }
    .custom-popup .leaflet-popup-content { margin: 0; }
    .custom-popup .leaflet-popup-tip { display: none; }
    .custom-popup .leaflet-popup-tip-container { display: none; }
    .leaflet-popup-close-button { top: 8px !important; right: 8px !important; }
  `;
  document.head.appendChild(style);

  mapInstance = L.map('disease-map', {
    center:      [25.45, 79.0],
    zoom:        10,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  // CartoDB Positron — clean, minimal, no API key
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18,
  }).addTo(mapInstance);

  // Outbreak data
  const outbreaks = [
    { lat: 25.576, lng: 78.765, disease: 'Haemorrhagic Septicaemia', severity: 'critical', location: 'Babina Block, Jhansi',  animals: 56, deaths: 14 },
    { lat: 25.317, lng: 79.015, disease: 'FMD (suspected)',           severity: 'high',     location: 'Moth Block, Jhansi',    animals: 31, deaths: 0  },
    { lat: 25.523, lng: 78.938, disease: 'Brucellosis',               severity: 'moderate', location: 'Chirgaon, Jhansi',      animals: 12, deaths: 0  },
    { lat: 25.263, lng: 79.397, disease: 'PPR',                       severity: 'high',     location: 'Mauranipur, Jhansi',    animals: 45, deaths: 3  },
    { lat: 25.598, lng: 79.218, disease: 'Parasitic Infection',       severity: 'low',      location: 'Gursarai, Jhansi',      animals: 8,  deaths: 0  },
    { lat: 25.403, lng: 79.611, disease: 'PPR',                       severity: 'moderate', location: 'Lalitpur District',     animals: 88, deaths: 6  },
    { lat: 25.700, lng: 78.520, disease: 'FMD',                       severity: 'high',     location: 'Babina North, Jhansi',  animals: 22, deaths: 0  },
  ];

  const colorMap = { critical: '#DC2626', high: '#EA580C', moderate: '#D97706', low: '#16A34A' };
  const sizeMap  = { critical: 18, high: 13, moderate: 10, low: 7 };

  outbreaks.forEach(o => {
    const circle = L.circleMarker([o.lat, o.lng], {
      radius:      sizeMap[o.severity] || 9,
      fillColor:   colorMap[o.severity],
      color:       colorMap[o.severity],
      weight:      2,
      opacity:     0.8,
      fillOpacity: 0.22,
    }).addTo(mapInstance);

    const deathBadge = o.deaths > 0
      ? `<span style="font-weight:700;color:#DC2626">${o.deaths}</span>`
      : `<span style="color:#8A8880">0</span>`;

    circle.bindPopup(`
      <div style="font-family:'Inter',sans-serif;font-size:13px;min-width:200px;padding:14px">
        <div style="font-weight:600;color:#18181A;margin-bottom:5px">${o.disease}</div>
        <div style="font-size:12px;color:#52524E;margin-bottom:10px">&#128205; ${o.location}</div>
        <div style="display:flex;gap:14px;margin-bottom:10px">
          <div><div style="font-size:10px;color:#8A8880;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Animals</div><div style="font-weight:700;font-size:15px;color:#18181A">${o.animals}</div></div>
          <div><div style="font-size:10px;color:#8A8880;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Deaths</div><div style="font-weight:700;font-size:15px">${deathBadge}</div></div>
        </div>
        <div style="background:${colorMap[o.severity]}18;padding:4px 8px;border-radius:4px;font-size:11px;color:${colorMap[o.severity]};font-weight:600;display:inline-block;text-transform:capitalize">${o.severity} risk</div>
      </div>
    `, { className: 'custom-popup', maxWidth: 260, closeButton: true });
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Pre-select officer card on the role screen
  const officerCard = document.getElementById('rc-officer');
  if (officerCard) officerCard.classList.add('selected');
});

// ============================================================
// BOVINE MASTITIS PREDICTIVE MODELLING & SENSOR AI LAB
// ============================================================

const MASTITIS_PRESETS = {
  early_warning: {
    ph: 6.82, od: 0.38, cond: 5.90, temp: 38.9,
    ambTemp: 34, humidity: 72, bedding: 'damp', milkingHygiene: 'plain',
    tagId: 'IN-UP-JH-4082', breed: 'sahiwal', lactation: 'early', quarter: 'FL',
    chipId: 'chip-early'
  },
  healthy: {
    ph: 6.60, od: 0.12, cond: 4.60, temp: 38.3,
    ambTemp: 28, humidity: 55, bedding: 'clean', milkingHygiene: 'barrier',
    tagId: 'IN-UP-JH-4029', breed: 'gir', lactation: 'mid', quarter: 'ALL',
    chipId: 'chip-healthy'
  },
  moderate_subclinical: {
    ph: 7.08, od: 0.62, cond: 6.75, temp: 39.4,
    ambTemp: 36, humidity: 78, bedding: 'muddy', milkingHygiene: 'plain',
    tagId: 'IN-UP-JH-3891', breed: 'sahiwal', lactation: 'early', quarter: 'RL',
    chipId: 'chip-mod'
  },
  clinical_acute: {
    ph: 7.42, od: 1.25, cond: 8.40, temp: 40.2,
    ambTemp: 38, humidity: 82, bedding: 'muddy', milkingHygiene: 'unhygienic',
    tagId: 'IN-UP-JH-3714', breed: 'hf', lactation: 'mid', quarter: 'FR',
    chipId: 'chip-clinical'
  },
  buffalo_heat: {
    ph: 6.94, od: 0.44, cond: 6.15, temp: 39.3,
    ambTemp: 37, humidity: 76, bedding: 'damp', milkingHygiene: 'plain',
    tagId: 'IN-UP-JH-4105', breed: 'murrah', lactation: 'early', quarter: 'FL',
    chipId: 'chip-buffalo'
  }
};

let mastitisState = {
  ph: 6.82,
  od: 0.38,
  cond: 5.90,
  temp: 38.9,
  ambTemp: 34,
  humidity: 72,
  thi: 81.2,
  bedding: 'damp',
  milkingHygiene: 'plain',
  tagId: 'IN-UP-JH-4082',
  breed: 'sahiwal',
  lactation: 'early',
  quarter: 'FL',
  liveStreaming: false,
  streamTimer: null,
  trajectoryChart: null,
  currentRiskLevel: 'low',
  currentScore: 48,
  estScc: 380000,
  quartersStatus: {
    FL: 'warning',
    FR: 'normal',
    RL: 'normal',
    RR: 'normal',
  }
};

let sampleHistory = [
  { id: 'SMP-9041', tag: 'IN-UP-JH-4082', breed: 'Sahiwal', quarter: 'FL', ph: 6.82, od: 0.38, cond: 5.90, temp: 38.9, thi: 81.2, scc: '380,000', risk: 'Low (Subclinical 7-14d)', cat: 'subclinical', time: '10 min ago' },
  { id: 'SMP-9040', tag: 'IN-UP-JH-4105', breed: 'Murrah Buffalo', quarter: 'RL', ph: 6.94, od: 0.44, cond: 6.15, temp: 39.3, thi: 87.1, scc: '490,000', risk: 'Moderate Subclinical', cat: 'subclinical', time: '1h 25m ago' },
  { id: 'SMP-9039', tag: 'IN-UP-JH-3714', breed: 'HF Cross', quarter: 'FR', ph: 7.42, od: 1.25, cond: 8.40, temp: 40.2, thi: 88.5, scc: '2,400,000', risk: 'High (Acute Clinical)', cat: 'clinical', time: '3h 10m ago' },
  { id: 'SMP-9038', tag: 'IN-UP-JH-4029', breed: 'Gir Cow', quarter: 'Composite', ph: 6.60, od: 0.12, cond: 4.60, temp: 38.3, thi: 72.4, scc: '130,000', risk: 'No Risk (Healthy)', cat: 'healthy', time: 'Yesterday' },
  { id: 'SMP-9037', tag: 'IN-UP-JH-3891', breed: 'Sahiwal', quarter: 'RR', ph: 7.08, od: 0.62, cond: 6.75, temp: 39.4, thi: 85.8, scc: '720,000', risk: 'Moderate Subclinical', cat: 'subclinical', time: 'Yesterday' }
];

function initMastitisModule() {
  updateWeather();
  initTrajectoryChart();
  renderSampleLog();
  runMastitisAI();
}

function updateSensor(type, val) {
  val = parseFloat(val);
  if (isNaN(val)) return;

  if (type === 'ph') {
    mastitisState.ph = Math.round(val * 100) / 100;
    const r = document.getElementById('in-ph-range');
    const n = document.getElementById('in-ph-num');
    const d = document.getElementById('disp-ph');
    const pin = document.getElementById('pin-ph');
    const st = document.getElementById('status-ph');
    if (r) r.value = mastitisState.ph;
    if (n) n.value = mastitisState.ph;
    if (d) d.textContent = mastitisState.ph.toFixed(2);
    // 5.5 to 8.5 range
    const pct = Math.max(0, Math.min(100, ((mastitisState.ph - 5.5) / 3.0) * 100));
    if (pin) pin.style.left = pct + '%';

    if (mastitisState.ph <= 6.70 && mastitisState.ph >= 6.45) {
      if (st) { st.className = 'sensor-status-tag normal'; st.textContent = 'Normal Fresh Milk'; }
    } else if (mastitisState.ph > 6.70 && mastitisState.ph <= 6.95) {
      if (st) { st.className = 'sensor-status-tag warning'; st.textContent = 'Subclinical Alkaline Shift'; }
    } else if (mastitisState.ph > 6.95 && mastitisState.ph <= 7.20) {
      if (st) { st.className = 'sensor-status-tag warning'; st.textContent = 'Progressive Alkaline Shift'; }
    } else {
      if (st) { st.className = 'sensor-status-tag critical'; st.textContent = 'Severe Clinical Mastitis pH'; }
    }
  }

  if (type === 'od') {
    mastitisState.od = Math.round(val * 100) / 100;
    const r = document.getElementById('in-od-range');
    const n = document.getElementById('in-od-num');
    const d = document.getElementById('disp-od');
    const pin = document.getElementById('pin-od');
    const st = document.getElementById('status-od');
    if (r) r.value = mastitisState.od;
    if (n) n.value = mastitisState.od;
    if (d) d.textContent = mastitisState.od.toFixed(2);
    // 0.00 to 2.00
    const pct = Math.max(0, Math.min(100, (mastitisState.od / 2.0) * 100));
    if (pin) pin.style.left = pct + '%';

    if (mastitisState.od <= 0.20) {
      if (st) { st.className = 'sensor-status-tag normal'; st.textContent = 'Normal / Low Cellular Scatter'; }
    } else if (mastitisState.od <= 0.50) {
      if (st) { st.className = 'sensor-status-tag warning'; st.textContent = 'Subclinical Turbidity / Cells'; }
    } else if (mastitisState.od <= 0.80) {
      if (st) { st.className = 'sensor-status-tag warning'; st.textContent = 'Moderate Leukocyte Flare'; }
    } else {
      if (st) { st.className = 'sensor-status-tag critical'; st.textContent = 'Dense Clot / High Leukocyte Turbidity'; }
    }
  }

  if (type === 'cond') {
    mastitisState.cond = Math.round(val * 10) / 10;
    const r = document.getElementById('in-cond-range');
    const n = document.getElementById('in-cond-num');
    const d = document.getElementById('disp-cond');
    const pin = document.getElementById('pin-cond');
    const st = document.getElementById('status-cond');
    if (r) r.value = mastitisState.cond;
    if (n) n.value = mastitisState.cond;
    if (d) d.textContent = mastitisState.cond.toFixed(2);
    // 2.0 to 12.0
    const pct = Math.max(0, Math.min(100, ((mastitisState.cond - 2.0) / 10.0) * 100));
    if (pin) pin.style.left = pct + '%';

    if (mastitisState.cond <= 5.5) {
      if (st) { st.className = 'sensor-status-tag normal'; st.textContent = 'Normal Bovine Conductance'; }
    } else if (mastitisState.cond <= 6.5) {
      if (st) { st.className = 'sensor-status-tag warning'; st.textContent = 'Subclinical Na+/Cl- Influx'; }
    } else if (mastitisState.cond <= 7.5) {
      if (st) { st.className = 'sensor-status-tag warning'; st.textContent = 'Progressive Membrane Breach'; }
    } else {
      if (st) { st.className = 'sensor-status-tag critical'; st.textContent = 'Severe Alveolar Capillary Leakage'; }
    }
  }

  if (type === 'temp') {
    mastitisState.temp = Math.round(val * 10) / 10;
    const r = document.getElementById('in-temp-range');
    const n = document.getElementById('in-temp-num');
    const d = document.getElementById('disp-temp');
    const pin = document.getElementById('pin-temp');
    const st = document.getElementById('status-temp');
    if (r) r.value = mastitisState.temp;
    if (n) n.value = mastitisState.temp;
    if (d) d.textContent = mastitisState.temp.toFixed(1);
    // 35.0 to 43.0
    const pct = Math.max(0, Math.min(100, ((mastitisState.temp - 35.0) / 8.0) * 100));
    if (pin) pin.style.left = pct + '%';

    if (mastitisState.temp <= 38.8) {
      if (st) { st.className = 'sensor-status-tag normal'; st.textContent = 'Normal Body / Ejection Temp'; }
    } else if (mastitisState.temp <= 39.5) {
      if (st) { st.className = 'sensor-status-tag warning'; st.textContent = 'Mild Local Hyperthermia'; }
    } else {
      if (st) { st.className = 'sensor-status-tag critical'; st.textContent = 'Fever / Acute Inflammatory Heat'; }
    }
  }

  runMastitisAI();
}

function updateWeather() {
  const tEl = document.getElementById('in-amb-temp');
  const hEl = document.getElementById('in-humidity');
  if (tEl) mastitisState.ambTemp = parseFloat(tEl.value);
  if (hEl) mastitisState.humidity = parseFloat(hEl.value);

  const dt = document.getElementById('disp-amb-temp');
  const dh = document.getElementById('disp-humidity');
  if (dt) dt.innerHTML = mastitisState.ambTemp + '&deg;C';
  if (dh) dh.textContent = mastitisState.humidity + '%';

  // National Dairy Research Institute THI formula:
  // THI = 0.8 * T + (RH/100) * (T - 14.4) + 46.4
  const thi = 0.8 * mastitisState.ambTemp + (mastitisState.humidity / 100.0) * (mastitisState.ambTemp - 14.4) + 46.4;
  mastitisState.thi = Math.round(thi * 10) / 10;

  const dthi = document.getElementById('disp-thi');
  const bthi = document.getElementById('badge-thi');
  if (dthi) dthi.textContent = mastitisState.thi.toFixed(1);

  if (bthi) {
    if (mastitisState.thi < 72) {
      bthi.textContent = 'Comfortable / Normal Range';
      bthi.style.background = '#DCFCE7';
      bthi.style.color = '#166534';
    } else if (mastitisState.thi <= 78) {
      bthi.textContent = 'Mild Heat Stress — Monitor Udder Hygiene';
      bthi.style.background = '#FEF3C7';
      bthi.style.color = '#92400E';
    } else if (mastitisState.thi <= 88) {
      bthi.textContent = 'Moderate Heat Stress — Elevated Mastitis Flare Risk';
      bthi.style.background = '#FFEDD5';
      bthi.style.color = '#C2410C';
    } else {
      bthi.textContent = 'Severe Heat Stress — Immunosuppression Alert';
      bthi.style.background = '#FEE2E2';
      bthi.style.color = '#991B1B';
    }
  }

  runMastitisAI();
}

function selectQuarter(q, btn) {
  mastitisState.quarter = q;
  document.querySelectorAll('.quarter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  runMastitisAI();
}

function runMastitisAI() {
  // Read additional fields
  const bedEl = document.getElementById('in-bedding');
  const milkEl = document.getElementById('in-milking-hygiene');
  const breedEl = document.getElementById('in-breed');
  const lactEl = document.getElementById('in-lactation');
  const tagEl = document.getElementById('in-tag-id');

  if (bedEl) mastitisState.bedding = bedEl.value;
  if (milkEl) mastitisState.milkingHygiene = milkEl.value;
  if (breedEl) mastitisState.breed = breedEl.value;
  if (lactEl) mastitisState.lactation = lactEl.value;
  if (tagEl && tagEl.value) mastitisState.tagId = tagEl.value;

  const dispTag = document.getElementById('disp-udder-tag');
  if (dispTag) dispTag.textContent = mastitisState.tagId;

  // Multi-parameter physiological evaluation:
  let score = 0;

  // 1. Conductivity score (Normal 4.0 - 5.5 mS/cm)
  if (mastitisState.cond > 7.5) score += 34;
  else if (mastitisState.cond > 6.5) score += 26;
  else if (mastitisState.cond > 5.6) score += 18;
  else if (mastitisState.cond > 5.4) score += 8;

  // 2. Optical Density (OD @ 600nm)
  if (mastitisState.od > 0.80) score += 28;
  else if (mastitisState.od > 0.45) score += 20;
  else if (mastitisState.od > 0.22) score += 14;
  else if (mastitisState.od > 0.18) score += 4;

  // 3. Milk pH (Normal 6.5 - 6.7)
  if (mastitisState.ph > 7.20) score += 24;
  else if (mastitisState.ph > 6.95) score += 18;
  else if (mastitisState.ph > 6.70) score += 12;

  // 4. Milk / Udder Temperature
  if (mastitisState.temp > 39.6) score += 16;
  else if (mastitisState.temp > 38.8) score += 8;

  // 5. Environmental Stress (THI & Bedding & Hygiene)
  if (mastitisState.thi > 88) score += 10;
  else if (mastitisState.thi > 78) score += 6;

  if (mastitisState.bedding === 'muddy') score += 8;
  else if (mastitisState.bedding === 'damp') score += 4;

  if (mastitisState.milkingHygiene === 'unhygienic') score += 8;
  else if (mastitisState.milkingHygiene === 'plain') score += 4;

  if (mastitisState.lactation === 'early') score += 4;

  // Species calibration (Buffaloes naturally have tighter quarters but higher sensitivity to heat stress)
  if (mastitisState.breed === 'murrah' && mastitisState.thi > 80) score += 5;

  score = Math.min(100, Math.max(8, score));
  mastitisState.currentScore = score;

  // Categorize Risk
  let level = 'no';
  let levelTitle = 'No Risk — Healthy Bovine Milk';
  let levelColor = '#166534';
  let bannerClass = 'risk-no';
  let isEarlyWarning = false;

  if (score >= 78) {
    level = 'high';
    levelTitle = 'High Risk — Acute Clinical Mastitis';
    levelColor = '#DC2626';
    bannerClass = 'risk-high';
    isEarlyWarning = false;
  } else if (score >= 52) {
    level = 'mod';
    levelTitle = 'Moderate Risk — Subclinical Stage 2';
    levelColor = '#EA580C';
    bannerClass = 'risk-mod';
    isEarlyWarning = true;
  } else if (score >= 26) {
    level = 'low';
    levelTitle = 'Low Risk — Early Subclinical Stage 1';
    levelColor = '#D97706';
    bannerClass = 'risk-low';
    isEarlyWarning = true;
  } else {
    level = 'no';
    levelTitle = 'No Risk — Normal Baseline Quality';
    levelColor = '#166534';
    bannerClass = 'risk-no';
    isEarlyWarning = false;
  }

  mastitisState.currentRiskLevel = level;

  // Estimated SCC Calculation (Cells / mL)
  let scc = 100000;
  if (level === 'no') {
    scc = Math.round(90000 + (mastitisState.cond - 4.0) * 35000 + (mastitisState.od - 0.08) * 120000);
    scc = Math.max(75000, Math.min(185000, scc));
  } else if (level === 'low') {
    scc = Math.round(240000 + (mastitisState.cond - 5.4) * 140000 + (mastitisState.od - 0.22) * 450000);
    scc = Math.max(220000, Math.min(460000, scc));
  } else if (level === 'mod') {
    scc = Math.round(520000 + (mastitisState.cond - 6.2) * 220000 + (mastitisState.od - 0.45) * 600000);
    scc = Math.max(480000, Math.min(950000, scc));
  } else {
    scc = Math.round(1350000 + (mastitisState.cond - 7.2) * 550000 + (mastitisState.od - 0.8) * 1400000);
    scc = Math.max(1100000, Math.min(3800000, scc));
  }
  mastitisState.estScc = scc;

  // Update AI Banner
  const banner = document.getElementById('ai-banner');
  if (banner) {
    banner.className = 'ai-diagnosis-banner ' + bannerClass;
  }

  const titleEl = document.getElementById('ai-risk-title');
  if (titleEl) {
    titleEl.textContent = levelTitle;
    titleEl.style.color = levelColor;
  }

  const confEl = document.getElementById('ai-prob-tag');
  if (confEl) {
    const conf = Math.min(96, Math.max(74, Math.round(68 + (score * 0.28))));
    confEl.textContent = conf + '% AI Confidence';
  }

  const earlyPill = document.getElementById('ai-early-pill');
  const warnText = document.getElementById('ai-warning-text');
  if (earlyPill && warnText) {
    if (isEarlyWarning) {
      earlyPill.style.display = 'inline-flex';
      earlyPill.className = level === 'mod' ? 'early-warning-badge urgent' : 'early-warning-badge';
      warnText.textContent = '7–14 Day Pre-Clinical Early Forecasting Alert Active';
    } else if (level === 'high') {
      earlyPill.style.display = 'inline-flex';
      earlyPill.className = 'early-warning-badge urgent';
      warnText.textContent = 'Imminent Clinical Manifestation — Emergency Quarantine Required';
    } else {
      earlyPill.style.display = 'none';
    }
  }

  // Summary description
  const descEl = document.getElementById('ai-summary-desc');
  if (descEl) {
    if (level === 'no') {
      descEl.textContent = `Physical sensor readings (pH ${mastitisState.ph.toFixed(2)}, OD ${mastitisState.od.toFixed(2)}, Conductivity ${mastitisState.cond.toFixed(1)} mS/cm, Temp ${mastitisState.temp.toFixed(1)}°C) confirm healthy mammary epithelial integrity. No subclinical cellular leakage detected. Continue standard post-milking teat dip.`;
    } else if (level === 'low') {
      descEl.textContent = `Early subclinical mastitis identified 7–14 days before clinical symptoms (clots/swelling) become visually apparent. Incipient ionic leakage (Conductivity ${mastitisState.cond.toFixed(1)} mS/cm) and somatic light scattering (OD ${mastitisState.od.toFixed(2)}) detected. Non-antibiotic supportive intervention now prevents 92% of clinical flare-ups.`;
    } else if (level === 'mod') {
      descEl.textContent = `Progressive subclinical mastitis detected. Disruption of alveolar epithelial tight junctions is causing significant Na+ and Cl- ion influx (${mastitisState.cond.toFixed(1)} mS/cm) and cellular debris scattering (OD ${mastitisState.od.toFixed(2)}). Immediate teat isolation, herbal anti-inflammatory paste, and hygiene disinfection required.`;
    } else {
      descEl.textContent = `Acute clinical mastitis alert. Severe alveolar capillary barrier breakdown evidenced by high conductivity (${mastitisState.cond.toFixed(1)} mS/cm), marked alkaline shift (pH ${mastitisState.ph.toFixed(2)}), and high milk temperature (${mastitisState.temp.toFixed(1)}°C). Immediate veterinary isolation, NSAID therapy, and milk culture referral required.`;
    }
  }

  // Derived Biomarkers UI
  const sccVal = document.getElementById('bio-scc');
  const sccSub = document.getElementById('bio-scc-sub');
  if (sccVal) {
    sccVal.textContent = scc.toLocaleString();
    sccVal.style.color = levelColor;
  }
  if (sccSub) {
    if (scc < 200000) sccSub.textContent = 'cells/mL · Healthy Bovine';
    else if (scc <= 500000) sccSub.textContent = 'cells/mL · Subclinical Range';
    else if (scc <= 1000000) sccSub.textContent = 'cells/mL · Elevated Subclinical';
    else sccSub.textContent = 'cells/mL · Clinical Threshold';
  }

  // Pathogen Profile
  const pathVal = document.getElementById('bio-pathogen');
  const pathSub = document.getElementById('bio-pathogen-sub');
  if (pathVal && pathSub) {
    if (level === 'no') {
      pathVal.textContent = 'Normal Flora';
      pathVal.style.color = 'var(--success)';
      pathSub.textContent = 'Commensal Microbes';
    } else if (mastitisState.bedding === 'muddy' || mastitisState.bedding === 'damp' || mastitisState.thi > 78) {
      pathVal.textContent = 'Environmental Coliform';
      pathVal.style.color = '#1E40AF';
      pathSub.textContent = 'E. coli / Strep. uberis';
    } else if (mastitisState.milkingHygiene === 'unhygienic' || mastitisState.milkingHygiene === 'plain') {
      pathVal.textContent = 'Contagious Staph';
      pathVal.style.color = '#92400E';
      pathSub.textContent = 'S. aureus / S. agalactiae';
    } else {
      pathVal.textContent = 'Mixed Subclinical';
      pathVal.style.color = '#EA580C';
      pathSub.textContent = 'CoNS / Streptococci';
    }
  }

  // Yield & Economic Loss
  const lossVal = document.getElementById('bio-loss');
  const costVal = document.getElementById('bio-cost');
  if (lossVal && costVal) {
    if (level === 'no') {
      lossVal.textContent = '0.0 L/d';
      lossVal.style.color = 'var(--success)';
      costVal.textContent = 'No Revenue Loss';
    } else if (level === 'low') {
      lossVal.textContent = '-1.8 L/d';
      lossVal.style.color = '#D97706';
      costVal.textContent = '-₹560 / week loss';
    } else if (level === 'mod') {
      lossVal.textContent = '-3.4 L/d';
      lossVal.style.color = '#EA580C';
      costVal.textContent = '-₹1,070 / week loss';
    } else {
      lossVal.textContent = '-7.8 L/d';
      lossVal.style.color = 'var(--danger)';
      costVal.textContent = '-₹2,450 / week loss';
    }
  }

  // Udder Quarter pad colors
  updateUdderDiagram(level);

  // Decision Support Protocol Recommendations
  updateProtocols(level);

  // Update Trajectory Chart
  updateTrajectoryChart();
}

function updateUdderDiagram(riskLevel) {
  const currentQ = mastitisState.quarter;
  const quarters = ['FL', 'FR', 'RL', 'RR'];

  // Color mapping
  const colorScheme = {
    normal:  { fill: '#BBF7D0', stroke: '#166534', textColor: '#14532D' },
    warning: { fill: '#FDE68A', stroke: '#B45309', textColor: '#92400E' },
    mod:     { fill: '#FED7AA', stroke: '#C2410C', textColor: '#9A3412' },
    danger:  { fill: '#FECACA', stroke: '#DC2626', textColor: '#991B1B' },
  };

  let targetStyle = colorScheme.normal;
  if (riskLevel === 'low') targetStyle = colorScheme.warning;
  else if (riskLevel === 'mod') targetStyle = colorScheme.mod;
  else if (riskLevel === 'high') targetStyle = colorScheme.danger;

  quarters.forEach(q => {
    const el = document.getElementById('svg-q-' + q);
    if (!el) return;

    if (currentQ === 'ALL' || currentQ === q) {
      el.setAttribute('fill', targetStyle.fill);
      el.setAttribute('stroke', targetStyle.stroke);
      el.setAttribute('stroke-width', currentQ === q ? '2.5' : '1.5');
    } else {
      el.setAttribute('fill', colorScheme.normal.fill);
      el.setAttribute('stroke', colorScheme.normal.stroke);
      el.setAttribute('stroke-width', '1.5');
    }
  });
}

function updateProtocols(level) {
  const fBox = document.getElementById('proto-farmer');
  const vBox = document.getElementById('proto-vet');
  const bBox = document.getElementById('proto-farm');

  if (level === 'no') {
    if (fBox) fBox.innerHTML = `
      <div class="protocol-item"><div class="protocol-dot"></div><span>Maintain standard post-milking barrier teat dipping (0.5% chlorhexidine/iodine).</span></div>
      <div class="protocol-item"><div class="protocol-dot"></div><span>Milk healthy animals in the regular first-batch herd sequence.</span></div>
      <div class="protocol-item"><div class="protocol-dot"></div><span>Routine sensor re-screening scheduled in 7 days.</span></div>
    `;
    if (vBox) vBox.innerHTML = `
      <div class="protocol-item"><div class="protocol-dot" style="background:#1E40AF"></div><span>Animal within healthy physiological limits. No pharmaceutical intervention indicated.</span></div>
      <div class="protocol-item"><div class="protocol-dot" style="background:#1E40AF"></div><span>Supports Antimicrobial Stewardship (Zero antibiotic footprint).</span></div>
    `;
    if (bBox) bBox.innerHTML = `
      <div class="protocol-item"><div class="protocol-dot" style="background:#D97706"></div><span>Continue daily stall scraping and maintain dry, well-ventilated resting cubicles.</span></div>
    `;
    return;
  }

  if (level === 'low' || level === 'mod') {
    if (fBox) fBox.innerHTML = `
      <div class="protocol-item"><div class="protocol-dot"></div><span>Milk this cow <strong>LAST</strong> to prevent transmission to unaffected animals.</span></div>
      <div class="protocol-item"><div class="protocol-dot"></div><span>Apply thick barrier povidone-iodine teat dip (1.0%) immediately post-milking.</span></div>
      <div class="protocol-item"><div class="protocol-dot"></div><span>Apply herbal cooling paste (turmeric + aloe vera) topically over the ${mastitisState.quarter} quarter.</span></div>
      <div class="protocol-item"><div class="protocol-dot"></div><span>Re-screen with sensor probe in 24 hours to monitor recovery.</span></div>
    `;
    if (vBox) vBox.innerHTML = `
      <div class="protocol-item"><div class="protocol-dot" style="background:#1E40AF"></div><span><strong>AMR Mitigation:</strong> Do NOT administer systemic antibiotics for early subclinical stage.</span></div>
      <div class="protocol-item"><div class="protocol-dot" style="background:#1E40AF"></div><span>Prescribe parenteral Vitamin E + Selenium (immunostimulant to boost PMN phagocytosis).</span></div>
      <div class="protocol-item"><div class="protocol-dot" style="background:#1E40AF"></div><span>Collect aseptic quarter sample for bacteriological culture and ABST referral if conductivity > 6.5 mS/cm.</span></div>
    `;
    if (bBox) bBox.innerHTML = `
      <div class="protocol-item"><div class="protocol-dot" style="background:#D97706"></div><span>Scrape damp stall slurry; apply agricultural dry lime to eliminate coliform environmental reservoirs.</span></div>
      <div class="protocol-item"><div class="protocol-dot" style="background:#D97706"></div><span>Maintain barn cooling fans &mdash; current THI (${mastitisState.thi}) suppresses mammary immunity.</span></div>
    `;
    return;
  }

  // Clinical Mastitis Protocol
  if (fBox) fBox.innerHTML = `
    <div class="protocol-item"><div class="protocol-dot"></div><span><strong>Quarantine animal immediately:</strong> Move to isolation stall; milk completely by hand into discard bucket.</span></div>
    <div class="protocol-item"><div class="protocol-dot"></div><span>Discard milk safely &mdash; do NOT supply to dairy cooperative or calf feeding.</span></div>
    <div class="protocol-item"><div class="protocol-dot"></div><span>Frequent strip-milking (every 2–3 hours) to evacuate bacterial endotoxins from the udder.</span></div>
  `;
  if (vBox) vBox.innerHTML = `
    <div class="protocol-item"><div class="protocol-dot" style="background:#1E40AF"></div><span>Urgent veterinary intervention: Administer systemic anti-inflammatory (Meloxicam/Flunixin).</span></div>
    <div class="protocol-item"><div class="protocol-dot" style="background:#1E40AF"></div><span>Targeted intramammary infusion guided by Antibiotic Sensitivity Testing (ABST) to combat AMR.</span></div>
    <div class="protocol-item"><div class="protocol-dot" style="background:#1E40AF"></div><span>Fluid therapy and oral electrolytes if toxaemic signs or dehydration are present.</span></div>
  `;
  if (bBox) bBox.innerHTML = `
    <div class="protocol-item"><div class="protocol-dot" style="background:#D97706"></div><span>Thorough chemical disinfection of milking cluster with 200 ppm sodium hypochlorite.</span></div>
    <div class="protocol-item"><div class="protocol-dot" style="background:#D97706"></div><span>Deep clean and bed isolation stall with dry sterilized river sand or fresh straw.</span></div>
  `;
}

function initTrajectoryChart() {
  const ctx = document.getElementById('mastitis-trajectory-chart');
  if (!ctx) return;

  if (mastitisState.trajectoryChart) {
    mastitisState.trajectoryChart.destroy();
  }

  mastitisState.trajectoryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Day 0', 'Day 2', 'Day 4', 'Day 7', 'Day 10', 'Day 14'],
      datasets: [
        {
          label: 'Without Action (Projected Escalation)',
          data: [48, 62, 75, 88, 92, 95],
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          borderDash: [5, 5],
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'With Early Protocol (Early Intervention Recovery)',
          data: [48, 36, 22, 16, 12, 10],
          borderColor: '#16A34A',
          backgroundColor: 'rgba(22, 163, 74, 0.08)',
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ctx.dataset.label + ': ' + ctx.parsed.y + ' Risk Score';
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 110,
          ticks: {
            stepSize: 25,
            font: { size: 10 },
            callback: function(v) {
              if (v === 0) return '0 (Safe)';
              if (v === 50) return '50 (Subclinical)';
              if (v === 100) return '100 (Clinical)';
              return '';
            }
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });

  updateTrajectoryChart();
}

function updateTrajectoryChart() {
  if (!mastitisState.trajectoryChart) return;

  const score = mastitisState.currentScore;
  let untreated = [];
  let treated = [];

  if (mastitisState.currentRiskLevel === 'no') {
    untreated = [score, Math.min(100, score + 4), Math.min(100, score + 6), score, score, score];
    treated   = [score, Math.max(8, score - 2), Math.max(6, score - 4), 6, 6, 6];
  } else if (mastitisState.currentRiskLevel === 'low') {
    untreated = [score, Math.min(100, score + 16), Math.min(100, score + 32), Math.min(100, score + 46), 92, 96];
    treated   = [score, Math.max(10, score - 16), Math.max(8, score - 28), 15, 12, 9];
  } else if (mastitisState.currentRiskLevel === 'mod') {
    untreated = [score, Math.min(100, score + 12), Math.min(100, score + 24), 94, 98, 100];
    treated   = [score, Math.max(14, score - 20), Math.max(10, score - 36), 24, 18, 12];
  } else {
    untreated = [score, 94, 97, 99, 100, 100];
    treated   = [score, 72, 54, 38, 28, 20];
  }

  mastitisState.trajectoryChart.data.datasets[0].data = untreated;
  mastitisState.trajectoryChart.data.datasets[1].data = treated;
  mastitisState.trajectoryChart.update();
}

function loadPreset(key, btn) {
  const p = MASTITIS_PRESETS[key];
  if (!p) return;

  document.querySelectorAll('.preset-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const bedEl = document.getElementById('in-bedding');
  const milkEl = document.getElementById('in-milking-hygiene');
  const breedEl = document.getElementById('in-breed');
  const lactEl = document.getElementById('in-lactation');
  const tagEl = document.getElementById('in-tag-id');
  const tAmb = document.getElementById('in-amb-temp');
  const hAmb = document.getElementById('in-humidity');

  if (bedEl) bedEl.value = p.bedding;
  if (milkEl) milkEl.value = p.milkingHygiene;
  if (breedEl) breedEl.value = p.breed;
  if (lactEl) lactEl.value = p.lactation;
  if (tagEl) tagEl.value = p.tagId;
  if (tAmb) tAmb.value = p.ambTemp;
  if (hAmb) hAmb.value = p.humidity;

  mastitisState.quarter = p.quarter;
  document.querySelectorAll('.quarter-btn').forEach(b => {
    if (b.id === 'btn-q-' + p.quarter) b.classList.add('active');
    else b.classList.remove('active');
  });

  updateWeather();
  updateSensor('ph', p.ph);
  updateSensor('od', p.od);
  updateSensor('cond', p.cond);
  updateSensor('temp', p.temp);
}

function toggleLiveStream() {
  const btn = document.getElementById('btn-toggle-stream');
  const txt = document.getElementById('txt-stream-status');

  if (mastitisState.liveStreaming) {
    // Stop stream
    clearInterval(mastitisState.streamTimer);
    mastitisState.liveStreaming = false;
    if (btn) btn.classList.remove('streaming');
    if (txt) txt.textContent = 'Simulate Live Sensor Feed';
  } else {
    // Start stream
    mastitisState.liveStreaming = true;
    if (btn) btn.classList.add('streaming');
    if (txt) txt.textContent = 'Stop Streaming (Connected)';

    mastitisState.streamTimer = setInterval(() => {
      // Natural jitter in sensor readings
      const dPh = (Math.random() - 0.5) * 0.04;
      const dOd = (Math.random() - 0.5) * 0.03;
      const dCond = (Math.random() - 0.5) * 0.12;
      const dTemp = (Math.random() - 0.5) * 0.08;

      let newPh = Math.max(6.2, Math.min(7.8, mastitisState.ph + dPh));
      let newOd = Math.max(0.05, Math.min(1.5, mastitisState.od + dOd));
      let newCond = Math.max(3.8, Math.min(9.5, mastitisState.cond + dCond));
      let newTemp = Math.max(37.5, Math.min(41.0, mastitisState.temp + dTemp));

      updateSensor('ph', newPh);
      updateSensor('od', newOd);
      updateSensor('cond', newCond);
      updateSensor('temp', newTemp);
    }, 2200);
  }
}

function resetSensorDefaults() {
  loadPreset('healthy', document.getElementById('chip-healthy'));
  alert('Hardware Probe successfully calibrated against reference buffers (pH 7.00 & 4.00, 0.01M KCl conductance standard).');
}

function saveSampleToLog() {
  const sampleId = 'SMP-' + Math.floor(9000 + Math.random() * 999);
  const breedName = {
    sahiwal: 'Sahiwal',
    gir: 'Gir Cow',
    murrah: 'Murrah Buffalo',
    hf: 'HF Cross',
    jersey: 'Jersey Cross',
    red_sindhi: 'Red Sindhi'
  }[mastitisState.breed] || 'Bovine';

  let riskStr = 'No Risk (Healthy)';
  let cat = 'healthy';
  if (mastitisState.currentRiskLevel === 'low') {
    riskStr = 'Low Risk (7-14d Warning)';
    cat = 'subclinical';
  } else if (mastitisState.currentRiskLevel === 'mod') {
    riskStr = 'Moderate Subclinical';
    cat = 'subclinical';
  } else if (mastitisState.currentRiskLevel === 'high') {
    riskStr = 'High Risk (Clinical)';
    cat = 'clinical';
  }

  const entry = {
    id: sampleId,
    tag: mastitisState.tagId,
    breed: breedName,
    quarter: mastitisState.quarter,
    ph: mastitisState.ph,
    od: mastitisState.od,
    cond: mastitisState.cond,
    temp: mastitisState.temp,
    thi: mastitisState.thi,
    scc: mastitisState.estScc.toLocaleString(),
    risk: riskStr,
    cat: cat,
    time: 'Just now'
  };

  sampleHistory.unshift(entry);
  renderSampleLog();
  alert(`Milk sample ${sampleId} for Animal ${mastitisState.tagId} saved to National Dairy Surveillance Database.`);
}

function renderSampleLog(filter = 'all') {
  const tbody = document.getElementById('tbody-sample-log');
  if (!tbody) return;

  tbody.innerHTML = '';
  const list = filter === 'all' ? sampleHistory : sampleHistory.filter(s => s.cat === filter);

  list.forEach(s => {
    const tr = document.createElement('tr');

    let badgeClass = 'badge-success';
    if (s.cat === 'subclinical') badgeClass = 'badge-warning';
    if (s.cat === 'clinical') badgeClass = 'badge-danger';

    tr.innerHTML = `
      <td><code style="font-size:.75rem;color:var(--text-tertiary)">${s.id}</code></td>
      <td><strong>${s.tag}</strong></td>
      <td>${s.breed}</td>
      <td><span style="font-weight:600;color:var(--brand-primary)">[${s.quarter}]</span></td>
      <td>${s.ph.toFixed(2)}</td>
      <td>${s.od.toFixed(2)}</td>
      <td>${s.cond.toFixed(1)}</td>
      <td>${s.temp.toFixed(1)}&deg;C</td>
      <td>${s.thi.toFixed(1)}</td>
      <td><span style="font-weight:600">${s.scc}</span></td>
      <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${s.risk}</span></td>
      <td style="font-size:.75rem;color:var(--text-tertiary)">${s.time}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="alert('Viewing Sample Details: ' + '${s.id}' + '\\nAnimal Tag: ' + '${s.tag}' + '\\nEstimated SCC: ' + '${s.scc}' + ' cells/mL')">Slip</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterSampleLog(filter, btn) {
  document.querySelectorAll('#view-mastitis .table-wrap button, #view-mastitis .section-header button').forEach(b => {
    if (b.innerText.toLowerCase().includes('export')) return;
    b.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  renderSampleLog(filter);
}

function exportSamplesCSV() {
  let csv = 'Sample ID,Animal Tag,Breed,Quarter,pH,OD,Conductivity (mS/cm),Temperature (C),THI,Estimated SCC,Risk Classification,Timestamp\n';
  sampleHistory.forEach(s => {
    csv += `"${s.id}","${s.tag}","${s.breed}","${s.quarter}",${s.ph},${s.od},${s.cond},${s.temp},${s.thi},"${s.scc}","${s.risk}","${s.time}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mastitis_Sensor_Diagnostic_Log_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printDiagnosticSlip() {
  const w = window.open('', '_blank', 'width=750,height=800');
  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bovine Mastitis Diagnostic Report — ${mastitisState.tagId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #18181A; line-height: 1.5; }
        .header { border-bottom: 2px solid #1C4532; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        h1 { font-size: 20px; margin: 0; color: #1C4532; }
        .sub { font-size: 12px; color: #52524E; }
        .box { border: 1px solid #D4D1C7; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .item-label { font-size: 11px; text-transform: uppercase; color: #8A8880; font-weight: 600; }
        .item-val { font-size: 15px; font-weight: 700; color: #1C4532; margin-top: 2px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 13px; }
        .badge-warning { background: #FEF3C7; color: #92400E; }
        .badge-danger { background: #FEE2E2; color: #991B1B; }
        .badge-success { background: #DCFCE7; color: #166534; }
        ul { padding-left: 18px; font-size: 13px; margin: 8px 0; }
        li { margin-bottom: 4px; }
        .footer { margin-top: 30px; font-size: 11px; color: #8A8880; border-top: 1px solid #E8E5DC; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>PashuRaksha &mdash; Mastitis AI Sensor Diagnostic Report</h1>
          <div class="sub">National Livestock Health Surveillance &amp; Early Disease Forecasting</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;font-weight:600">Date: ${new Date().toLocaleDateString()}</div>
          <div class="sub">Ref: SIH-2024-MAST-AI</div>
        </div>
      </div>

      <div class="box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <span style="font-size:12px;color:#8A8880">ANIMAL TAG ID:</span>
            <span style="font-size:18px;font-weight:700;margin-left:6px">${mastitisState.tagId}</span>
            <span style="margin-left:12px;font-size:13px;color:#52524E">(${mastitisState.breed.toUpperCase()}, ${mastitisState.lactation.toUpperCase()} LACTATION)</span>
          </div>
          <div>
            <span class="badge ${mastitisState.currentRiskLevel === 'high' ? 'badge-danger' : (mastitisState.currentRiskLevel === 'no' ? 'badge-success' : 'badge-warning')}">
              ${mastitisState.currentRiskLevel.toUpperCase()} RISK
            </span>
          </div>
        </div>
        <div style="font-size:13px;color:#52524E;margin-bottom:8px">
          <strong>Tested Quarter:</strong> ${mastitisState.quarter} &nbsp;&middot;&nbsp; 
          <strong>Early Warning Window:</strong> ${mastitisState.currentRiskLevel !== 'no' ? '7–14 Days Pre-Clinical' : 'No Disease Warning'}
        </div>
      </div>

      <div class="box">
        <div style="font-weight:600;font-size:13px;margin-bottom:10px;color:#18181A">PHYSICAL SENSOR MEASUREMENTS</div>
        <div class="grid">
          <div><div class="item-label">Milk pH</div><div class="item-val">${mastitisState.ph.toFixed(2)}</div></div>
          <div><div class="item-label">Colorimetry (OD)</div><div class="item-val">${mastitisState.od.toFixed(2)}</div></div>
          <div><div class="item-label">Conductivity</div><div class="item-val">${mastitisState.cond.toFixed(1)} mS/cm</div></div>
          <div><div class="item-label">Milk Temp</div><div class="item-val">${mastitisState.temp.toFixed(1)} &deg;C</div></div>
        </div>
        <div class="grid" style="margin-top:12px">
          <div><div class="item-label">Ambient Temp</div><div class="item-val">${mastitisState.ambTemp}&deg;C</div></div>
          <div><div class="item-label">Humidity</div><div class="item-val">${mastitisState.humidity}%</div></div>
          <div><div class="item-label">Calculated THI</div><div class="item-val">${mastitisState.thi.toFixed(1)}</div></div>
          <div><div class="item-label">Estimated SCC</div><div class="item-val">${mastitisState.estScc.toLocaleString()} cells/mL</div></div>
        </div>
      </div>

      <div class="box">
        <div style="font-weight:600;font-size:13px;margin-bottom:6px;color:#18181A">DECISION-SUPPORT ACTION PROTOCOL</div>
        <div style="font-size:12px;font-weight:600;color:#1C4532;margin-top:6px">FARMER ACTIONS:</div>
        <ul>
          <li>Milk animal last to prevent milking cluster contamination.</li>
          <li>Apply 0.5% povidone-iodine barrier teat dip immediately after milking.</li>
          <li>Apply topical aloe vera/turmeric herbal paste over affected quarter.</li>
        </ul>
        <div style="font-size:12px;font-weight:600;color:#1E40AF;margin-top:8px">VETERINARY PROTOCOL &amp; AMR STEWARDSHIP:</div>
        <ul>
          <li><strong>Avoid routine systemic antibiotics</strong> for subclinical cases to combat AMR.</li>
          <li>Prescribe parenteral Vitamin E + Selenium to stimulate immune response.</li>
          <li>Aseptic milk culture and ABST referral if conductivity exceeds 6.5 mS/cm.</li>
        </ul>
      </div>

      <div class="footer">
        Generated automatically by PashuRaksha AI Sensor Diagnostic Platform &middot; Ministry of Fisheries, Animal Husbandry &amp; Dairying, Govt. of India.
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  w.document.close();
}

function sendFarmerAlert() {
  const levelText = mastitisState.currentRiskLevel.toUpperCase();
  const msg = `[PashuRaksha Alert] Animal Tag: ${mastitisState.tagId}. AI Milk Diagnostic detected ${levelText} RISK in quarter ${mastitisState.quarter}. Electrical Conductivity: ${mastitisState.cond.toFixed(1)} mS/cm, OD: ${mastitisState.od.toFixed(2)}, Est. SCC: ${mastitisState.estScc.toLocaleString()} cells/mL. Action: Milk this cow LAST, apply post-dip teat barrier, and isolate for veterinary checkup.`;

  alert(`SMS & WhatsApp Alert Dispatched successfully to:\n\nFarmer: Ramesh Yadav (+91 98765 43210)\nField Vet: Dr. Anita Sharma (+91 94150 12345)\n\nPayload:\n"${msg}"`);
}


// ============================================================
// AI AGENT PROTOTYPE
// PashuRaksha — Bovine Mastitis Forecaster & Disease Surveillance
// ============================================================

const AI_AGENT = {
  panelOpen: false,
  msgCount: 0,

  // ---- Knowledge Base (rule-based AI response engine) ----
  KB: [
    {
      triggers: ['herd risk', 'herd mastitis', 'herd status', 'overall risk', 'full mastitis risk'],
      response: () => {
        const s = mastitisState;
        return {
          text: `📊 <strong>Herd-Level Mastitis Risk Report — ${new Date().toLocaleTimeString()}</strong><br><br>Based on multi-sensor fusion across 28 animals (6 farms), current herd status is <strong style="color:#D97706">Moderate-High Risk</strong>.`,
          card: {
            title: 'Herd Risk Summary', badge: 'Moderate–High', badgeColor: '#D97706',
            rows: [
              { label: 'Animals screened', val: '28 / 34 enrolled' },
              { label: 'High-risk animals', val: '3 (IN-UP-JH-3714, 4082, 3891)' },
              { label: 'Avg herd SCC est.', val: '382,000 cells/mL' },
              { label: 'THI (heat stress)', val: `${s.thi.toFixed(1)} — elevated zone` },
              { label: 'AI model confidence', val: '84% (7–14 day horizon)' },
              { label: 'AMR protocol', val: 'Active — avoid prophylactic ABX' },
            ]
          },
          followup: 'Would you like animal-specific analysis, intervention recommendations, or a 7-day forecast?'
        };
      }
    },
    {
      triggers: ['high-risk animals', 'high risk animal', 'flagged animals', 'show high'],
      response: () => ({
        text: `🔴 <strong>3 Animals Flagged — Immediate Attention Required</strong>`,
        card: {
          title: 'High-Risk Animal Summary', badge: 'Action Required', badgeColor: '#DC2626',
          rows: [
            { label: 'IN-UP-JH-3714 (HF/FR)', val: '⚡ SCC 848K — <7 days to clinical' },
            { label: 'IN-UP-JH-4082 (Sahiwal/FL)', val: '⚠️ SCC 520K — 7–9 days' },
            { label: 'IN-UP-JH-3891 (Sahiwal/RL)', val: '⚠️ SCC 298K — 10–14 days' },
            { label: 'Recommended action', val: 'Isolate 3714, monitor 4082 & 3891 daily' },
          ]
        },
        followup: 'Tap "Ask AI" next to any animal in the risk table for a detailed individual analysis.'
      })
    },
    {
      triggers: ['4082', 'in-up-jh-4082'],
      response: () => {
        const s = mastitisState;
        return {
          text: `🐄 <strong>Animal IN-UP-JH-4082</strong> — Sahiwal, Front-Left Quarter<br><br>AI risk classification: <strong style="color:#D97706">HIGH RISK</strong>. Predicted subclinical mastitis onset: <strong>7–9 days</strong>.`,
          card: {
            title: 'IN-UP-JH-4082 Analysis', badge: 'High Risk', badgeColor: '#D97706',
            rows: [
              { label: 'pH', val: `${s.ph.toFixed(2)} (↑ Alkaline shift)` },
              { label: 'OD @600nm', val: `${s.od.toFixed(2)} (↑ Turbidity)` },
              { label: 'Conductivity', val: `${s.cond.toFixed(1)} mS/cm (↑ Na+/Cl-)` },
              { label: 'Milk temp', val: `${s.temp.toFixed(1)}°C (↑ Mild inflammation)` },
              { label: 'Est. SCC', val: '520,000 cells/mL' },
              { label: 'Intervention', val: 'Milk LAST · Post-dip iodine · Monitor 24h' },
            ]
          },
          followup: '✅ <strong>Recommended:</strong> Milk this cow last, apply 0.5% povidone-iodine post-dip, and schedule a veterinary check within 48 hours. Avoid antibiotics at this stage (subclinical).'
        };
      }
    },
    {
      triggers: ['3714', 'in-up-jh-3714', 'emergency mastitis', '848k', '848,000'],
      response: () => ({
        text: `🚨 <strong>EMERGENCY — Animal IN-UP-JH-3714 (HF Cross, FR Quarter)</strong><br><br>SCC 848,000 cells/mL is <strong style="color:#DC2626">critically elevated</strong>. Clinical mastitis onset projected within 7 days. Immediate action mandatory.`,
        card: {
          title: 'Emergency Protocol', badge: 'Critical — Act Now', badgeColor: '#DC2626',
          rows: [
            { label: 'Step 1', val: 'ISOLATE immediately — do not share milking cluster' },
            { label: 'Step 2', val: 'Collect aseptic milk sample (FR quarter) for culture & ABST' },
            { label: 'Step 3', val: 'Parenteral Vit E + Selenium to boost immune response' },
            { label: 'Step 4', val: 'Refer culture sample to nearest state vet lab (Lucknow)' },
            { label: 'Step 5', val: 'Send SMS alert to farm owner + field vet Dr. Anita Sharma' },
            { label: 'AMR Note', val: 'Await ABST results before any antibiotic prescription' },
          ]
        },
        followup: 'This alert has been logged and will be escalated to Dr. Anita Sharma (+91 94150 12345) and District AHO. Do you want me to draft the SMS now?'
      })
    },
    {
      triggers: ['3891', 'in-up-jh-3891'],
      response: () => ({
        text: `🐄 <strong>Animal IN-UP-JH-3891</strong> — Sahiwal, Rear-Left Quarter<br><br>AI classification: <strong style="color:#D97706">Moderate Risk</strong>. Predicted subclinical onset in <strong>10–14 days</strong>.`,
        card: {
          title: 'IN-UP-JH-3891 Analysis', badge: 'Moderate Risk', badgeColor: '#D97706',
          rows: [
            { label: 'pH', val: '7.08 (↑ Alkaline shift)' },
            { label: 'OD @600nm', val: '0.62 (↑ Elevated)' },
            { label: 'Conductivity', val: '6.75 mS/cm (↑)' },
            { label: 'Est. SCC', val: '298,000 cells/mL' },
            { label: 'Intervention', val: 'Daily monitoring · Pre/post dip · Check bedding' },
          ]
        },
        followup: 'Monitor daily for the next 5 days. If conductivity rises above 7.0 mS/cm, escalate to High Risk immediately.'
      })
    },
    {
      triggers: ['4105', 'in-up-jh-4105', 'murrah'],
      response: () => ({
        text: `🐃 <strong>Animal IN-UP-JH-4105</strong> — Murrah Buffalo, Front-Left Quarter<br><br>AI classification: <strong style="color:#D97706">Moderate Risk</strong>. Predicted onset: <strong>12–14 days</strong>.`,
        card: {
          title: 'IN-UP-JH-4105 Analysis', badge: 'Moderate Risk', badgeColor: '#D97706',
          rows: [
            { label: 'pH', val: '6.94 (borderline)' },
            { label: 'OD @600nm', val: '0.44 (↑ Slightly elevated)' },
            { label: 'Conductivity', val: '6.15 mS/cm (↑ slight)' },
            { label: 'Milk temp', val: '39.3°C (borderline)' },
            { label: 'Est. SCC', val: '265,000 cells/mL' },
            { label: 'Note', val: 'Murrah SCC threshold differs — monitor OD closely' },
          ]
        },
        followup: 'For buffaloes, SCC thresholds differ from cattle. Keep monitoring. Review farm hygiene and bedding conditions.'
      })
    },
    {
      triggers: ['4029', 'in-up-jh-4029', 'gir', 'healthy animal', 'status of animal'],
      response: () => ({
        text: `✅ <strong>Animal IN-UP-JH-4029</strong> — Gir Cow<br><br>All four quarters are within normal parameters. AI classification: <strong style="color:#166534">Low Risk — No Warning</strong>. Estimated SCC 68,000 cells/mL — well within healthy range.`,
        card: {
          title: 'IN-UP-JH-4029 Status', badge: 'Healthy', badgeColor: '#166534',
          rows: [
            { label: 'pH', val: '6.60 (Normal)' },
            { label: 'OD @600nm', val: '0.12 (Normal)' },
            { label: 'Conductivity', val: '4.60 mS/cm (Normal)' },
            { label: 'Milk temp', val: '38.3°C (Normal)' },
            { label: 'Est. SCC', val: '68,000 cells/mL' },
            { label: 'Recommendation', val: 'Continue routine monitoring. Next screen in 7 days.' },
          ]
        },
        followup: 'Gir breeds generally show stronger innate immunity. Maintain current farm hygiene standards.'
      })
    },
    {
      triggers: ['intervention', 'recommend', 'what should', 'what to do', 'protocol', 'treatment', 'preventive'],
      response: () => ({
        text: `💊 <strong>AI-Generated Intervention Recommendations — Current Session</strong><br><br>Based on multi-sensor analysis and herd profile, here are prioritized actions:`,
        card: {
          title: 'Prioritized Interventions', badge: '4 Actions', badgeColor: '#1E40AF',
          rows: [
            { label: '🚨 URGENT (Today)', val: 'Isolate IN-UP-JH-3714 · Aseptic culture · No shared cluster' },
            { label: '⚠️ HIGH (48h)', val: 'Milk IN-UP-JH-4082 last · 0.5% povidone-iodine post-dip' },
            { label: '💊 Supplement', val: 'Parenteral Vit E + Selenium for all subclinical cases' },
            { label: '🌡️ Environment', val: 'Shade + fans + early milking schedule (THI 81.2)' },
            { label: '🧬 AMR Protocol', val: 'Avoid prophylactic ABX — await ABST for 3714' },
            { label: '📱 Notification', val: 'SMS alerts sent to Dr. Anita Sharma & farm owners' },
          ]
        },
        followup: 'Would you like me to draft an SMS advisory for the farmers in Hindi or English?'
      })
    },
    {
      triggers: ['7-day forecast', '7 day', 'forecast', 'predict', 'upcoming', 'next week'],
      response: () => {
        const date = new Date();
        const days = Array.from({length: 7}, (_,i) => {
          const d = new Date(date); d.setDate(d.getDate() + i + 1);
          return d.toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short'});
        });
        return {
          text: `📈 <strong>7-Day Mastitis Risk Forecast — Jhansi Herd</strong><br><br>AI forecast based on current sensor trends, seasonal THI trajectory, and historical data:`,
          card: {
            title: '7-Day Forecast', badge: 'AI Forecast', badgeColor: '#1E40AF',
            rows: [
              { label: days[0], val: 'IN-UP-JH-3714 → Clinical onset likely · Vet visit critical' },
              { label: days[1], val: 'Herd SCC avg expected ↑ to ~420K (THI rising)' },
              { label: days[2], val: 'IN-UP-JH-4082 → High risk threshold breach if untreated' },
              { label: days[3], val: 'IN-UP-JH-3891 → Monitor — borderline escalation possible' },
              { label: days[4], val: 'THI forecast 82.5 — heat stress peak, risk window elevated' },
              { label: days[5], val: 'Post-intervention: SCC stabilization expected if 3714 treated' },
              { label: days[6], val: 'Weekly herd screen recommended — rescan all 28 animals' },
            ]
          },
          followup: 'This forecast is generated with 84% confidence. Intervention today for IN-UP-JH-3714 could prevent 2 additional escalations within 7 days.'
        };
      }
    },
    {
      triggers: ['amr', 'antimicrobial', 'antibiotic', 'abx steward', 'resistance', 'stewardship'],
      response: () => ({
        text: `🧬 <strong>AMR Stewardship Protocol — PashuRaksha AI Agent</strong><br><br>AMR mitigation is a core module of this platform, aligned with the National Action Plan on AMR (NAP-AMR) 2017.`,
        card: {
          title: 'AMR Stewardship Guidelines', badge: 'Active Protocol', badgeColor: '#166534',
          rows: [
            { label: 'Subclinical mastitis', val: 'No routine antibiotics — use Vit E/Se, improve hygiene' },
            { label: 'Clinical mastitis', val: 'Culture + ABST mandatory before prescription' },
            { label: 'Dry cow therapy', val: 'Selective, not blanket — based on SCC history' },
            { label: 'Teat dip', val: '0.5% povidone-iodine pre + post milking (barrier method)' },
            { label: 'Recording', val: 'All antibiotic use logged in Animal Health Records' },
            { label: 'Milk withheld', val: 'Respect withdrawal periods — milk SCC test before resuming' },
          ]
        },
        followup: 'The platform automatically flags any cases where antibiotic use may be premature and will alert the district AHO.'
      })
    },
    {
      triggers: ['heat stress', 'thi', 'temperature humidity', 'humidity', 'ventilation', 'shade', 'hot'],
      response: () => ({
        text: `🌡️ <strong>Heat Stress Management — THI 81.2 Alert</strong><br><br>THI of <strong style="color:#D97706">81.2</strong> places the herd in the <strong>Severe Heat Stress Zone</strong> (threshold 72). This directly suppresses neutrophil function and elevates mastitis risk by up to <strong>2.3×</strong>.`,
        card: {
          title: 'Heat Stress Protocol', badge: 'THI 81.2 — Severe', badgeColor: '#D97706',
          rows: [
            { label: 'Shade', val: 'Ensure min. 2.5 m² shade/animal — critical for Sahiwal & HF' },
            { label: 'Fans', val: 'Install 90cm fans every 3m in milking shed' },
            { label: 'Water', val: 'Provide 80–120L cool fresh water/animal/day' },
            { label: 'Milking schedule', val: 'Shift to 05:00–07:00 and 18:00–20:00 slots' },
            { label: 'Feed', val: 'Increase energy density, reduce bulk feed in peak heat' },
            { label: 'Electrolytes', val: 'Sodium bicarbonate (150g/animal/day) in feed during peak' },
          ]
        },
        followup: 'If THI rises above 85, activate emergency cooling protocol and consider reducing herd density temporarily.'
      })
    },
    {
      triggers: ['hs outbreak', 'haemorrhagic', 'babina', 'contain', 'septicaemia'],
      response: () => ({
        text: `🚨 <strong>HS Outbreak Containment — Babina Block</strong><br><br>Based on 14 deaths and suspected Haemorrhagic Septicaemia, here is the AI-recommended containment strategy:`,
        card: {
          title: 'HS Containment Protocol', badge: 'Critical Outbreak', badgeColor: '#DC2626',
          rows: [
            { label: 'Step 1', val: 'Enforce 5km movement ban immediately — no livestock trading' },
            { label: 'Step 2', val: 'Notify Block AHO + State Veterinary Emergency Response Team' },
            { label: 'Step 3', val: 'Emergency HS vaccination ring: 3km radius, Suvaxyn HS vaccine' },
            { label: 'Step 4', val: 'Carcass disposal: deep burial (≥2m) with lime — no open dumping' },
            { label: 'Step 5', val: 'Lab confirmation at IVRI Bareilly — request fast-track (48h)' },
            { label: 'Step 6', val: 'Zoonotic risk advisory to CMO — farm worker health check' },
          ]
        },
        followup: 'HS is highly fatal but preventable with timely vaccination. Would you like me to draft the outbreak notification for State Department?'
      })
    },
    {
      triggers: ['brucellosis', 'zoonotic', 'farm worker', 'chirgaon', 'precaution'],
      response: () => ({
        text: `⚠️ <strong>Brucellosis Zoonotic Risk — Chirgaon Block</strong><br><br>Farm workers with undulant fever after contact with aborting cattle is a <strong>high-probability Brucellosis zoonotic event</strong>. Immediate one-health response required.`,
        card: {
          title: 'Brucellosis Response Protocol', badge: 'Zoonotic Risk', badgeColor: '#991B1B',
          rows: [
            { label: 'Human health', val: 'CMO alert — refer 3 workers for Brucella serology + treatment' },
            { label: 'PPE', val: 'All farm workers: gloves, mask, goggles when handling animals' },
            { label: 'Animal testing', val: 'Rose Bengal Plate Test + MRT on all herd cattle (Chirgaon)' },
            { label: 'Positive animals', val: 'Culling or test-and-slaughter per NADCP protocol' },
            { label: 'Milk safety', val: 'Pasteurize all milk from affected farms immediately' },
            { label: 'Reporting', val: 'Mandatory report to District Collector + State EpiNet within 24h' },
          ]
        },
        followup: 'Brucellosis is a Schedule I notifiable disease. All actions must be documented. Do you want me to auto-generate the Form B notifiable disease report?'
      })
    },
    {
      triggers: ['sms', 'draft', 'message', 'advisory text', 'notification', 'broadcast', 'hindi', 'language'],
      response: () => ({
        text: `📱 <strong>Drafted SMS Advisory — Mastitis Alert (Hindi/English)</strong><br><br><em>English:</em> "PashuRaksha Alert: 3 cattle in your area are at high risk of mastitis. Milk these animals LAST. Apply iodine post-dip. Do NOT share milking equipment. Contact Dr. Anita Sharma: +91-94150-12345."<br><br><em>हिन्दी:</em> "PashuRaksha: आपके क्षेत्र की 3 गायों में थनैला का जोखिम है। उन्हें सबसे बाद में दूहें। आयोडीन का उपयोग करें। डॉ. अनिता: 94150-12345"`,
        card: {
          title: 'SMS Details', badge: 'Ready to Send', badgeColor: '#166534',
          rows: [
            { label: 'Recipients', val: '6 registered farmers (Babina block)' },
            { label: 'Characters', val: 'EN: 158 chars · HI: 162 chars' },
            { label: 'Channel', val: 'SMS + WhatsApp + IVR (Hindi)' },
            { label: 'Cost', val: 'Free under DAHD rural messaging scheme' },
          ]
        },
        followup: 'Click "Broadcast Advisory" in the Alerts view to send to all registered farmers in the selected area.'
      })
    },
    {
      triggers: ['hello', 'hi', 'help', 'what can you do', 'capabilities', 'welcome'],
      response: () => ({
        text: `👋 <strong>Welcome to PashuRaksha AI Agent!</strong><br><br>I am the AI-powered decision support engine for the <strong>Bovine Mastitis Forecasting System</strong>. I can:`,
        card: {
          title: 'My Capabilities', badge: 'AI Agent', badgeColor: '#166634',
          rows: [
            { label: '🐄 Mastitis Prediction', val: '7–14 day early warning using sensor fusion' },
            { label: '📊 Herd Risk Analysis', val: 'Animal-wise and herd-level risk scoring' },
            { label: '💊 Interventions', val: 'AMR-safe treatment and prevention recommendations' },
            { label: '📈 Forecasting', val: '7-day subclinical mastitis trajectory prediction' },
            { label: '🚨 Outbreak Response', val: 'HS, FMD, Brucellosis containment protocols' },
            { label: '📱 Alerts', val: 'SMS, WhatsApp, IVR advisory drafting' },
          ]
        },
        followup: 'Try asking: "What is the herd mastitis risk today?" or click a quick-action button above!'
      })
    },
  ],

  findResponse(query) {
    const q = query.toLowerCase();
    for (const entry of this.KB) {
      if (entry.triggers.some(t => q.includes(t.toLowerCase()))) {
        return entry.response();
      }
    }
    return {
      text: `🔍 I analyzed your query: <em>"${query}"</em><br><br>Based on current sensor data, the herd mastitis risk is <strong style="color:#D97706">Moderate-High</strong>. I can help with specific animal analysis, interventions, forecasting, or outbreak response.`,
      followup: 'Try asking about a specific animal tag (e.g., IN-UP-JH-4082), "herd risk", "interventions", or "7-day forecast".'
    };
  }
};

// ============================================================
// AGENT PANEL — OPEN / CLOSE
// ============================================================
function openAIAgent() {
  const panel    = document.getElementById('ai-agent-panel');
  const backdrop = document.getElementById('ai-agent-backdrop');
  if (!panel || !backdrop) return;
  panel.classList.add('open');
  backdrop.classList.add('visible');
  AI_AGENT.panelOpen = true;
  if (AI_AGENT.msgCount === 0) {
    const welcomeResp = AI_AGENT.findResponse('hello');
    appendAgentMsg(welcomeResp);
  }
  const badge = document.getElementById('fab-badge');
  if (badge) badge.style.display = 'none';
  setTimeout(() => {
    const inp = document.getElementById('aip-input');
    if (inp) inp.focus();
  }, 320);
}

function closeAIAgent() {
  const panel    = document.getElementById('ai-agent-panel');
  const backdrop = document.getElementById('ai-agent-backdrop');
  if (panel)    panel.classList.remove('open');
  if (backdrop) backdrop.classList.remove('visible');
  AI_AGENT.panelOpen = false;
}

function toggleAIAgent() {
  if (AI_AGENT.panelOpen) closeAIAgent();
  else openAIAgent();
}

function openAIAgentWithMsg(msg) {
  openAIAgent();
  setTimeout(() => agentQuickAsk(msg), AI_AGENT.msgCount === 0 ? 800 : 100);
}

// ============================================================
// AGENT MESSAGING
// ============================================================
function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function appendUserMsg(text) {
  const container = document.getElementById('aip-messages');
  if (!container) return;
  const role = ROLES[currentRole] || ROLES.officer;
  const el = document.createElement('div');
  el.className = 'aip-msg user';
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:flex-end;max-width:88%">
      <div class="aip-msg-bubble">${text}</div>
      <div class="aip-msg-time">${nowTime()}</div>
    </div>
    <div class="aip-msg-avatar">${role.avatar}</div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  AI_AGENT.msgCount++;
}

function showTypingIndicator() {
  const container = document.getElementById('aip-messages');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'aip-msg agent aip-typing';
  el.id = 'aip-typing-indicator';
  el.innerHTML = `
    <div class="aip-msg-avatar" style="font-size:.55rem;font-weight:700">AI</div>
    <div class="aip-msg-bubble">
      <div class="aip-typing-dot"></div>
      <div class="aip-typing-dot"></div>
      <div class="aip-typing-dot"></div>
    </div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('aip-typing-indicator');
  if (el) el.remove();
}

function appendAgentMsg(resp) {
  const container = document.getElementById('aip-messages');
  if (!container) return;

  let cardHtml = '';
  if (resp.card) {
    const c = resp.card;
    const rowsHtml = c.rows.map(r => `
      <div class="aip-risk-row">
        <span class="aip-risk-label">${r.label}</span>
        <span class="aip-risk-val" style="text-align:right;max-width:58%">${r.val}</span>
      </div>`).join('');
    cardHtml = `
      <div class="aip-risk-card">
        <div class="aip-risk-card-header">
          <span>${c.title}</span>
          <span class="risk-pill" style="background:${c.badgeColor}18;color:${c.badgeColor}">${c.badge}</span>
        </div>
        <div class="aip-risk-list">${rowsHtml}</div>
      </div>`;
  }

  const followupHtml = resp.followup
    ? `<div style="margin-top:8px;font-size:.75rem;color:var(--text-secondary);padding:7px 10px;background:#F0FDF4;border-radius:var(--radius-md);border-left:2px solid #166534">${resp.followup}</div>`
    : '';

  const el = document.createElement('div');
  el.className = 'aip-msg agent';
  el.innerHTML = `
    <div class="aip-msg-avatar" style="font-size:.55rem;font-weight:700">AI</div>
    <div style="max-width:88%">
      <div class="aip-msg-bubble">${resp.text}${cardHtml}</div>
      ${followupHtml}
      <div class="aip-msg-time">${nowTime()} · PashuRaksha AI</div>
    </div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  AI_AGENT.msgCount++;
  addActivityLogEntry('AI response generated', 'Just now · Query answered');
}

function agentSend() {
  const inp = document.getElementById('aip-input');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;
  inp.value = '';
  inp.style.height = '36px';
  appendUserMsg(text);
  showTypingIndicator();
  const delay = 800 + Math.random() * 800;
  setTimeout(() => {
    removeTypingIndicator();
    appendAgentMsg(AI_AGENT.findResponse(text));
  }, delay);
}

function agentQuickAsk(text) {
  if (!AI_AGENT.panelOpen) openAIAgent();
  setTimeout(() => {
    appendUserMsg(text);
    showTypingIndicator();
    const delay = 900 + Math.random() * 700;
    setTimeout(() => {
      removeTypingIndicator();
      appendAgentMsg(AI_AGENT.findResponse(text));
    }, delay);
  }, AI_AGENT.msgCount === 0 ? 600 : 50);
}

// ============================================================
// ADVISORY DRAFT WITH AI
// ============================================================
function agentDraftAdvisory() {
  const ta = document.getElementById('advisory-text-en');
  if (ta) ta.value = 'IMPORTANT ADVISORY — Mastitis Prevention Alert\n\nDear Farmer, your cattle are at elevated risk of mastitis due to current heat stress (THI 81.2) and high humidity (72%). Please:\n1. Ensure clean, dry bedding daily.\n2. Wash udder with clean water before milking.\n3. Apply iodine teat dip after every milking.\n4. Do NOT share milking equipment between animals.\n5. Report any swelling or unusual milk to your field vet immediately.\n\nFor help: Helpline 1800-XXX-XXXX (free).\n— PashuRaksha AI Alert System, Jhansi District';
  openAIAgentWithMsg('I drafted an advisory message for farmers. Can you improve it?');
}

// ============================================================
// INSIGHTS PANEL TOGGLE
// ============================================================
function toggleInsights(headerEl) {
  const body = document.getElementById('ai-insights-body');
  const chevron = headerEl.querySelector('.insights-chevron');
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0)';
}

// ============================================================
// AI ACTIVITY LOG
// ============================================================
function addActivityLogEntry(title, time) {
  const log = document.getElementById('ai-activity-log');
  if (!log) return;
  const el = document.createElement('div');
  el.className = 'timeline-item';
  el.innerHTML = `<div class="timeline-dot" style="background:#166534"></div><div class="timeline-content"><div class="timeline-title">${title}</div><div class="timeline-time">${time}</div></div>`;
  log.insertBefore(el, log.firstChild);
  // Keep only 8 entries
  while (log.children.length > 8) log.removeChild(log.lastChild);
}

// ============================================================
// SMART TOAST NOTIFICATIONS
// ============================================================
const TOAST_QUEUE = [
  {
    type: 'toast-critical',
    icon: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    title: '🚨 AI Alert: Mastitis Risk — IN-UP-JH-3714',
    desc: 'SCC 848K cells/mL detected. Clinical mastitis onset <7 days. Isolate immediately.',
    delay: 5000,
  },
  {
    type: 'toast-warning',
    icon: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>',
    title: '⚠️ AI Warning: Subclinical Risk — IN-UP-JH-4082',
    desc: 'Conductivity 5.9 mS/cm elevated. 7–9 day mastitis window. Pre-dip recommended.',
    delay: 18000,
  },
  {
    type: 'toast-info',
    icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    title: '📊 AI Report: Herd Analysis Complete',
    desc: '28 animals screened. 3 flagged. Avg SCC 382K. THI 81.2 — heat stress protocol active.',
    delay: 35000,
  },
  {
    type: 'toast-success',
    icon: '<polyline points="20,6 9,17 4,12"/>',
    title: '✅ Sensor Probe Online — 4 Parameters',
    desc: 'pH, Conductivity, OD, Temp. all connected. Real-time mastitis monitoring active.',
    delay: 55000,
  },
];

function showAIToast({ type, icon, title, desc, delay }) {
  setTimeout(() => {
    const container = document.getElementById('ai-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `ai-toast ${type}`;
    toast.innerHTML = `
      <div class="ai-toast-icon"><svg viewBox="0 0 24 24">${icon}</svg></div>
      <div class="ai-toast-body">
        <div class="ai-toast-title">${title}</div>
        <div class="ai-toast-desc">${desc}</div>
        <div class="ai-toast-time">${nowTime()} · PashuRaksha AI</div>
      </div>
      <div class="ai-toast-close" onclick="dismissToast(this.parentElement)">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>`;
    container.appendChild(toast);

    // Update FAB badge count
    const badge = document.getElementById('fab-badge');
    if (badge && !AI_AGENT.panelOpen) {
      badge.style.display = 'flex';
      badge.textContent = String(parseInt(badge.textContent || '0') + 1);
    }
    setTimeout(() => dismissToast(toast), 9000);
  }, delay);
}

function dismissToast(toast) {
  if (!toast || !toast.parentElement) return;
  toast.classList.add('toast-out');
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 350);
}

// ============================================================
// INIT — Schedule toasts after DOMContentLoaded (safe re-add)
// ============================================================
(function initAIAgent() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _startAIAgent);
  } else {
    _startAIAgent();
  }
})();

function _startAIAgent() {
  TOAST_QUEUE.forEach(t => showAIToast(t));

  // Periodic activity refresh every 90s
  setInterval(() => {
    const entries = [
      ['Sensor data re-fused', 'Just now · Auto-refresh'],
      ['SCC trajectory updated', 'Just now · 3 animals'],
      ['Heat stress index recalculated', 'Just now · THI 81.2'],
      ['Herd risk score refreshed', 'Just now · Moderate-High'],
    ];
    const e = entries[Math.floor(Math.random() * entries.length)];
    addActivityLogEntry(e[0], e[1]);

    if (Math.random() > 0.5) {
      showAIToast({
        type: 'toast-info',
        icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        title: '🔄 AI Re-Analysis Complete',
        desc: `Herd risk score refreshed. Current THI: ${(80 + Math.random() * 3).toFixed(1)}. 3 animals remain flagged.`,
        delay: 0,
      });
    }
  }, 90000);
}
