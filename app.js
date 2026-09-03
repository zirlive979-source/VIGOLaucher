// VIGOLauncher UI Controller
const { ipcRenderer } = require('electron');

// App State
const state = {
  currentPage: 'home',
  user: null,
  profiles: [],
  activeProfile: null,
  installedVersions: [],
  availableVersions: [],
  settings: null,
  language: null,
  theme: null,
  downloads: [],
  mods: [],
  modpacks: [],
  servers: [],
  news: []
};

// Navigation items
const navItems = [
  { id: 'home', label: 'Beranda', icon: 'home', section: 'Utama' },
  { id: 'versions', label: 'Versi', icon: 'layers', section: 'Utama' },
  { id: 'mods', label: 'Mod', icon: 'package', section: 'Modding' },
  { id: 'modpacks', label: 'Modpack', icon: 'briefcase', section: 'Modding' },
  { id: 'resourcepacks', label: 'Resource Pack', icon: 'image', section: 'Modding' },
  { id: 'servers', label: 'Server', icon: 'server', section: 'Main' },
  { id: 'accounts', label: 'Akun', icon: 'user', section: 'Pengaturan' },
  { id: 'profiles', label: 'Profil', icon: 'users', section: 'Pengaturan' },
  { id: 'settings', label: 'Pengaturan', icon: 'settings', section: 'Pengaturan' },
  { id: 'console', label: 'Konsol', icon: 'terminal', section: 'Alat' },
  { id: 'downloads', label: 'Download', icon: 'download', section: 'Alat' }
];

// SVG Icons
const icons = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  package: '<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
};

function getIcon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ''}</svg>`;
}

// Initialize
async function init() {
  try {
    // Load app info
    const appInfo = await ipcRenderer.invoke('app:getInfo');
    document.getElementById('app-version').textContent = `v${appInfo.version}`;

    // Load theme
    state.theme = await ipcRenderer.invoke('theme:getCurrent');
    applyTheme(state.theme);

    // Load language
    state.language = await ipcRenderer.invoke('lang:getCurrent');

    // Load settings
    state.settings = await ipcRenderer.invoke('settings:getAll');

    // Load user
    state.user = await ipcRenderer.invoke('auth:getCurrentUser');
    updateUserDisplay();

    // Load profiles
    state.profiles = await ipcRenderer.invoke('profiles:getAll');
    state.activeProfile = await ipcRenderer.invoke('profiles:getActive');

    // Load versions
    state.installedVersions = await ipcRenderer.invoke('versions:getInstalled');

    // Render navigation
    renderNavigation();

    // Render initial page
    navigateTo('home');

    // Setup IPC listeners
    setupIpcListeners();

    // Load news
    loadNews();

    console.log('VIGOLauncher UI initialized');
  } catch (error) {
    console.error('Failed to initialize:', error);
    showToast('Gagal memuat launcher', 'error');
  }
}

function applyTheme(theme) {
  const styleEl = document.getElementById('theme-variables');
  if (theme && theme.variables) {
    const css = Object.entries(theme.variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
    styleEl.textContent = `:root {\n${css}\n}`;
  }
}

function renderNavigation() {
  const navMenu = document.getElementById('nav-menu');
  let html = '';
  let currentSection = '';

  for (const item of navItems) {
    if (item.section !== currentSection) {
      if (currentSection) html += '</div>';
      currentSection = item.section;
      html += `<div class="nav-section">${currentSection}</div>`;
    }
    
    html += `
      <div class="nav-item ${state.currentPage === item.id ? 'active' : ''}" onclick="navigateTo('${item.id}')">
        ${getIcon(item.icon)}
        <span>${item.label}</span>
      </div>
    `;
  }

  navMenu.innerHTML = html;
}

function navigateTo(pageId) {
  state.currentPage = pageId;
  renderNavigation();
  updateBreadcrumb(pageId);
  
  const content = document.getElementById('page-content');
  
  switch(pageId) {
    case 'home':
      renderHomePage();
      break;
    case 'versions':
      renderVersionsPage();
      break;
    case 'mods':
      renderModsPage();
      break;
    case 'modpacks':
      renderModpacksPage();
      break;
    case 'resourcepacks':
      renderResourcePacksPage();
      break;
    case 'servers':
      renderServersPage();
      break;
    case 'accounts':
      renderAccountsPage();
      break;
    case 'profiles':
      renderProfilesPage();
      break;
    case 'settings':
      renderSettingsPage();
      break;
    case 'console':
      renderConsolePage();
      break;
    case 'downloads':
      renderDownloadsPage();
      break;
    default:
      renderHomePage();
  }
}

function updateBreadcrumb(pageId) {
  const item = navItems.find(n => n.id === pageId);
  document.getElementById('breadcrumb').innerHTML = `<span>${item ? item.label : 'Beranda'}</span>`;
}

// ============ HOME PAGE ============
async function renderHomePage() {
  const content = document.getElementById('page-content');
  
  const diskUsage = await ipcRenderer.invoke('disk:usage');
  const ramPercent = Math.round((state.settings.ram.allocation / (diskUsage.memory.total / (1024 * 1024))) * 100);

  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Selamat datang di VIGOLauncher</h2>
      </div>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        Launcher Minecraft Java Edition lengkap dengan dukungan Forge, Fabric, dan NeoForge
      </p>
      
      <div class="version-selector">
        <select class="version-select" id="home-version-select">
          <option value="">Pilih versi Minecraft...</option>
          ${state.installedVersions.map(v => `
            <option value="${v.id}" ${state.activeProfile?.version === v.id ? 'selected' : ''}>
              ${v.id} ${v.loader !== 'Vanilla' ? `(${v.loader})` : ''}
            </option>
          `).join('')}
        </select>
        <button class="btn btn-secondary" onclick="navigateTo('versions')">Kelola Versi</button>
      </div>
      
      <button class="play-button" onclick="launchGame()" id="play-btn">
        ${getIcon('play')}
        <span>MAINKAN MINECRAFT</span>
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Versi Terpasang</div>
        <div class="stat-value">${state.installedVersions.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Alokasi RAM</div>
        <div class="stat-value">${state.settings.ram.allocation} MB</div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width: ${ramPercent}%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Penggunaan Memori</div>
        <div class="stat-value">${diskUsage.memory.usedPercent}%</div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width: ${diskUsage.memory.usedPercent}%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Data Launcher</div>
        <div class="stat-value">${formatBytes(diskUsage.launcher.total)}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Berita Minecraft Terbaru</h3>
        <button class="btn btn-sm btn-secondary" onclick="loadNews()">${getIcon('refresh')} Segarkan</button>
      </div>
      <div class="news-grid" id="news-grid">
        <div class="empty-state">
          <div class="empty-state-icon">📰</div>
          <p>Memuat berita...</p>
        </div>
      </div>
    </div>
  `;
}

