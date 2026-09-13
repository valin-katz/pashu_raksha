html = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PashuRaksha — Livestock Health Surveillance System</title>
  <meta name="description" content="National Animal Health Surveillance and Decision Support Platform for early detection, prevention and management of livestock diseases across India." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link rel="stylesheet" href="style.css" />
</head>
<body>

<!-- ROLE SELECTION -->
<div id="role-screen">
  <div class="role-left">
    <div class="role-logo">
      <div class="role-logo-mark">
        <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="role-logo-name">PashuRaksha<span>National Animal Health Surveillance</span></div>
    </div>
    <div>
      <div class="role-tagline">Protecting livestock,<br/>securing livelihoods.</div>
      <p class="role-sub" style="margin-top:14px">A unified decision-support platform for early detection, prevention and coordinated response to livestock disease outbreaks across India.</p>
      <div class="role-features">
        <div class="role-feat"><div class="role-feat-dot"></div><p>Real-time outbreak detection with AI-assisted triage and risk scoring</p></div>
        <div class="role-feat"><div class="role-feat-dot"></div><p>Geospatial risk maps at village, block, and district level</p></div>
        <div class="role-feat"><div class="role-feat-dot"></div><p>Works on mobile, web, IVR, and offline-enabled channels</p></div>
        <div class="role-feat"><div class="role-feat-dot"></div><p>Multilingual advisories and automated SMS/IVR alerts</p></div>
      </div>
    </div>
    <div class="role-left-footer">Ministry of Fisheries, Animal Husbandry &amp; Dairying &nbsp;&middot;&nbsp; Govt. of India &nbsp;&middot;&nbsp; SIH 2024</div>
  </div>

  <div class="role-right">
    <div class="role-right-inner">
      <div class="role-right-header">
        <h2>Select your role to continue</h2>
        <p>Your role determines which features and data are available to you.</p>
      </div>
      <div class="role-lang-row">
        <span class="role-lang-label">Language:</span>
        <button class="lang-btn active" onclick="setLang('en',this)">English</button>
        <button class="lang-btn" onclick="setLang('hi',this)">&#2361;&#2367;&#2306;&#2342;&#2368;</button>
        <button class="lang-btn" onclick="setLang('mr',this)">&#2350;&#2352;&#2366;&#2336;&#2368;</button>
        <button class="lang-btn" onclick="setLang('ta',this)">&#2980;&#2990;&#3007;&#2996;&#3021;</button>
      </div>
      <div class="role-cards">
        <div class="role-card" id="rc-farmer" onclick="selectRole('farmer',this)">
          <div class="role-card-icon" style="background:#FEF3C7">
            <svg viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="1.75"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          </div>
          <div class="role-card-title">Farmer / Livestock Owner</div>
          <div class="role-card-desc">Report symptoms, check animal health records, and receive advisories in your language.</div>
        </div>
        <div class="role-card" id="rc-fieldvet" onclick="selectRole('fieldvet',this)">
          <div class="role-card-icon" style="background:#DBEAFE">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1E40AF" stroke-width="1.75"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div class="role-card-title">Field Veterinarian</div>
          <div class="role-card-desc">Triage cases, manage treatment records, escalate samples to labs, file field reports.</div>
        </div>
        <div class="role-card" id="rc-paravet" onclick="selectRole('paravet',this)">
          <div class="role-card-icon" style="background:#D1FAE5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="1.75"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div class="role-card-title">Para-veterinary Worker</div>
          <div class="role-card-desc">Submit field reports, conduct vaccination drives, perform village-level surveillance.</div>
        </div>
        <div class="role-card selected" id="rc-officer" onclick="selectRole('officer',this)">
          <div class="role-card-icon" style="background:#F0FDF4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1C4532" stroke-width="1.75"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </div>
          <div class="role-card-title">District Health Officer</div>
          <div class="role-card-desc">Full surveillance dashboard, outbreak management, inter-department coordination.</div>
        </div>
      </div>
      <button class="role-enter-btn" onclick="enterApp()">
        Enter Dashboard
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</div>