async function launchGame() {
  const versionSelect = document.getElementById('home-version-select');
  const version = versionSelect.value;
  
  if (!version) {
    showToast('Silakan pilih versi terlebih dahulu', 'warning');
    return;
  }

  if (!state.user) {
    showToast('Silakan login terlebih dahulu', 'warning');
    navigateTo('accounts');
    return;
  }

  const btn = document.getElementById('play-btn');
  btn.disabled = true;
  btn.innerHTML = '<span>Menjalankan...</span>';

  try {
    const result = await ipcRenderer.invoke('launch:start', { version });
    showToast('Minecraft berhasil dijalankan!', 'success');
    toggleConsole(true);
  } catch (error) {
    showToast(`Gagal menjalankan: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${getIcon('play')}<span>MAINKAN MINECRAFT</span>`;
  }
}

async function loadNews() {
  try {
    state.news = await ipcRenderer.invoke('news:getLatest');
    renderNews();
  } catch (e) {
    console.error('Failed to load news:', e);
  }
}

function renderNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  if (state.news.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📰</div>
        <p>Tidak ada berita</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.news.slice(0, 6).map(news => `
    <div class="news-card" onclick="openExternal('${news.link}')">
      <div class="news-image">${news.image ? `<img src="${news.image}" style="width:100%;height:100%;object-fit:cover;">` : '📰'}</div>
      <div class="news-content">
        <div class="news-title">${news.title}</div>
        <div class="news-date">${news.date ? new Date(news.date).toLocaleDateString('id-ID') : ''}</div>
      </div>
    </div>
  `).join('');
}

// ============ VERSIONS PAGE ============
async function renderVersionsPage() {
  const content = document.getElementById('page-content');
  
  try {
    state.availableVersions = await ipcRenderer.invoke('versions:getAvailable');
    const snapshots = await ipcRenderer.invoke('versions:getSnapshots');
    const favorites = await ipcRenderer.invoke('versions:getFavorites');

    content.innerHTML = `
      <div class="card">
        <div class="tabs">
          <button class="tab active" onclick="switchVersionTab('installed', this)">Terpasang (${state.installedVersions.length})</button>
          <button class="tab" onclick="switchVersionTab('available', this)">Tersedia (${state.availableVersions.length})</button>
          <button class="tab" onclick="switchVersionTab('snapshots', this)">Snapshot (${snapshots.length})</button>
          <button class="tab" onclick="switchVersionTab('loaders', this)">Mod Loaders</button>
        </div>
        
        <div id="versions-list">
          ${renderVersionList(state.installedVersions, 'installed')}
        </div>
      </div>
    `;

    // Store for tab switching
    window._versionData = { installed: state.installedVersions, available: state.availableVersions, snapshots };
  } catch (e) {
    content.innerHTML = `<p>Gagal memuat versi: ${e.message}</p>`;
  }
}

function switchVersionTab(tab, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const list = document.getElementById('versions-list');
  const data = window._versionData[tab] || [];
  
  if (tab === 'loaders') {
    list.innerHTML = renderLoadersTab();
  } else {
    list.innerHTML = renderVersionList(data, tab);
  }
}

function renderVersionList(versions, type) {
  if (versions.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p>${type === 'installed' ? 'Belum ada versi yang terpasang' : 'Tidak ada versi tersedia'}</p>
        ${type === 'installed' ? '<button class="btn btn-primary mt-4" onclick="switchVersionTab(\'available\', document.querySelectorAll(\'.tab\')[1])">Lihat Versi Tersedia</button>' : ''}
      </div>
    `;
  }

  return versions.slice(0, 30).map(v => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-title">
          ${v.id}
          ${v.loader && v.loader !== 'Vanilla' ? `<span class="badge badge-info">${v.loader}</span>` : ''}
          ${v.type === 'snapshot' ? `<span class="badge badge-warning">Snapshot</span>` : ''}
        </div>
        <div class="list-item-subtitle">${v.releaseTime ? new Date(v.releaseTime).toLocaleDateString('id-ID') : ''}</div>
      </div>
      <div class="list-item-actions">
        ${type === 'available' || type === 'snapshots' ? `
          <button class="btn btn-sm btn-primary" onclick="installVersion('${v.id}')">Pasang</button>
        ` : `
          <button class="btn btn-sm btn-success" onclick="launchFromVersion('${v.id}')">Mainkan</button>
          <button class="btn btn-sm btn-secondary" onclick="repairVersion('${v.id}')">Perbaiki</button>
        `}
      </div>
    </div>
  `).join('');
}

function renderLoadersTab() {
  const recentVersions = state.availableVersions.slice(0, 5);
  
  return `
    <div class="form-row">
      <div class="card" style="margin: 0;">
        <h3 style="margin-bottom: 12px; color: var(--success);">Forge</h3>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">Mod loader paling populer dan stabil</p>
        <select class="form-select" id="forge-version" style="margin-bottom: 12px;">
          ${recentVersions.map(v => `<option value="${v.id}">${v.id}</option>`).join('')}
        </select>
        <button class="btn btn-sm btn-success" style="width: 100%;" onclick="installLoader('forge')">Pasang Forge</button>
      </div>
      
      <div class="card" style="margin: 0;">
        <h3 style="margin-bottom: 12px; color: #4fc3f7;">Fabric</h3>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">Ringan dan modern untuk snapshot</p>
        <select class="form-select" id="fabric-version" style="margin-bottom: 12px;">
          ${recentVersions.map(v => `<option value="${v.id}">${v.id}</option>`).join('')}
        </select>
        <button class="btn btn-sm btn-secondary" style="width: 100%; background: #4fc3f7;" onclick="installLoader('fabric')">Pasang Fabric</button>
      </div>
    </div>
    
    <div class="card" style="margin-top: 16px;">
      <h3 style="margin-bottom: 12px; color: var(--warning);">NeoForge</h3>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">Fork modern dari Forge untuk versi terbaru</p>
      <select class="form-select" id="neoforge-version" style="margin-bottom: 12px; max-width: 300px;">
        ${recentVersions.map(v => `<option value="${v.id}">${v.id}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-warning" onclick="installLoader('neoforge')">Pasang NeoForge</button>
    </div>
  `;
}

async function installVersion(versionId) {
  showToast(`Memasang ${versionId}...`, 'info');
  try {
    await ipcRenderer.invoke('versions:install', versionId);
    showToast(`${versionId} berhasil dipasang!`, 'success');
    state.installedVersions = await ipcRenderer.invoke('versions:getInstalled');
    renderVersionsPage();
  } catch (e) {
    showToast(`Gagal memasang: ${e.message}`, 'error');
  }
}

async function installLoader(type) {
  const selectId = `${type}-version`;
  const select = document.getElementById(selectId);
  if (!select) return;
  
  const mcVersion = select.value;
  showToast(`Memasang ${type} untuk ${mcVersion}...`, 'info');
  
  try {
    let result;
    if (type === 'forge') {
      result = await ipcRenderer.invoke('versions:installForge', mcVersion);
    } else if (type === 'fabric') {
      result = await ipcRenderer.invoke('versions:installFabric', mcVersion);
    } else if (type === 'neoforge') {
      result = await ipcRenderer.invoke('versions:installNeoForge', mcVersion);
    }
    
    showToast(`${type} berhasil dipasang!`, 'success');
    state.installedVersions = await ipcRenderer.invoke('versions:getInstalled');
  } catch (e) {
    showToast(`Gagal memasang: ${e.message}`, 'error');
  }
}

async function launchFromVersion(versionId) {
  if (!state.user) {
    showToast('Silakan login terlebih dahulu', 'warning');
    navigateTo('accounts');
    return;
  }
  
  try {
    await ipcRenderer.invoke('launch:start', { version: versionId });
    showToast('Menjalankan Minecraft...', 'success');
    toggleConsole(true);
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

async function repairVersion(versionId) {
  showToast(`Memeriksa ${versionId}...`, 'info');
  try {
    const report = await ipcRenderer.invoke('repair:installation', versionId);
    if (report.issuesFound.length > 0) {
      showToast(`Diperbaiki: ${report.issuesFound.length} masalah`, 'success');
    } else {
      showToast('Tidak ada masalah ditemukan', 'info');
    }
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

// ============ MODS PAGE ============
async function renderModsPage() {
  const content = document.getElementById('page-content');
  
  try {
    state.mods = await ipcRenderer.invoke('mods:getAll', state.activeProfile?.id);
    
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Manajer Mod - ${state.activeProfile?.name || 'Default'}</h3>
          <button class="btn btn-primary" onclick="installMod()">${getIcon('plus')} Pasang Mod</button>
        </div>
        
        ${state.mods.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <p>Belum ada mod yang terpasang</p>
            <button class="btn btn-primary mt-4" onclick="installMod()">Pasang Mod Pertama</button>
          </div>
        ` : `
          ${state.mods.map(mod => `
            <div class="list-item">
              <div class="list-item-info">
                <div class="list-item-title">
                  ${mod.name}
                  ${mod.loader ? `<span class="badge badge-info">${mod.loader}</span>` : ''}
                  ${!mod.enabled ? '<span class="badge badge-error">Nonaktif</span>' : ''}
                </div>
                <div class="list-item-subtitle">v${mod.version} | ${formatBytes(mod.size)}</div>
              </div>
              <div class="list-item-actions">
                <button class="btn btn-sm ${mod.enabled ? 'btn-secondary' : 'btn-success'}" onclick="toggleMod('${mod.id}', ${!mod.enabled})">
                  ${mod.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="removeMod('${mod.id}')">Hapus</button>
              </div>
            </div>
          `).join('')}
        `}
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<p>Gagal memuat mod: ${e.message}</p>`;
  }
}

async function installMod() {
  try {
    const result = await ipcRenderer.invoke('dialog:openFile', [
      { name: 'Mod Files', extensions: ['jar'] }
    ]);
    
    if (!result.canceled && result.filePaths.length > 0) {
      showToast('Memasang mod...', 'info');
      await ipcRenderer.invoke('mods:install', result.filePaths[0], state.activeProfile?.id);
      showToast('Mod berhasil dipasang!', 'success');
      renderModsPage();
    }
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

async function toggleMod(modId, enabled) {
  await ipcRenderer.invoke('mods:toggle', modId, enabled, state.activeProfile?.id);
  renderModsPage();
}

async function removeMod(modId) {
  if (confirm('Yakin ingin menghapus mod ini?')) {
    await ipcRenderer.invoke('mods:remove', modId, state.activeProfile?.id);
    showToast('Mod dihapus', 'success');
    renderModsPage();
  }
}

// ============ MODPACKS PAGE ============
async function renderModpacksPage() {
  const content = document.getElementById('page-content');
  
  try {
    state.modpacks = await ipcRenderer.invoke('modpacks:getAll');
    
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Manajer Modpack</h3>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" onclick="importModpack()">${getIcon('download')} Impor</button>
            <button class="btn btn-primary" onclick="createModpack()">${getIcon('plus')} Buat Baru</button>
          </div>
        </div>
        
        ${state.modpacks.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🎒</div>
            <p>Belum ada modpack</p>
            <p style="font-size: 13px; margin-top: 8px;">Impor modpack (.zip) atau buat yang baru</p>
          </div>
        ` : `
          ${state.modpacks.map(pack => `
            <div class="list-item">
              <div class="list-item-info">
                <div class="list-item-title">${pack.name}</div>
                <div class="list-item-subtitle">v${pack.version} | MC ${pack.mcVersion} | ${pack.loader} | ${pack.mods?.length || 0} mods</div>
              </div>
              <div class="list-item-actions">
                <button class="btn btn-sm btn-success" onclick="applyModpack('${pack.id}')">Terapkan</button>
                <button class="btn btn-sm btn-secondary" onclick="exportModpack('${pack.id}')">Ekspor</button>
                <button class="btn btn-sm btn-danger" onclick="deleteModpack('${pack.id}')">Hapus</button>
              </div>
            </div>
          `).join('')}
        `}
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<p>Gagal memuat modpack: ${e.message}</p>`;
  }
}

async function importModpack() {
  try {
    const result = await ipcRenderer.invoke('dialog:openFile', [
      { name: 'Modpack Files', extensions: ['zip', 'json', 'mrpack'] }
    ]);
    
    if (!result.canceled && result.filePaths.length > 0) {
      showToast('Mengimpor modpack...', 'info');
      await ipcRenderer.invoke('modpacks:import', result.filePaths[0]);
      showToast('Modpack berhasil diimpor!', 'success');
      renderModpacksPage();
    }
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

async function applyModpack(modpackId) {
  try {
    await ipcRenderer.invoke('modpacks:apply', modpackId, state.activeProfile?.id);
    showToast('Modpack diterapkan!', 'success');
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

async function exportModpack(modpackId) {
  try {
    const result = await ipcRenderer.invoke('dialog:saveFile', [
      { name: 'Modpack', extensions: ['zip'] }
    ], 'modpack.zip');
    
    if (!result.canceled) {
      await ipcRenderer.invoke('modpacks:export', modpackId, result.filePath);
      showToast('Modpack diekspor!', 'success');
    }
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

async function deleteModpack(modpackId) {
  if (confirm('Yakin ingin menghapus modpack ini?')) {
    await ipcRenderer.invoke('modpacks:delete', modpackId);
    showToast('Modpack dihapus', 'success');
    renderModpacksPage();
  }
}

function createModpack() {
  showModal('Buat Modpack Baru', `
    <div class="form-group">
      <label class="form-label">Nama Modpack</label>
      <input class="form-input" id="new-modpack-name" placeholder="Masukkan nama modpack...">
    </div>
    <div class="form-group">
      <label class="form-label">Versi Minecraft</label>
      <input class="form-input" id="new-modpack-mcversion" placeholder="contoh: 1.20.4">
    </div>
  `, [
    { text: 'Batal', class: 'btn-secondary', action: closeModal },
    { text: 'Buat', class: 'btn-primary', action: () => {
      showToast('Modpack dibuat (fitur lengkap akan datang)', 'info');
      closeModal();
    }}
  ]);
}

// ============ RESOURCE PACKS PAGE ============
async function renderResourcePacksPage() {
  const content = document.getElementById('page-content');
  
  try {
    const packs = await ipcRenderer.invoke('resourcepacks:getAll', state.activeProfile?.id);
    
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Resource Pack Manager</h3>
          <button class="btn btn-primary" onclick="installResourcePack()">${getIcon('plus')} Pasang Resource Pack</button>
        </div>
        
        ${packs.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🎨</div>
            <p>Belum ada resource pack</p>
          </div>
        ` : `
          ${packs.map(pack => `
            <div class="list-item">
              <div class="list-item-info">
                <div class="list-item-title">${pack.name}</div>
                <div class="list-item-subtitle">Format: ${pack.format} | ${formatBytes(pack.size)}</div>
              </div>
              <div class="list-item-actions">
                <button class="btn btn-sm btn-danger" onclick="removeResourcePack('${pack.id}')">Hapus</button>
              </div>
            </div>
          `).join('')}
        `}
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<p>Gagal memuat: ${e.message}</p>`;
  }
}

async function installResourcePack() {
  try {
    const result = await ipcRenderer.invoke('dialog:openFile', [
      { name: 'Resource Pack', extensions: ['zip'] }
    ]);
    
    if (!result.canceled && result.filePaths.length > 0) {
      await ipcRenderer.invoke('resourcepacks:install', result.filePaths[0], state.activeProfile?.id);
      showToast('Resource pack dipasang!', 'success');
      renderResourcePacksPage();
    }
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

async function removeResourcePack(packId) {
  if (confirm('Hapus resource pack ini?')) {
    await ipcRenderer.invoke('resourcepacks:remove', packId, state.activeProfile?.id);
    renderResourcePacksPage();
  }
}

// ============ SERVERS PAGE ============
async function renderServersPage() {
  const content = document.getElementById('page-content');
  
  try {
    state.servers = await ipcRenderer.invoke('servers:getAll');
    
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar Server Favorit</h3>
          <button class="btn btn-primary" onclick="showAddServerModal()">${getIcon('plus')} Tambah Server</button>
        </div>
        
        ${state.servers.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🖥️</div>
            <p>Belum ada server yang disimpan</p>
          </div>
        ` : `
          ${state.servers.map(server => `
            <div class="list-item">
              <div class="list-item-info">
                <div class="list-item-title">${server.name}</div>
                <div class="list-item-subtitle">${server.address}:${server.port}</div>
              </div>
              <div class="list-item-actions">
                <button class="btn btn-sm btn-success" onclick="joinServer('${server.id}')">Masuk</button>
                <button class="btn btn-sm btn-danger" onclick="removeServer('${server.id}')">Hapus</button>
              </div>
            </div>
          `).join('')}
        `}
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<p>Gagal memuat: ${e.message}</p>`;
  }
}

function showAddServerModal() {
  showModal('Tambah Server', `
    <div class="form-group">
      <label class="form-label">Nama Server</label>
      <input class="form-input" id="server-name" placeholder="contoh: Server Saya">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Alamat IP</label>
        <input class="form-input" id="server-address" placeholder="contoh: play.example.com">
      </div>
      <div class="form-group">
        <label class="form-label">Port</label>
        <input class="form-input" id="server-port" value="25565" type="number">
      </div>
    </div>
  `, [
    { text: 'Batal', class: 'btn-secondary', action: closeModal },
    { text: 'Simpan', class: 'btn-primary', action: async () => {
      const name = document.getElementById('server-name').value;
      const address = document.getElementById('server-address').value;
      const port = parseInt(document.getElementById('server-port').value);
      
      if (!name || !address) {
        showToast('Isi semua field', 'warning');
        return;
      }
      
      await ipcRenderer.invoke('servers:add', { name, address, port });
      showToast('Server ditambahkan!', 'success');
      closeModal();
      renderServersPage();
    }}
  ]);
}

async function joinServer(serverId) {
  const server = state.servers.find(s => s.id === serverId);
  if (!server) return;
  
  if (!state.user) {
    showToast('Silakan login terlebih dahulu', 'warning');
    navigateTo('accounts');
    return;
  }
  
  try {
    const address = server.port === 25565 ? server.address : `${server.address}:${server.port}`;
    await ipcRenderer.invoke('launch:start', { 
      version: state.activeProfile?.version,
      serverAddress: address 
    });
    showToast(`Masuk ke ${server.name}...`, 'success');
    toggleConsole(true);
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

async function removeServer(serverId) {
  if (confirm('Hapus server ini dari daftar?')) {
    await ipcRenderer.invoke('servers:remove', serverId);
    renderServersPage();
  }
}

// ============ ACCOUNTS PAGE ============
async function renderAccountsPage() {
  const content = document.getElementById('page-content');
  
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Manajemen Akun</h3>
      </div>
      
      ${state.user ? `
        <div style="display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--bg-tertiary); border-radius: var(--radius); margin-bottom: 20px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold;">
            ${state.user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style="margin-bottom: 4px;">${state.user.username}</h2>
            <p style="color: var(--text-muted); font-size: 13px;">UUID: ${state.user.uuid}</p>
            <span class="badge ${state.user.type === 'microsoft' ? 'badge-success' : 'badge-warning'}">
              ${state.user.type === 'microsoft' ? 'Akun Microsoft' : 'Mode Offline'}
            </span>
          </div>
        </div>
        
        <button class="btn btn-danger" onclick="logout()">Keluar dari Akun</button>
      ` : `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="card" style="margin: 0; text-align: center; padding: 30px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
            <h3 style="margin-bottom: 8px;">Login Microsoft</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Login resmi untuk bermain di server online</p>
            <button class="btn btn-primary" onclick="loginMicrosoft()">Login dengan Microsoft</button>
          </div>
          
          <div class="card" style="margin: 0; text-align: center; padding: 30px;">
            <div style="font-size: 48px; margin-bottom: 16px;">👤</div>
            <h3 style="margin-bottom: 8px;">Mode Offline</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Main single player tanpa login</p>
            <button class="btn btn-secondary" onclick="showOfflineLogin()">Gunakan Mode Offline</button>
          </div>
        </div>
      `}
    </div>
  `;
}

async function loginMicrosoft() {
  showToast('Membuka halaman login Microsoft...', 'info');
  try {
    const user = await ipcRenderer.invoke('auth:loginMicrosoft');
    state.user = user;
    updateUserDisplay();
    showToast(`Selamat datang, ${user.username}!`, 'success');
    renderAccountsPage();
  } catch (e) {
    showToast(`Login gagal: ${e.message}`, 'error');
  }
}

function showOfflineLogin() {
  showModal('Mode Offline', `
    <div class="form-group">
      <label class="form-label">Nama Pengguna</label>
      <input class="form-input" id="offline-username" placeholder="Masukkan nama pengguna..." maxlength="16">
      <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Minimal 3 karakter</p>
    </div>
  `, [
    { text: 'Batal', class: 'btn-secondary', action: closeModal },
    { text: 'Masuk', class: 'btn-primary', action: async () => {
      const username = document.getElementById('offline-username').value;
      if (username.length < 3) {
        showToast('Nama pengguna minimal 3 karakter', 'warning');
        return;
      }
      
      try {
        const user = await ipcRenderer.invoke('auth:loginOffline', username);
        state.user = user;
        updateUserDisplay();
        showToast(`Masuk sebagai ${username}`, 'success');
        closeModal();
        renderAccountsPage();
      } catch (e) {
        showToast(e.message, 'error');
      }
    }}
  ]);
}