<!-- APP -->
<div id="app">
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-mark">
        <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="sidebar-logo-text">PashuRaksha<span>Health Surveillance</span></div>
    </div>
    <div class="sidebar-role-pill">
      <div class="sidebar-role-dot"></div>
      <div class="sidebar-role-name" id="sidebar-role-name">District Health Officer</div>
      <div class="sidebar-role-change" onclick="changeRole()">Change</div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-group">
        <div class="nav-group-label">Overview</div>
        <div class="nav-item active" data-view="dashboard" onclick="switchView('dashboard',this)">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Dashboard
        </div>
        <div class="nav-item" data-view="map" onclick="switchView('map',this)">
          <svg viewBox="0 0 24 24"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          Risk Map <span class="nav-badge amber">3</span>
        </div>
      </div>
      <div class="nav-group">
        <div class="nav-group-label">Surveillance</div>
        <div class="nav-item" data-view="report" onclick="switchView('report',this)">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          Report Symptoms
        </div>
        <div class="nav-item" data-view="alerts" onclick="switchView('alerts',this)">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          Alerts &amp; Advisories <span class="nav-badge">7</span>
        </div>
      </div>
      <div class="nav-group">
        <div class="nav-group-label">Records</div>
        <div class="nav-item" data-view="records" onclick="switchView('records',this)">
          <svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          Animal Health Records
        </div>
        <div class="nav-item" data-view="lab" onclick="switchView('lab',this)">
          <svg viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11l-4 4h14l-4-4V3"/></svg>
          Lab &amp; Referrals
        </div>
        <div class="nav-item" data-view="vaccination" onclick="switchView('vaccination',this)">
          <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Vaccination Tracker
        </div>
      </div>
      <div class="nav-group">
        <div class="nav-group-label">Admin</div>
        <div class="nav-item" data-view="settings" onclick="switchView('settings',this)">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 16.66l-1.41 1.41M20 12h-2M6 12H4M19.07 19.07l-1.41-1.41M5.34 7.34L3.93 5.93M12 20v-2M12 6V4"/></svg>
          Settings
        </div>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-avatar" id="sidebar-avatar">DK</div>
        <div>
          <div class="sidebar-user-name" id="sidebar-user-name">Dr. Deepak Kumar</div>
          <div class="sidebar-user-role" id="sidebar-user-role">Jhansi District, UP</div>
        </div>
        <div class="sidebar-user-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="width:14px;height:14px"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </div>
      </div>
    </div>
  </aside>

  <div class="main">
    <header class="header">
      <div class="header-breadcrumb">
        <span>PashuRaksha</span>
        <svg viewBox="0 0 24 24" style="width:12px;height:12px;opacity:.5;fill:none;stroke:currentColor;stroke-width:2"><polyline points="9 18 15 12 9 6"/></svg>
        <span class="current" id="header-title">Dashboard</span>
      </div>
      <div class="header-spacer"></div>
      <div class="header-search">
        <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;color:var(--text-tertiary);flex-shrink:0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search animals, reports, alerts&hellip;" />
      </div>
      <div class="header-lang">
        <button class="active" onclick="headerLang('en',this)">EN</button>
        <button onclick="headerLang('hi',this)">HI</button>
        <button onclick="headerLang('mr',this)">MR</button>
      </div>
      <div class="header-icon-btn" role="button" tabindex="0" aria-label="Notifications">
        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div class="notif-dot"></div>
      </div>
      <div class="header-icon-btn" role="button" tabindex="0" aria-label="Download Report">
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </div>
    </header>

    <main class="content">

      <!-- ==================== DASHBOARD ==================== -->
      <div class="view active" id="view-dashboard">
        <div class="page-header">
          <div>
            <div class="page-title">District Animal Health Overview</div>
            <div class="page-subtitle"><span class="live-dot"></span>Jhansi District, UP &nbsp;&middot;&nbsp; Updated 4 min ago &nbsp;&middot;&nbsp; <strong>Kharif season</strong> elevated risk</div>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-secondary btn-sm">
              <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h8m-8 6h16"/></svg>Filter
            </button>
            <button class="btn btn-primary btn-sm" onclick="switchView('report',document.querySelector('[data-view=report]'))">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>File Report
            </button>
          </div>
        </div>
        <div class="alert-strip critical mb-4">
          <div class="alert-strip-icon"><svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
          <div class="alert-strip-content">
            <div class="alert-strip-title">Active Outbreak Alert &mdash; Haemorrhagic Septicaemia (HS)</div>
            <div class="alert-strip-body">Cluster of 14 bovine deaths reported across Babina and Moth blocks. Containment team deployed. Lab confirmation pending from IVRI Bareilly.</div>
            <div class="alert-strip-time">Reported 2h 14m ago &nbsp;&middot;&nbsp; Babina Block, Jhansi District</div>
          </div>
          <div class="alert-strip-action">
            <button class="btn btn-sm" style="background:rgba(153,27,27,0.1);color:var(--danger);border:none" onclick="switchView('alerts',document.querySelector('[data-view=alerts]'))">View Case &rarr;</button>
          </div>
        </div>
        <div class="stats-row">
          <div class="stat-cell"><div class="stat-label">Active Alerts</div><div class="stat-value" style="color:var(--danger)">7</div><div class="stat-delta up">&uarr; 3 from yesterday</div><div class="stat-accent" style="background:var(--danger);opacity:.25"></div></div>
          <div class="stat-cell"><div class="stat-label">Animals at Risk</div><div class="stat-value">2,841</div><div class="stat-delta up">&uarr; 12% this week</div><div class="stat-accent" style="background:var(--warning);opacity:.3"></div></div>
          <div class="stat-cell"><div class="stat-label">Vaccinated Today</div><div class="stat-value" style="color:var(--success)">384</div><div class="stat-delta down">&uarr; 18 vs target</div><div class="stat-accent" style="background:var(--success);opacity:.35"></div></div>
          <div class="stat-cell"><div class="stat-label">Pending Lab Reports</div><div class="stat-value">19</div><div class="stat-delta">Avg. 3.2d TAT</div><div class="stat-accent" style="background:var(--info);opacity:.3"></div></div>
        </div>
        <div class="dash-grid">
          <div class="dash-left">
            <div class="section">
              <div class="section-header">
                <div><div class="section-title">Disease Incidence Trend</div><div class="section-meta">Last 12 months &mdash; Jhansi District</div></div>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-secondary btn-sm chart-p active" onclick="setPeriod('12m',this)">12M</button>
                  <button class="btn btn-secondary btn-sm chart-p" onclick="setPeriod('6m',this)">6M</button>
                  <button class="btn btn-secondary btn-sm chart-p" onclick="setPeriod('3m',this)">3M</button>
                </div>
              </div>
              <div class="section-body"><div style="height:220px"><canvas id="trend-chart"></canvas></div></div>
            </div>
            <div class="section">
              <div class="section-header">
                <div class="section-title">Recent Symptom Reports</div>
                <button class="btn btn-secondary btn-sm" onclick="switchView('records',document.querySelector('[data-view=records]'))">View all &rarr;</button>
              </div>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Report ID</th><th>Location</th><th>Animal</th><th>Symptoms</th><th>Risk</th><th>Status</th><th>Filed</th></tr></thead>
                  <tbody>
                    <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">RPT-2847</code></td><td>Babina Block</td><td>Cattle (4)</td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">High fever, nasal discharge, laboured breathing</td><td><span class="badge badge-danger"><span class="badge-dot"></span>Critical</span></td><td><span class="badge badge-warning">Under Review</span></td><td style="font-size:.75rem;color:var(--text-tertiary)">2h ago</td></tr>
                    <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">RPT-2846</code></td><td>Moth Block</td><td>Buffalo (2)</td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Swollen lymph nodes, sudden death</td><td><span class="badge badge-danger"><span class="badge-dot"></span>Critical</span></td><td><span class="badge badge-info">Lab Sent</span></td><td style="font-size:.75rem;color:var(--text-tertiary)">4h ago</td></tr>
                    <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">RPT-2845</code></td><td>Gursarai</td><td>Goat (11)</td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Diarrhoea, weight loss, poor coat</td><td><span class="badge badge-warning"><span class="badge-dot"></span>Moderate</span></td><td><span class="badge badge-success">Treated</span></td><td style="font-size:.75rem;color:var(--text-tertiary)">6h ago</td></tr>
                    <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">RPT-2844</code></td><td>Chirgaon</td><td>Sheep (7)</td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Limping, sores on mouth and feet</td><td><span class="badge badge-high"><span class="badge-dot"></span>High</span></td><td><span class="badge badge-warning">Under Review</span></td><td style="font-size:.75rem;color:var(--text-tertiary)">9h ago</td></tr>
                    <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">RPT-2843</code></td><td>Mauranipur</td><td>Cattle (1)</td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Decreased milk yield, mastitis signs</td><td><span class="badge badge-neutral">Low</span></td><td><span class="badge badge-success">Resolved</span></td><td style="font-size:.75rem;color:var(--text-tertiary)">1d ago</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="dash-right">
            <div class="section">
              <div class="section-header"><div class="section-title">Active Cases by Disease</div></div>
              <div class="section-body" style="padding-top:12px">
                <div style="height:150px"><canvas id="disease-donut"></canvas></div>
                <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">
                  <div class="sparkline-row"><span class="sparkline-name">Haemorrhagic Septicaemia</span><div class="progress-bar" style="width:70px"><div class="progress-fill" style="width:74%;background:var(--danger)"></div></div><span class="sparkline-val">41</span></div>
                  <div class="sparkline-row"><span class="sparkline-name">Foot &amp; Mouth Disease</span><div class="progress-bar" style="width:70px"><div class="progress-fill" style="width:52%;background:var(--warning)"></div></div><span class="sparkline-val">29</span></div>
                  <div class="sparkline-row"><span class="sparkline-name">Brucellosis</span><div class="progress-bar" style="width:70px"><div class="progress-fill" style="width:28%;background:#C2410C"></div></div><span class="sparkline-val">16</span></div>
                  <div class="sparkline-row"><span class="sparkline-name">PPR (Small Ruminants)</span><div class="progress-bar" style="width:70px"><div class="progress-fill" style="width:21%;background:var(--info)"></div></div><span class="sparkline-val">12</span></div>
                  <div class="sparkline-row"><span class="sparkline-name">Others</span><div class="progress-bar" style="width:70px"><div class="progress-fill" style="width:10%;background:var(--border-strong)"></div></div><span class="sparkline-val">7</span></div>
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-header"><div class="section-title">Vaccination Coverage</div><div class="section-meta">FMD Drive 2024</div></div>
              <div class="section-body" style="padding:14px 18px">
                <div style="display:flex;flex-direction:column;gap:10px">
                  <div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.8125rem;color:var(--text-secondary)">Babina</span><span style="font-size:.8125rem;font-weight:600">91%</span></div><div class="progress-bar"><div class="progress-fill" style="width:91%;background:var(--success)"></div></div></div>
                  <div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.8125rem;color:var(--text-secondary)">Moth</span><span style="font-size:.8125rem;font-weight:600">78%</span></div><div class="progress-bar"><div class="progress-fill" style="width:78%;background:var(--success)"></div></div></div>
                  <div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.8125rem;color:var(--text-secondary)">Gursarai</span><span style="font-size:.8125rem;font-weight:600;color:var(--warning)">61%</span></div><div class="progress-bar"><div class="progress-fill" style="width:61%;background:var(--warning)"></div></div></div>
                  <div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.8125rem;color:var(--text-secondary)">Chirgaon</span><span style="font-size:.8125rem;font-weight:600;color:var(--warning)">54%</span></div><div class="progress-bar"><div class="progress-fill" style="width:54%;background:var(--warning)"></div></div></div>
                  <div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.8125rem;color:var(--text-secondary)">Mauranipur</span><span style="font-size:.8125rem;font-weight:600;color:var(--danger)">38%</span></div><div class="progress-bar"><div class="progress-fill" style="width:38%;background:var(--danger)"></div></div></div>
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-header"><div class="section-title">Seasonal Risk Factors</div><div class="section-meta">Sept 2024</div></div>
              <div class="section-body">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <div class="info-card"><div class="info-card-label">Temp</div><div class="info-card-value">34&deg;C</div><div class="info-card-sub">Avg. max this week</div></div>
                  <div class="info-card"><div class="info-card-label">Humidity</div><div class="info-card-value">82%</div><div class="info-card-sub">High &mdash; FMD risk &uarr;</div></div>
                  <div class="info-card"><div class="info-card-label">Rainfall</div><div class="info-card-value">118mm</div><div class="info-card-sub">Above normal</div></div>
                  <div class="info-card"><div class="info-card-label">Disease Risk</div><div class="info-card-value" style="color:var(--danger)">High</div><div class="info-card-sub">HS &middot; FMD &middot; PPR</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== REPORT ==================== -->
      <div class="view" id="view-report">
        <div class="page-header">
          <div><div class="page-title" id="report-title-text">Report Animal Health Symptoms</div><div class="page-subtitle">Submit a new report for AI-assisted triage and veterinary review</div></div>
          <div class="page-header-actions"><button class="btn btn-secondary btn-sm">Report via IVR</button></div>
        </div>
        <div class="report-layout">
          <div class="section">
            <div class="tabs" id="report-tabs">
              <div class="tab-btn active" onclick="switchTab('basic',this)">Basic Information</div>
              <div class="tab-btn" onclick="switchTab('symptoms',this)">Symptoms &amp; Triage</div>
              <div class="tab-btn" onclick="switchTab('history',this)">Animal History</div>
            </div>
            <div id="tab-basic" class="section-body">
              <div class="form-section">
                <div class="form-section-title">Reporter &amp; Location</div>
                <div class="form-grid form-grid-2">
                  <div class="form-field"><label class="form-label">Reporter Name <span class="req">*</span></label><input type="text" class="form-input" placeholder="Enter full name" /></div>
                  <div class="form-field"><label class="form-label">Mobile Number <span class="req">*</span></label><input type="tel" class="form-input" placeholder="+91 XXXXX XXXXX" /></div>
                  <div class="form-field"><label class="form-label">District <span class="req">*</span></label><select class="form-input"><option value="">Select district</option><option selected>Jhansi</option><option>Lalitpur</option><option>Banda</option><option>Mahoba</option></select></div>
                  <div class="form-field"><label class="form-label">Block / Tehsil <span class="req">*</span></label><select class="form-input"><option value="">Select block</option><option>Babina</option><option>Moth</option><option>Gursarai</option><option>Chirgaon</option><option>Mauranipur</option></select></div>
                  <div class="form-field" style="grid-column:1/-1"><label class="form-label">Village Name</label><input type="text" class="form-input" placeholder="Enter village name" /><div class="form-help">GPS location will be captured automatically if location permission is granted.</div></div>
                </div>
              </div>
              <div class="form-section">
                <div class="form-section-title">Herd Information</div>
                <div class="form-grid form-grid-3">
                  <div class="form-field"><label class="form-label">Animal Type <span class="req">*</span></label><select class="form-input"><option value="">Select type</option><option>Cattle (Cow)</option><option>Buffalo</option><option>Goat</option><option>Sheep</option><option>Pig</option><option>Poultry</option></select></div>
                  <div class="form-field"><label class="form-label">Number Affected <span class="req">*</span></label><input type="number" class="form-input" id="f-count" placeholder="e.g. 3" min="1" /></div>
                  <div class="form-field"><label class="form-label">Deaths Reported</label><input type="number" class="form-input" id="f-deaths" placeholder="0" min="0" /></div>
                </div>
              </div>
              <button class="btn btn-primary" onclick="switchTab('symptoms',document.querySelectorAll('#report-tabs .tab-btn')[1])">Next: Describe Symptoms &rarr;</button>
            </div>
            <div id="tab-symptoms" class="section-body" style="display:none">
              <div class="form-section">
                <div class="form-section-title">Select All Observed Symptoms</div>
                <div class="symptom-grid" id="symptom-chips">
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="fever" />High Fever (&gt;104&deg;F)</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="nasal" />Nasal Discharge</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="breath" />Laboured Breathing</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="bleed" />Bleeding / Haemorrhage</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="sores" />Sores / Blisters (mouth/feet)</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="lameness" />Lameness / Limping</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="diarrhea" />Diarrhoea</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="milk" />Reduced Milk Yield</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="weight" />Sudden Weight Loss</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="swollen" />Swollen Lymph Nodes</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="appetite" />Loss of Appetite</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="death" />Sudden Death</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="skin" />Skin Lesions / Rash</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="eye" />Eye Discharge</label>
                  <label class="symptom-chip" onclick="toggleChip(this)"><input type="checkbox" value="abort" />Abortion / Stillbirth</label>
                </div>
              </div>
              <div class="form-section">
                <div class="form-section-title">Additional Details</div>
                <div class="form-grid">
                  <div class="form-field"><label class="form-label">When did symptoms first appear?</label><input type="date" class="form-input" /></div>
                  <div class="form-field"><label class="form-label">Additional observations</label><textarea class="form-input" rows="3" placeholder="Describe other symptoms, recent movements, contact with other herds, nearby deaths&hellip;"></textarea></div>
                </div>
              </div>
              <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
                <button class="btn btn-primary" onclick="runTriage()">
                  <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Run AI Triage &amp; Submit Report
                </button>
                <span style="font-size:.75rem;color:var(--text-tertiary)">Sent to the nearest veterinary dispensary</span>
              </div>
              <div class="triage-panel" id="triage-panel">
                <div class="triage-header"><div class="triage-title">AI Triage Assessment</div><span class="badge" id="triage-badge">&mdash;</span></div>
                <div class="triage-body">
                  <div class="triage-risk-row"><span class="triage-risk-label">Risk Score</span><div class="triage-risk-bar"><div class="triage-risk-fill" id="triage-fill" style="width:0"></div></div><span class="triage-risk-val" id="triage-score">&mdash;</span></div>
                  <div style="margin-bottom:12px"><div class="triage-disease-label">Suspected Disease(s)</div><div class="triage-disease-val" id="triage-diseases">&mdash;</div></div>
                  <div class="triage-recs"><div class="triage-recs-title">Recommended Actions</div><div id="triage-recs"></div></div>
                </div>
              </div>
            </div>
            <div id="tab-history" class="section-body" style="display:none">
              <div class="form-section">
                <div class="form-section-title">Vaccination &amp; Treatment History</div>
                <div class="form-grid form-grid-2">
                  <div class="form-field"><label class="form-label">Last FMD Vaccination</label><input type="date" class="form-input" /></div>
                  <div class="form-field"><label class="form-label">Last HS Vaccination</label><input type="date" class="form-input" /></div>
                  <div class="form-field"><label class="form-label">Recent livestock movement?</label><select class="form-input"><option>No</option><option>Yes &mdash; within district</option><option>Yes &mdash; outside district</option><option>Yes &mdash; from market/mela</option></select></div>
                  <div class="form-field"><label class="form-label">Neighbouring herd affected?</label><select class="form-input"><option>Unknown</option><option>No</option><option>Yes</option></select></div>
                  <div class="form-field" style="grid-column:1/-1"><label class="form-label">Any ongoing treatment?</label><textarea class="form-input" rows="2" placeholder="Medicines given, by whom, when&hellip;"></textarea></div>
                </div>
              </div>
              <button class="btn btn-primary" onclick="runTriage()">Submit Report</button>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="section">
              <div class="section-header"><div class="section-title">Disease Activity Nearby</div></div>
              <div class="timeline">
                <div class="timeline-item"><div class="timeline-dot" style="background:var(--danger)"></div><div class="timeline-content"><div class="timeline-title">Haemorrhagic Septicaemia &mdash; Babina</div><div class="timeline-body">14 cattle deaths. Active containment underway.</div><div class="timeline-time">2 hours ago</div></div></div>
                <div class="timeline-item"><div class="timeline-dot" style="background:var(--warning)"></div><div class="timeline-content"><div class="timeline-title">FMD Suspected &mdash; Moth Block</div><div class="timeline-body">Sores in 3 cattle herds. Lab samples sent.</div><div class="timeline-time">Yesterday</div></div></div>
                <div class="timeline-item"><div class="timeline-dot" style="background:var(--info)"></div><div class="timeline-content"><div class="timeline-title">PPR Alert &mdash; Gursarai</div><div class="timeline-body">Small ruminant cluster. Under monitoring.</div><div class="timeline-time">3 days ago</div></div></div>
              </div>
            </div>
            <div class="section">
              <div class="section-body"><div style="display:flex;align-items:center;gap:10px"><div style="width:8px;height:8px;border-radius:50%;background:var(--success);flex-shrink:0"></div><div><div style="font-size:.8125rem;font-weight:500;color:var(--text-primary)">Connected &mdash; Online Mode</div><div style="font-size:.75rem;color:var(--text-tertiary)">Reports submit instantly. Offline queue: 0 pending.</div></div></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== MAP ==================== -->
      <div class="view" id="view-map">
        <div class="page-header">
          <div><div class="page-title">Geospatial Disease Risk Map</div><div class="page-subtitle">Real-time outbreak locations and risk zones &mdash; Uttar Pradesh</div></div>
          <div class="page-header-actions"><button class="btn btn-secondary btn-sm">Export KML</button><button class="btn btn-primary btn-sm">Full Screen</button></div>
        </div>
        <div class="section" style="overflow:hidden">
          <div class="map-controls">
            <span class="map-filter-label">Disease:</span>
            <button class="map-filter-btn active" onclick="mf(this)">All</button>
            <button class="map-filter-btn" onclick="mf(this)">HS</button>
            <button class="map-filter-btn" onclick="mf(this)">FMD</button>
            <button class="map-filter-btn" onclick="mf(this)">PPR</button>
            <button class="map-filter-btn" onclick="mf(this)">Brucellosis</button>
            <div style="width:1px;height:20px;background:var(--border-subtle);margin:0 6px"></div>
            <span class="map-filter-label">Layer:</span>
            <button class="map-filter-btn active" onclick="mf(this)">Outbreaks</button>
            <button class="map-filter-btn" onclick="mf(this)">Risk Zones</button>
            <button class="map-filter-btn" onclick="mf(this)">Vaccination</button>
            <button class="map-filter-btn" onclick="mf(this)">Weather</button>
          </div>
          <div id="disease-map"></div>
          <div class="map-legend">
            <span class="legend-title">Risk Level:</span>
            <div class="legend-items">
              <div class="legend-item"><div class="legend-dot" style="background:#DC2626"></div>Critical</div>
              <div class="legend-item"><div class="legend-dot" style="background:#EA580C"></div>High</div>
              <div class="legend-item"><div class="legend-dot" style="background:#D97706"></div>Moderate</div>
              <div class="legend-item"><div class="legend-dot" style="background:#16A34A"></div>Low</div>
              <div class="legend-item"><div class="legend-dot" style="background:#94A3B8"></div>Surveillance</div>
            </div>
          </div>
        </div>
        <div class="section mt-4">
          <div class="section-header"><div class="section-title">Active Outbreak Clusters</div></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Cluster ID</th><th>Location</th><th>Disease</th><th>Animals</th><th>Deaths</th><th>Reported</th><th>Status</th><th></th></tr></thead>
              <tbody>
                <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">OB-2024-089</code></td><td>Babina Block, Jhansi</td><td>Haemorrhagic Septicaemia</td><td>56</td><td style="color:var(--danger);font-weight:600">14</td><td style="font-size:.75rem">28 Aug 2024</td><td><span class="badge badge-danger"><span class="badge-dot"></span>Active</span></td><td><button class="btn btn-secondary btn-sm">Details</button></td></tr>
                <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">OB-2024-091</code></td><td>Moth Block, Jhansi</td><td>FMD (suspected)</td><td>31</td><td>0</td><td style="font-size:.75rem">30 Aug 2024</td><td><span class="badge badge-warning">Investigating</span></td><td><button class="btn btn-secondary btn-sm">Details</button></td></tr>
                <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">OB-2024-087</code></td><td>Lalitpur District</td><td>PPR</td><td>88</td><td style="color:var(--warning);font-weight:600">6</td><td style="font-size:.75rem">24 Aug 2024</td><td><span class="badge badge-neutral">Contained</span></td><td><button class="btn btn-secondary btn-sm">Details</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==================== RECORDS ==================== -->
      <div class="view" id="view-records">
        <div class="page-header">
          <div><div class="page-title">Animal Health Records</div><div class="page-subtitle">Herd and individual animal-level health, vaccination, and treatment data</div></div>
          <div class="page-header-actions"><button class="btn btn-secondary btn-sm">Import</button><button class="btn btn-primary btn-sm"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Register Animal</button></div>
        </div>
        <div class="records-filters">
          <div class="filter-input-wrap"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="search" placeholder="Search by ID, owner, village&hellip;" /></div>
          <select class="filter-select"><option>All Species</option><option>Cattle</option><option>Buffalo</option><option>Goat</option><option>Sheep</option></select>
          <select class="filter-select"><option>All Blocks</option><option>Babina</option><option>Moth</option><option>Gursarai</option></select>
          <select class="filter-select"><option>Vaccination: All</option><option>Vaccinated</option><option>Overdue</option><option>Never Vaccinated</option></select>
          <div style="margin-left:auto;font-size:.75rem;color:var(--text-tertiary)">1,284 records</div>
        </div>
        <div class="section">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Animal ID</th><th>Species / Breed</th><th>Owner</th><th>Village / Block</th><th>Age</th><th>FMD Vacc.</th><th>HS Vacc.</th><th>Last Checkup</th><th>Status</th><th></th></tr></thead>
              <tbody>
                <tr><td><div class="animal-id-cell"><div class="animal-icon">&#x1F404;</div><code style="font-size:.75rem">UP-JH-2847</code></div></td><td>Cattle / Sahiwal</td><td>Ram Singh</td><td>Babina Rd, Babina</td><td>4y</td><td><span class="badge badge-success">Apr 2024</span></td><td><span class="badge badge-danger">Overdue</span></td><td style="font-size:.75rem">12 Aug</td><td><span class="badge badge-danger"><span class="badge-dot"></span>Sick</span></td><td><button class="btn btn-secondary btn-sm">View</button></td></tr>
                <tr><td><div class="animal-id-cell"><div class="animal-icon">&#x1F403;</div><code style="font-size:.75rem">UP-JH-2831</code></div></td><td>Buffalo / Murrah</td><td>Sunita Devi</td><td>Moth, Moth Block</td><td>6y</td><td><span class="badge badge-success">Mar 2024</span></td><td><span class="badge badge-success">Jan 2024</span></td><td style="font-size:.75rem">28 Aug</td><td><span class="badge badge-warning"><span class="badge-dot"></span>At Risk</span></td><td><button class="btn btn-secondary btn-sm">View</button></td></tr>
                <tr><td><div class="animal-id-cell"><div class="animal-icon">&#x1F410;</div><code style="font-size:.75rem">UP-JH-2788</code></div></td><td>Goat / Sirohi</td><td>Mohan Lal</td><td>Gursarai Town</td><td>2y</td><td><span class="badge badge-neutral">N/A</span></td><td><span class="badge badge-neutral">N/A</span></td><td style="font-size:.75rem">18 Jul</td><td><span class="badge badge-success"><span class="badge-dot"></span>Healthy</span></td><td><button class="btn btn-secondary btn-sm">View</button></td></tr>
                <tr><td><div class="animal-id-cell"><div class="animal-icon">&#x1F404;</div><code style="font-size:.75rem">UP-JH-2779</code></div></td><td>Cattle / HF Cross</td><td>Priya Sharma</td><td>Chirgaon</td><td>3y</td><td><span class="badge badge-danger">Overdue</span></td><td><span class="badge badge-danger">Overdue</span></td><td style="font-size:.75rem">5 Jul</td><td><span class="badge badge-warning"><span class="badge-dot"></span>At Risk</span></td><td><button class="btn btn-secondary btn-sm">View</button></td></tr>
                <tr><td><div class="animal-id-cell"><div class="animal-icon">&#x1F411;</div><code style="font-size:.75rem">UP-JH-2764</code></div></td><td>Sheep / Awassi</td><td>Deepak Yadav</td><td>Mauranipur</td><td>1y</td><td><span class="badge badge-neutral">N/A</span></td><td><span class="badge badge-neutral">N/A</span></td><td style="font-size:.75rem">1 Sep</td><td><span class="badge badge-success"><span class="badge-dot"></span>Healthy</span></td><td><button class="btn btn-secondary btn-sm">View</button></td></tr>
              </tbody>
            </table>
          </div>
          <div style="padding:12px 18px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between">
            <div style="font-size:.75rem;color:var(--text-tertiary)">Showing 5 of 1,284 records</div>
            <div style="display:flex;gap:4px">
              <button class="btn btn-secondary btn-sm">&larr; Prev</button>
              <button class="btn btn-sm" style="background:var(--brand-primary);color:#fff;border-color:var(--brand-primary)">1</button>
              <button class="btn btn-secondary btn-sm">2</button>
              <button class="btn btn-secondary btn-sm">3</button>
              <button class="btn btn-secondary btn-sm">Next &rarr;</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== ALERTS ==================== -->
      <div class="view" id="view-alerts">
        <div class="page-header">
          <div><div class="page-title">Alerts &amp; Advisories</div><div class="page-subtitle">7 active alerts across Jhansi district &mdash; 2 require immediate action</div></div>
          <div class="page-header-actions"><button class="btn btn-secondary btn-sm">Mark All Read</button><button class="btn btn-primary btn-sm">Issue Advisory</button></div>
        </div>
        <div class="grid-2-1" style="gap:16px">
          <div>
            <div class="section">
              <div class="tabs" id="alert-tabs">
                <div class="tab-btn active" onclick="filterAlerts('all',this)">All (7)</div>
                <div class="tab-btn" onclick="filterAlerts('critical',this)">Critical (2)</div>
                <div class="tab-btn" onclick="filterAlerts('high',this)">High (3)</div>
                <div class="tab-btn" onclick="filterAlerts('advisory',this)">Advisories (2)</div>
              </div>
              <div class="alert-list" id="alert-list">
                <div class="alert-row" data-sev="critical"><div class="alert-severity-bar" style="background:var(--danger)"></div><div class="alert-row-content"><div class="alert-row-title">CRITICAL: HS Outbreak &mdash; Babina Block</div><div class="alert-row-body">14 bovine deaths confirmed. Suspected Haemorrhagic Septicaemia. Containment team deployed. Lab samples sent to IVRI Bareilly. Veterinary OSD notified.</div><div class="alert-row-meta"><span class="alert-meta-item"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>2h 14m ago</span><span class="alert-meta-item">Babina, Jhansi</span><span class="badge badge-danger"><span class="badge-dot"></span>Unresolved</span></div></div><div class="alert-row-actions"><button class="btn btn-secondary btn-sm">Escalate</button><button class="btn btn-primary btn-sm">Respond</button></div></div>
                <div class="alert-row" data-sev="critical"><div class="alert-severity-bar" style="background:var(--danger)"></div><div class="alert-row-content"><div class="alert-row-title">CRITICAL: Suspected Zoonotic Risk &mdash; Brucellosis</div><div class="alert-row-body">3 farm workers in Chirgaon block reporting fever and joint pain after contact with aborting cattle. CMO office coordination initiated. Public health advisory drafted.</div><div class="alert-row-meta"><span class="alert-meta-item"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>6h ago</span><span class="alert-meta-item">Chirgaon</span><span class="badge badge-danger"><span class="badge-dot"></span>Unresolved</span></div></div><div class="alert-row-actions"><button class="btn btn-secondary btn-sm">Escalate</button><button class="btn btn-primary btn-sm">Respond</button></div></div>
                <div class="alert-row" data-sev="high"><div class="alert-severity-bar" style="background:#EA580C"></div><div class="alert-row-content"><div class="alert-row-title">HIGH: FMD Cluster &mdash; Moth Block</div><div class="alert-row-body">Oral and foot lesions observed in 31 cattle across 4 villages. Vaccination ring protocol initiated. Movement restriction recommended within 5km radius.</div><div class="alert-row-meta"><span class="alert-meta-item"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>Yesterday</span><span class="alert-meta-item">Moth Block</span><span class="badge badge-high">In Progress</span></div></div><div class="alert-row-actions"><button class="btn btn-secondary btn-sm">View</button></div></div>
                <div class="alert-row" data-sev="high"><div class="alert-severity-bar" style="background:#EA580C"></div><div class="alert-row-content"><div class="alert-row-title">HIGH: Low Vaccination Coverage &mdash; Mauranipur</div><div class="alert-row-body">FMD vaccination coverage at 38% &mdash; below the 70% threshold for herd immunity. Emergency vaccination camp scheduled for 5 Sept 2024.</div><div class="alert-row-meta"><span class="alert-meta-item"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>2 days ago</span><span class="alert-meta-item">Mauranipur</span><span class="badge badge-high">Action Required</span></div></div><div class="alert-row-actions"><button class="btn btn-secondary btn-sm">Schedule</button></div></div>
                <div class="alert-row" data-sev="advisory"><div class="alert-severity-bar" style="background:var(--info)"></div><div class="alert-row-content"><div class="alert-row-title">ADVISORY: Seasonal FMD Risk &mdash; Kharif Season</div><div class="alert-row-body">High humidity (82%) and above-normal rainfall create elevated FMD transmission risk. All farmers advised to report oral/foot lesions immediately and avoid livestock fairs until 15 Sept.</div><div class="alert-row-meta"><span class="alert-meta-item"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>System generated</span><span class="alert-meta-item">District-wide</span><span class="badge badge-info">Advisory</span></div></div><div class="alert-row-actions"><button class="btn btn-secondary btn-sm">Broadcast SMS</button></div></div>
              </div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="section">
              <div class="section-header"><div class="section-title">Issue Multilingual Advisory</div></div>
              <div class="section-body">
                <div class="form-field mb-4"><label class="form-label">Target Area</label><select class="form-input"><option>Jhansi District (All Blocks)</option><option>Babina Block</option><option>Moth Block</option></select></div>
                <div class="form-field mb-4"><label class="form-label">Advisory Type</label><select class="form-input"><option>Disease Prevention</option><option>Vaccination Drive</option><option>Movement Restriction</option><option>Emergency Alert</option></select></div>
                <div class="form-field mb-4"><label class="form-label">Message (English)</label><textarea class="form-input" rows="4" placeholder="Write advisory message&hellip;"></textarea></div>
                <div class="form-field mb-4"><label class="form-label">Broadcast Channels</label><div class="checkbox-group"><label class="checkbox-item"><input type="checkbox" checked /><span class="checkbox-label">SMS to registered farmers</span></label><label class="checkbox-item"><input type="checkbox" checked /><span class="checkbox-label">IVR Voice Call (Hindi)</span></label><label class="checkbox-item"><input type="checkbox" /><span class="checkbox-label">WhatsApp (where available)</span></label></div></div>
                <button class="btn btn-primary" style="width:100%">Broadcast Advisory</button>
              </div>
            </div>
            <div class="section">
              <div class="section-header"><div class="section-title">Escalation Chain</div></div>
              <div class="timeline">
                <div class="timeline-item"><div class="timeline-dot" style="background:var(--success)"></div><div class="timeline-content"><div class="timeline-title">Field Veterinarian notified</div><div class="timeline-time">2h 14m ago</div></div></div>
                <div class="timeline-item"><div class="timeline-dot" style="background:var(--success)"></div><div class="timeline-content"><div class="timeline-title">District AH Officer alerted</div><div class="timeline-time">2h 08m ago</div></div></div>
                <div class="timeline-item"><div class="timeline-dot" style="background:var(--warning)"></div><div class="timeline-content"><div class="timeline-title">Lab sample dispatched to IVRI</div><div class="timeline-time">1h 30m ago &middot; Pending</div></div></div>
                <div class="timeline-item"><div class="timeline-dot" style="background:var(--border-default)"></div><div class="timeline-content"><div class="timeline-title" style="color:var(--text-tertiary)">State AH Dept &mdash; pending escalation</div><div class="timeline-time">Awaiting lab confirmation</div></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== LAB ==================== -->
      <div class="view" id="view-lab">
        <div class="page-header">
          <div><div class="page-title">Lab &amp; Sample Referral Management</div><div class="page-subtitle">Track sample collection, dispatch, testing and results</div></div>
          <div class="page-header-actions"><button class="btn btn-primary btn-sm">New Sample Request</button></div>
        </div>
        <div class="stats-row" style="grid-template-columns:repeat(4,1fr)">
          <div class="stat-cell"><div class="stat-label">Pending Collection</div><div class="stat-value">5</div><div class="stat-delta up">2 urgent</div></div>
          <div class="stat-cell"><div class="stat-label">In Transit</div><div class="stat-value">8</div><div class="stat-delta">Avg. 1.2 days</div></div>
          <div class="stat-cell"><div class="stat-label">Under Testing</div><div class="stat-value">6</div><div class="stat-delta">3 labs</div></div>
          <div class="stat-cell"><div class="stat-label">Results Ready</div><div class="stat-value" style="color:var(--success)">4</div><div class="stat-delta down">TAT improved</div></div>
        </div>
        <div class="section">
          <div class="section-header"><div class="section-title">Sample Tracker</div></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Sample ID</th><th>Animal / Herd</th><th>Suspected Disease</th><th>Lab</th><th>Collected</th><th>Progress</th><th>Result</th><th></th></tr></thead>
              <tbody>
                <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">SMP-8821</code></td><td>Cattle herd, Babina</td><td>Haemorrhagic Septicaemia</td><td>IVRI Bareilly</td><td style="font-size:.75rem">1 Sep 2024</td><td><div><div style="font-size:.7rem;color:var(--text-tertiary);margin-bottom:3px">In Transit</div><div class="progress-bar" style="width:110px"><div class="progress-fill" style="width:40%;background:var(--warning)"></div></div></div></td><td style="color:var(--text-tertiary)">Pending</td><td><button class="btn btn-secondary btn-sm">Track</button></td></tr>
                <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">SMP-8817</code></td><td>Cattle, Moth Block</td><td>Foot &amp; Mouth Disease</td><td>NRC-FMD, Bhopal</td><td style="font-size:.75rem">31 Aug 2024</td><td><div><div style="font-size:.7rem;color:var(--text-tertiary);margin-bottom:3px">Under Testing</div><div class="progress-bar" style="width:110px"><div class="progress-fill" style="width:70%;background:var(--info)"></div></div></div></td><td style="color:var(--text-tertiary)">Pending</td><td><button class="btn btn-secondary btn-sm">Track</button></td></tr>
                <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">SMP-8809</code></td><td>Goat flock, Gursarai</td><td>PPR</td><td>ICAR-NIVEDI</td><td style="font-size:.75rem">28 Aug 2024</td><td><div><div style="font-size:.7rem;color:var(--success);margin-bottom:3px">Completed</div><div class="progress-bar" style="width:110px"><div class="progress-fill" style="width:100%;background:var(--success)"></div></div></div></td><td><span class="badge badge-danger">PPR Confirmed</span></td><td><button class="btn btn-primary btn-sm">View Report</button></td></tr>
                <tr><td><code style="font-size:.75rem;color:var(--text-tertiary)">SMP-8804</code></td><td>Cattle, Chirgaon</td><td>Brucellosis</td><td>State Vet Lab, Lucknow</td><td style="font-size:.75rem">27 Aug 2024</td><td><div><div style="font-size:.7rem;color:var(--success);margin-bottom:3px">Completed</div><div class="progress-bar" style="width:110px"><div class="progress-fill" style="width:100%;background:var(--success)"></div></div></div></td><td><span class="badge badge-success">Negative</span></td><td><button class="btn btn-secondary btn-sm">View Report</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==================== VACCINATION ==================== -->
      <div class="view" id="view-vaccination">
        <div class="page-header">
          <div><div class="page-title">Vaccination Drive Tracker</div><div class="page-subtitle">FMD Round 2024 &mdash; Jhansi District coverage and progress</div></div>
          <div class="page-header-actions"><button class="btn btn-secondary btn-sm">Export Report</button><button class="btn btn-primary btn-sm">Schedule Camp</button></div>
        </div>
        <div class="stats-row" style="grid-template-columns:repeat(4,1fr)">
          <div class="stat-cell"><div class="stat-label">Target Animals</div><div class="stat-value">18,420</div></div>
          <div class="stat-cell"><div class="stat-label">Vaccinated</div><div class="stat-value" style="color:var(--success)">12,877</div><div class="stat-delta down">70% of target</div></div>
          <div class="stat-cell"><div class="stat-label">Remaining</div><div class="stat-value" style="color:var(--warning)">5,543</div></div>
          <div class="stat-cell"><div class="stat-label">Camps Conducted</div><div class="stat-value">47</div><div class="stat-delta">12 scheduled</div></div>
        </div>
        <div class="grid-2" style="gap:16px">
          <div class="section">
            <div class="section-header"><div class="section-title">Coverage by Block</div></div>
            <div class="section-body"><div style="height:220px"><canvas id="vacc-chart"></canvas></div></div>
          </div>
          <div class="section">
            <div class="section-header"><div class="section-title">Upcoming Vaccination Camps</div></div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Village</th><th>Block</th><th>Target</th><th>Para-vet</th></tr></thead>
                <tbody>
                  <tr><td style="font-weight:600;color:var(--brand-primary)">5 Sep</td><td>Kanchanpur</td><td>Mauranipur</td><td>120</td><td>Raju Singh</td></tr>
                  <tr><td>6 Sep</td><td>Baragaon</td><td>Moth</td><td>85</td><td>Anita Verma</td></tr>
                  <tr><td>7 Sep</td><td>Sumerpur</td><td>Chirgaon</td><td>200</td><td>Mukesh Pal</td></tr>
                  <tr><td>8 Sep</td><td>Niwari</td><td>Mauranipur</td><td>150</td><td>Sunita Singh</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== SETTINGS ==================== -->
      <div class="view" id="view-settings">
        <div class="page-header">
          <div><div class="page-title">Settings</div><div class="page-subtitle">Manage your account, notifications, and system configuration</div></div>
        </div>
        <div class="grid-2-1" style="gap:16px">
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="section">
              <div class="section-header"><div class="section-title">User Profile</div></div>
              <div class="section-body">
                <div class="form-grid form-grid-2">
                  <div class="form-field"><label class="form-label">Full Name</label><input type="text" class="form-input" value="Dr. Deepak Kumar" /></div>
                  <div class="form-field"><label class="form-label">Designation</label><input type="text" class="form-input" value="District Animal Husbandry Officer" /></div>
                  <div class="form-field"><label class="form-label">Mobile</label><input type="tel" class="form-input" value="+91 94151 XXXXX" /></div>
                  <div class="form-field"><label class="form-label">Employee ID</label><input type="text" class="form-input" value="UP-DAHO-2019-0142" readonly style="background:var(--bg-base)" /></div>
                  <div class="form-field" style="grid-column:1/-1"><button class="btn btn-primary">Save Changes</button></div>
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="section">
              <div class="section-header"><div class="section-title">System Info</div></div>
              <div class="section-body">
                <div style="display:flex;flex-direction:column">
                  <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle)"><span style="font-size:.8125rem;color:var(--text-secondary)">Platform</span><span style="font-size:.8125rem;font-weight:600">PashuRaksha 2.4.1</span></div>
                  <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle)"><span style="font-size:.8125rem;color:var(--text-secondary)">Last synced</span><span style="font-size:.8125rem;font-weight:600">4 min ago</span></div>
                  <div style="display:flex;justify-content:space-between;padding:8px 0"><span style="font-size:.8125rem;color:var(--text-secondary)">Jurisdiction</span><span style="font-size:.8125rem;font-weight:600">Jhansi, UP</span></div>
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-header"><div class="section-title">Offline Mode</div></div>
              <div class="section-body"><p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:12px;line-height:1.6">Download data for offline use. Reports filed offline sync automatically when connectivity is restored.</p><button class="btn btn-secondary" style="width:100%">Download District Data</button></div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</div>

<script src="app.js"></script>
</body>
</html>"""

with open(r'K:\sih software\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("HTML written successfully")