async function logout() {
  if (confirm('Yakin ingin keluar?')) {
    await ipcRenderer.invoke('auth:logout');
    state.user = null;
    updateUserDisplay();
    showToast('Berhasil keluar', 'info');
    renderAccountsPage();
  }
}

function updateUserDisplay() {
  const avatar = document.getElementById('user-avatar');
  const username = document.getElementById('username');
  const status = document.getElementById('user-status');
  
  if (state.user) {
    avatar.textContent = state.user.username.charAt(0).toUpperCase();
    avatar.style.background = 'var(--accent)';
    username.textContent = state.user.username;
    status.textContent = state.user.type === 'microsoft' ? 'Online' : 'Offline Mode';
    status.style.color = state.user.type === 'microsoft' ? 'var(--success)' : 'var(--warning)';
  } else {
    avatar.textContent = '?';
    avatar.style.background = '';
    username.textContent = 'Belum Masuk';
    status.textContent = 'Klik untuk login';
    status.style.color = '';
  }
}

// ============ PROFILES PAGE ============
async function renderProfilesPage() {
  const content = document.getElementById('page-content');
  
  try {
    state.profiles = await ipcRenderer.invoke('profiles:getAll');
    state.activeProfile = await ipcRenderer.invoke('profiles:getActive');
    
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Manajer Profil</h3>
          <button class="btn btn-primary" onclick="showCreateProfileModal()">${getIcon('plus')} Buat Profil</button>
        </div>
        
        ${state.profiles.map(profile => `
          <div class="list-item" style="${profile.id === state.activeProfile?.id ? 'border: 2px solid var(--accent);' : ''}">
            <div class="list-item-info">
              <div class="list-item-title">
                ${profile.name}
                ${profile.id === state.activeProfile?.id ? '<span class="badge badge-success">Aktif</span>' : ''}
              </div>
              <div class="list-item-subtitle">Versi: ${profile.version} | Folder: ${profile.gameDirectory}</div>
            </div>
            <div class="list-item-actions">
              ${profile.id !== state.activeProfile?.id ? `
                <button class="btn btn-sm btn-success" onclick="setActiveProfile('${profile.id}')">Aktifkan</button>
              ` : ''}
              <button class="btn btn-sm btn-secondary" onclick="editProfile('${profile.id}')">Edit</button>
              ${state.profiles.length > 1 ? `
                <button class="btn btn-sm btn-danger" onclick="deleteProfile('${profile.id}')">Hapus</button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<p>Gagal memuat: ${e.message}</p>`;
  }
}

function showCreateProfileModal() {
  showModal('Buat Profil Baru', `
    <div class="form-group">
      <label class="form-label">Nama Profil</label>
      <input class="form-input" id="new-profile-name" placeholder="contoh: Modpack Survival">
    </div>
    <div class="form-group">
      <label class="form-label">Versi Default</label>
      <select class="form-select" id="new-profile-version">
        <option value="latest">Latest Release</option>
        ${state.installedVersions.map(v => `<option value="${v.id}">${v.id}</option>`).join('')}
      </select>
    </div>
  `, [
    { text: 'Batal', class: 'btn-secondary', action: closeModal },
    { text: 'Buat', class: 'btn-primary', action: async () => {
      const name = document.getElementById('new-profile-name').value;
      const version = document.getElementById('new-profile-version').value;
      
      if (!name) {
        showToast('Masukkan nama profil', 'warning');
        return;
      }
      
      await ipcRenderer.invoke('profiles:create', { name, version });
      showToast('Profil dibuat!', 'success');
      closeModal();
      renderProfilesPage();
    }}
  ]);
}

async function setActiveProfile(id) {
  await ipcRenderer.invoke('profiles:setActive', id);
  state.activeProfile = await ipcRenderer.invoke('profiles:getActive');
  showToast('Profil diaktifkan', 'success');
  renderProfilesPage();
}

async function deleteProfile(id) {
  if (confirm('Hapus profil ini?')) {
    await ipcRenderer.invoke('profiles:delete', id);
    renderProfilesPage();
  }
}

function editProfile(id) {
  showToast('Fitur edit akan segera hadir', 'info');
}

// ============ SETTINGS PAGE ============
async function renderSettingsPage() {
  state.settings = await ipcRenderer.invoke('settings:getAll');
  const themes = await ipcRenderer.invoke('theme:getAvailable');
  const languages = await ipcRenderer.invoke('lang:getAvailable');
  const javaRuntimes = await ipcRenderer.invoke('java:detect');
  const presets = state.settings.jvmPresets;
  const totalMemoryMB = Math.floor(require('os').totalmem() / (1024 * 1024));

  const content = document.getElementById('page-content');
  
  content.innerHTML = `
    <div class="card">
      <h3 class="card-title" style="margin-bottom: 20px;">Pengaturan Launcher</h3>
      
      <div class="tabs">
        <button class="tab active" onclick="switchSettingsTab('general', this)">Umum</button>
        <button class="tab" onclick="switchSettingsTab('java', this)">Java & RAM</button>
        <button class="tab" onclick="switchSettingsTab('game', this)">Game</button>
        <button class="tab" onclick="switchSettingsTab('appearance', this)">Tampilan</button>
        <button class="tab" onclick="switchSettingsTab('advanced', this)">Lanjutan</button>
      </div>
      
      <div id="settings-content">
        ${renderGeneralSettings(themes, languages)}
      </div>
    </div>
  `;
  
  window._settingsData = { themes, languages, javaRuntimes, presets, totalMemoryMB };
}

function switchSettingsTab(tab, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  const d = window._settingsData;
  const content = document.getElementById('settings-content');
  
  switch(tab) {
    case 'general':
      content.innerHTML = renderGeneralSettings(d.themes, d.languages);
      break;
    case 'java':
      content.innerHTML = renderJavaSettings(d.javaRuntimes, d.presets, d.totalMemoryMB);
      break;
    case 'game':
      content.innerHTML = renderGameSettings();
      break;
    case 'appearance':
      content.innerHTML = renderAppearanceSettings(d.themes, d.languages);
      break;
    case 'advanced':
      content.innerHTML = renderAdvancedSettings();
      break;
  }
}

function renderGeneralSettings(themes, languages) {
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Tema</label>
        <select class="form-select" onchange="changeTheme(this.value)">
          ${themes.map(t => `<option value="${t.id}" ${state.theme?.name === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Bahasa</label>
        <select class="form-select" onchange="changeLanguage(this.value)">
          ${languages.map(l => `<option value="${l.code}" ${state.language?.code === l.code ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">Folder Game Default</label>
      <div style="display: flex; gap: 8px;">
        <input class="form-input" value="${state.settings.game.directory}" readonly>
        <button class="btn btn-secondary" onclick="changeGameDir()">Jelajahi</button>
      </div>
    </div>
    
    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
      <div>
        <label class="form-label" style="margin-bottom: 2px;">Pembaruan Otomatis</label>
        <p style="font-size: 12px; color: var(--text-muted);">Periksa pembaruan launcher secara otomatis</p>
      </div>
      <div class="toggle ${state.settings.launcher.autoUpdate ? 'active' : ''}" onclick="toggleSetting('autoUpdate')"></div>
    </div>
    
    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
      <div>
        <label class="form-label" style="margin-bottom: 2px;">Tutup Launcher Saat Main</label>
        <p style="font-size: 12px; color: var(--text-muted);">Launcher akan menutup otomatis saat Minecraft berjalan</p>
      </div>
      <div class="toggle ${state.settings.launcher.closeOnLaunch ? 'active' : ''}" onclick="toggleSetting('closeOnLaunch')"></div>
    </div>
  `;
}

function renderJavaSettings(javaRuntimes, presets, totalMemoryMB) {
  const maxRam = Math.min(totalMemoryMB, 16384);
  const recommended = Math.min(Math.floor(totalMemoryMB / 4), 8192);
  
  return `
    <div class="form-group">
      <label class="form-label">Alokasi RAM: <strong style="color: var(--accent);">${state.settings.ram.allocation} MB</strong> (${(state.settings.ram.allocation / 1024).toFixed(1)} GB)</label>
      <div class="slider-container">
        <input type="range" class="slider" min="512" max="${maxRam}" step="256" value="${state.settings.ram.allocation}" 
               oninput="updateRamDisplay(this.value)" onchange="saveRamAllocation(this.value)">
        <span class="slider-value" id="ram-display">${state.settings.ram.allocation} MB</span>
      </div>
      <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
        Direkomendasikan: ${recommended} MB | Total RAM: ${(totalMemoryMB / 1024).toFixed(0)} GB
      </p>
    </div>
    
    <div class="form-group">
      <label class="form-label">Java Runtime</label>
      <select class="form-select" id="java-runtime-select" onchange="changeJavaRuntime(this.value)">
        <option value="">Deteksi Otomatis</option>
        ${javaRuntimes.map(r => `<option value="${r.path}">Java ${r.version} (${r.path})</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-secondary" style="margin-top: 8px;" onclick="detectJava()">Deteksi Ulang Java</button>
    </div>
    
    <div class="form-group">
      <label class="form-label">Preset JVM Arguments</label>
      <select class="form-select" onchange="applyJvmPreset(this.value)">
        <option value="">Pilih preset...</option>
        ${Object.entries(presets).map(([key, p]) => `<option value="${key}">${p.name}</option>`).join('')}
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-label">JVM Arguments Kustom</label>
      <textarea class="form-input" id="jvm-args" rows="3" placeholder="-XX:+UseG1GC ...">${state.settings.java.jvmArguments}</textarea>
      <button class="btn btn-sm btn-primary" style="margin-top: 8px;" onclick="saveJvmArgs()">Simpan Argumen</button>
    </div>
  `;
}

function renderGameSettings() {
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Lebar (px)</label>
        <input type="number" class="form-input" id="res-width" value="${state.settings.game.resolution.width}">
      </div>
      <div class="form-group">
        <label class="form-label">Tinggi (px)</label>
        <input type="number" class="form-input" id="res-height" value="${state.settings.game.resolution.height}">
      </div>
    </div>
    
    <button class="btn btn-secondary" style="margin-bottom: 20px;" onclick="saveResolution()">Simpan Resolusi</button>
    
    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
      <div>
        <label class="form-label" style="margin-bottom: 2px;">Mode Layar Penuh</label>
        <p style="font-size: 12px; color: var(--text-muted);">Jalankan Minecraft dalam mode layar penuh</p>
      </div>
      <div class="toggle ${state.settings.game.fullscreen ? 'active' : ''}" onclick="toggleFullscreen()"></div>
    </div>
  `;
}

function renderAppearanceSettings(themes, languages) {
  return `
    <div class="form-group">
      <label class="form-label">Pilih Tema</label>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;">
        ${themes.map(t => `
          <div onclick="changeTheme('${t.id}')" style="padding: 16px; border-radius: 8px; cursor: pointer; border: 2px solid ${state.theme?.name === t.name ? 'var(--accent)' : 'var(--border)'}; background: var(--bg-tertiary);">
            <strong>${t.name}</strong>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">Bahasa</label>
      <select class="form-select" onchange="changeLanguage(this.value)">
        ${languages.map(l => `<option value="${l.code}" ${state.language?.code === l.code ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('')}
      </select>
    </div>
  `;
}

function renderAdvancedSettings() {
  return `
    <div class="form-group">
      <label class="form-label">Backup & Restore</label>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary" onclick="createBackup()">Buat Backup</button>
        <button class="btn btn-secondary" onclick="showBackups()">Lihat Backup</button>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">Perbaikan</label>
      <button class="btn btn-warning" onclick="repairAll()">Perbaiki Semua Instalasi</button>
    </div>
    
    <div class="form-group">
      <label class="form-label">Tentang</label>
      <p style="color: var(--text-secondary); font-size: 13px;">
        VIGOLauncher v1.0.0<br>
        Launcher Minecraft Java Edition open-source<br>
        <br>
        <strong>Arsitektur:</strong> Launcher UI → Launcher Core → Java Runtime → Minecraft
      </p>
    </div>
  `;
}

async function changeTheme(themeId) {
  state.theme = await ipcRenderer.invoke('theme:setTheme', themeId);
  applyTheme(state.theme);
  showToast('Tema diubah', 'success');
}

async function changeLanguage(langCode) {
  state.language = await ipcRenderer.invoke('lang:setLanguage', langCode);
  showToast('Bahasa diubah', 'success');
}

async function changeGameDir() {
  const result = await ipcRenderer.invoke('dialog:openDirectory');
  if (!result.canceled && result.filePaths.length > 0) {
    await ipcRenderer.invoke('settings:setGameDir', result.filePaths[0]);
    state.settings = await ipcRenderer.invoke('settings:getAll');
    renderSettingsPage();
    showToast('Folder game diubah', 'success');
  }
}

async function toggleSetting(key) {
  state.settings.launcher[key] = !state.settings.launcher[key];
  await ipcRenderer.invoke('settings:update', { launcher: state.settings.launcher });
  renderSettingsPage();
}

function updateRamDisplay(value) {
  document.getElementById('ram-display').textContent = `${value} MB`;
}

async function saveRamAllocation(value) {
  await ipcRenderer.invoke('settings:setRam', parseInt(value));
  state.settings = await ipcRenderer.invoke('settings:getAll');
  showToast('RAM disimpan', 'success');
}

async function changeJavaRuntime(path) {
  await ipcRenderer.invoke('java:setActive', path);
  showToast('Java runtime diubah', 'success');
}

async function detectJava() {
  showToast('Mendeteksi Java...', 'info');
  const runtimes = await ipcRenderer.invoke('java:detect');
  showToast(`Ditemukan ${runtimes.length} Java runtime`, 'success');
  renderSettingsPage();
}

async function applyJvmPreset(presetName) {
  if (!presetName) return;
  await ipcRenderer.invoke('settings:applyJvmPreset', presetName);
  state.settings = await ipcRenderer.invoke('settings:getAll');
  renderSettingsPage();
  showToast('Preset diterapkan', 'success');
}

async function saveJvmArgs() {
  const args = document.getElementById('jvm-args').value;
  await ipcRenderer.invoke('settings:setJvmArgs', args);
  showToast('JVM args disimpan', 'success');
}

async function saveResolution() {
  const width = document.getElementById('res-width').value;
  const height = document.getElementById('res-height').value;
  await ipcRenderer.invoke('settings:setResolution', width, height);
  state.settings = await ipcRenderer.invoke('settings:getAll');
  showToast('Resolusi disimpan', 'success');
}

async function toggleFullscreen() {
  state.settings.game.fullscreen = !state.settings.game.fullscreen;
  await ipcRenderer.invoke('settings:setFullscreen', state.settings.game.fullscreen);
  renderSettingsPage();
}

async function createBackup() {
  showToast('Membuat backup...', 'info');
  try {
    await ipcRenderer.invoke('backup:create');
    showToast('Backup berhasil dibuat!', 'success');
  } catch (e) {
    showToast(`Gagal: ${e.message}`, 'error');
  }
}

async function showBackups() {
  const backups = await ipcRenderer.invoke('backup:getAll');
  if (backups.length === 0) {
    showToast('Belum ada backup', 'info');
    return;
  }
  
  showModal('Backup Tersedia', `
    ${backups.map(b => `
      <div class="list-item">
        <div class="list-item-info">
          <div class="list-item-title">${new Date(b.createdAt).toLocaleString('id-ID')}</div>
          <div class="list-item-subtitle">${formatBytes(b.size)}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-sm btn-success" onclick="restoreBackup('${b.id}')">Pulihkan</button>
          <button class="btn btn-sm btn-danger" onclick="deleteBackup('${b.id}')">Hapus</button>
        </div>
      </div>
    `).join('')}
  `, [{ text: 'Tutup', class: 'btn-secondary', action: closeModal }]);
}

async function restoreBackup(id) {
  if (confirm('Pulihkan dari backup ini? Data saat ini akan ditimpa.')) {
    await ipcRenderer.invoke('backup:restore', id);
    showToast('Backup dipulihkan!', 'success');
    closeModal();
  }
}

async function deleteBackup(id) {
  await ipcRenderer.invoke('backup:delete', id);
  showBackups();
}

async function repairAll() {
  showToast('Fitur perbaikan massal akan segera hadir', 'info');
}

// ============ CONSOLE PAGE ============
function renderConsolePage() {
  const content = document.getElementById('page-content');
  
  content.innerHTML = `
    <div class="card" style="height: calc(100vh - 200px); display: flex; flex-direction: column;">
      <div class="card-header">
        <h3 class="card-title">Konsol Game</h3>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-secondary" onclick="clearConsole()">Bersihkan</button>
          <button class="btn btn-sm btn-secondary" onclick="loadCrashLogs()">Crash Logs</button>
        </div>
      </div>
      <div id="console-page-output" style="flex: 1; overflow-y: auto; background: #0d1117; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 12px;">
        <div class="console-line info">[VIGOLauncher] Konsol siap. Log game akan muncul di sini saat Minecraft berjalan.</div>
      </div>
    </div>
  `;
}

function clearConsole() {
  const output = document.getElementById('console-page-output');
  if (output) output.innerHTML = '<div class="console-line info">Konsol dibersihkan.</div>';
}

async function loadCrashLogs() {
  try {
    const logs = await ipcRenderer.invoke('console:getCrashLogs');
    if (logs.length === 0) {
      showToast('Tidak ada crash log', 'info');
      return;
    }
    
    showModal('Crash Logs', `
      ${logs.map(log => `
        <div class="list-item">
          <div class="list-item-info">
            <div class="list-item-title">${log.name}</div>
            <div class="list-item-subtitle">${new Date(log.createdAt).toLocaleString('id-ID')} | ${formatBytes(log.size)}</div>
          </div>
        </div>
      `).join('')}
    `, [{ text: 'Tutup', class: 'btn-secondary', action: closeModal }]);
  } catch (e) {
    showToast('Gagal memuat crash logs', 'error');
  }
}

// ============ DOWNLOADS PAGE ============
function renderDownloadsPage() {
  const content = document.getElementById('page-content');
  
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Download Manager</h3>
      </div>
      
      <div id="downloads-list">
        ${state.downloads.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">⬇️</div>
            <p>Tidak ada download aktif</p>
            <p style="font-size: 13px; margin-top: 8px; color: var(--text-muted);">Download akan muncul di sini saat Anda memasang versi atau mod</p>
          </div>
        ` : state.downloads.map(d => `
          <div class="list-item">
            <div class="list-item-info" style="flex: 1;">
              <div class="list-item-title">${d.name}</div>
              <div class="stat-bar" style="margin-top: 8px;">
                <div class="stat-bar-fill" style="width: ${d.progress}%"></div>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                ${d.progress}% | ${formatBytes(d.downloaded)} / ${formatBytes(d.total)} | ${formatBytes(d.speed)}/s
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============ UTILITY FUNCTIONS ============
function setupIpcListeners() {
  // Download progress
  ipcRenderer.on('download:progress', (event, data) => {
    updateDownloadUI(data);
  });
  
  ipcRenderer.on('download:complete', (event, data) => {
    showToast(`${data.name} selesai diunduh`, 'success');
    const idx = state.downloads.findIndex(d => d.id === data.id);
    if (idx !== -1) state.downloads.splice(idx, 1);
    updateDownloadPanel();
  });
  
  // Console output
  ipcRenderer.on('console:log', (event, data) => {
    addConsoleLine(data);
  });
}

function updateDownloadUI(data) {
  const idx = state.downloads.findIndex(d => d.id === data.id);
  if (idx !== -1) {
    state.downloads[idx] = data;
  } else {
    state.downloads.push(data);
  }
  updateDownloadPanel();
}

function updateDownloadPanel() {
  document.getElementById('download-count').textContent = state.downloads.length;
  
  const content = document.getElementById('download-panel-content');
  content.innerHTML = state.downloads.map(d => `
    <div class="download-item">
      <div class="download-item-name">${d.name}</div>
      <div class="download-progress-bar">
        <div class="download-progress-fill" style="width: ${d.progress}%"></div>
      </div>
      <div class="download-item-info">
        <span>${d.progress}%</span>
        <span>${formatBytes(d.speed)}/s</span>
      </div>
    </div>
  `).join('') || '<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 12px;">Tidak ada download aktif</div>';
}

function toggleDownloadPanel() {
  document.getElementById('download-panel-content').classList.toggle('open');
}

function toggleConsole(force) {
  const panel = document.getElementById('console-panel');
  if (force !== undefined) {
    panel.style.display = force ? 'flex' : 'none';
  } else {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  }
}

function addConsoleLine(data) {
  const output = document.getElementById('console-output');
  const pageOutput = document.getElementById('console-page-output');
  
  const line = `<div class="console-line ${data.level}">[${new Date(data.timestamp).toLocaleTimeString()}] ${data.message}</div>`;
  
  if (output) {
    output.innerHTML += line;
    output.scrollTop = output.scrollHeight;
  }
  if (pageOutput) {
    pageOutput.innerHTML += line;
    pageOutput.scrollTop = pageOutput.scrollHeight;
  }
}

function showModal(title, bodyHtml, buttons) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  
  const footer = document.getElementById('modal-footer');
  footer.innerHTML = (buttons || [{ text: 'Tutup', class: 'btn-secondary', action: closeModal }]).map((btn, i) => `
    <button class="btn ${btn.class}" onclick="window._modalButtons[${i}]()">${btn.text}</button>
  `).join('');
  
  window._modalButtons = buttons.map(b => b.action);
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function openExternal(url) {
  require('electron').shell.openExternal(url);
}

// Event listeners
document.getElementById('btn-refresh')?.addEventListener('click', () => {
  navigateTo(state.currentPage);
});

document.getElementById('btn-settings')?.addEventListener('click', () => {
  navigateTo('settings');
});

document.getElementById('user-profile')?.addEventListener('click', () => {
  navigateTo('accounts');
});

// Close modal on overlay click
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
});

// Initialize app
init();
