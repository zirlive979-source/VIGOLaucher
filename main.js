const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');

// Core modules
const AuthManager = require('./core/auth/AuthManager');
const VersionManager = require('./core/versions/VersionManager');
const VersionInstaller = require('./core/versions/VersionInstaller');
const ModManager = require('./core/mods/ModManager');
const ModpackManager = require('./core/mods/ModpackManager');
const ResourcePackManager = require('./core/mods/ResourcePackManager');
const JavaRuntimeManager = require('./core/runtime/JavaRuntimeManager');
const LauncherCore = require('./core/LauncherCore');
const SettingsManager = require('./core/SettingsManager');
const ProfileManager = require('./core/ProfileManager');
const DownloadManager = require('./core/DownloadManager');
const ConsoleManager = require('./core/ConsoleManager');
const NewsFetcher = require('./core/NewsFetcher');
const ServerManager = require('./core/ServerManager');
const BackupManager = require('./core/BackupManager');
const ThemeManager = require('./core/ThemeManager');
const LanguageManager = require('./core/LanguageManager');
const AutoUpdater = require('./core/AutoUpdater');
const RepairManager = require('./core/RepairManager');
const DiskUsageMonitor = require('./core/DiskUsageMonitor');

let mainWindow;
let launcherCore;
let authManager;
let versionManager;
let versionInstaller;
let modManager;
let modpackManager;
let resourcePackManager;
let javaRuntimeManager;
let settingsManager;
let profileManager;
let downloadManager;
let consoleManager;
let newsFetcher;
let serverManager;
let backupManager;
let themeManager;
let languageManager;
let autoUpdater;
let repairManager;
let diskUsageMonitor;

// Portable mode check
const isPortable = fs.existsSync(path.join(process.cwd(), 'PORTABLE'));
const dataPath = isPortable 
  ? path.join(process.cwd(), 'VIGOLauncher_Data') 
  : path.join(app.getPath('appData'), 'VIGOLauncher');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function initializeManagers() {
  settingsManager = new SettingsManager(dataPath);
  themeManager = new ThemeManager(dataPath);
  languageManager = new LanguageManager(dataPath);
  profileManager = new ProfileManager(dataPath);
  authManager = new AuthManager(dataPath, profileManager);
  javaRuntimeManager = new JavaRuntimeManager();
  downloadManager = new DownloadManager();
  consoleManager = new ConsoleManager();
  versionManager = new VersionManager(dataPath);
  versionInstaller = new VersionInstaller(dataPath, downloadManager);
  modManager = new ModManager(dataPath, profileManager);
  modpackManager = new ModpackManager(dataPath, modManager);
  resourcePackManager = new ResourcePackManager(dataPath, profileManager);
  newsFetcher = new NewsFetcher();
  serverManager = new ServerManager(dataPath);
  backupManager = new BackupManager(dataPath);
  autoUpdater = new AutoUpdater();
  repairManager = new RepairManager(dataPath, versionInstaller);
  diskUsageMonitor = new DiskUsageMonitor(dataPath);

  launcherCore = new LauncherCore({
    authManager,
    versionManager,
    javaRuntimeManager,
    settingsManager,
    profileManager,
    consoleManager,
    dataPath
  });
}

function setupIpcHandlers() {
  // Auth
  ipcMain.handle('auth:loginMicrosoft', () => authManager.loginMicrosoft());
  ipcMain.handle('auth:loginOffline', (e, username) => authManager.loginOffline(username));
  ipcMain.handle('auth:logout', () => authManager.logout());
  ipcMain.handle('auth:getCurrentUser', () => authManager.getCurrentUser());
  ipcMain.handle('auth:isLoggedIn', () => authManager.isLoggedIn());

  // Profiles
  ipcMain.handle('profiles:getAll', () => profileManager.getAllProfiles());
  ipcMain.handle('profiles:getActive', () => profileManager.getActiveProfile());
  ipcMain.handle('profiles:setActive', (e, id) => profileManager.setActiveProfile(id));
  ipcMain.handle('profiles:create', (e, profile) => profileManager.createProfile(profile));
  ipcMain.handle('profiles:update', (e, id, profile) => profileManager.updateProfile(id, profile));
  ipcMain.handle('profiles:delete', (e, id) => profileManager.deleteProfile(id));

  // Versions
  ipcMain.handle('versions:getInstalled', () => versionManager.getInstalledVersions());
  ipcMain.handle('versions:getAvailable', () => versionManager.getAvailableVersions());
  ipcMain.handle('versions:getSnapshots', () => versionManager.getSnapshotVersions());
  ipcMain.handle('versions:install', (e, versionId) => versionInstaller.installVersion(versionId));
  ipcMain.handle('versions:installForge', (e, mcVersion) => versionInstaller.installForge(mcVersion));
  ipcMain.handle('versions:installFabric', (e, mcVersion) => versionInstaller.installFabric(mcVersion));
  ipcMain.handle('versions:installNeoForge', (e, mcVersion) => versionInstaller.installNeoForge(mcVersion));
  ipcMain.handle('versions:setFavorite', (e, versionId, isFavorite) => versionManager.setFavorite(versionId, isFavorite));
  ipcMain.handle('versions:getFavorites', () => versionManager.getFavorites());

  // Launch
  ipcMain.handle('launch:start', (e, options) => launcherCore.launch(options));
  ipcMain.handle('launch:stop', () => launcherCore.stop());

  // Mods
  ipcMain.handle('mods:getAll', (e, profileId) => modManager.getMods(profileId));
  ipcMain.handle('mods:install', (e, filePath, profileId) => modManager.installMod(filePath, profileId));
  ipcMain.handle('mods:remove', (e, modId, profileId) => modManager.removeMod(modId, profileId));
  ipcMain.handle('mods:toggle', (e, modId, enabled, profileId) => modManager.toggleMod(modId, enabled, profileId));

  // Modpacks
  ipcMain.handle('modpacks:getAll', () => modpackManager.getModpacks());
  ipcMain.handle('modpacks:import', (e, filePath) => modpackManager.importModpack(filePath));
  ipcMain.handle('modpacks:export', (e, modpackId, exportPath) => modpackManager.exportModpack(modpackId, exportPath));
  ipcMain.handle('modpacks:apply', (e, modpackId, profileId) => modpackManager.applyModpack(modpackId, profileId));
  ipcMain.handle('modpacks:delete', (e, modpackId) => modpackManager.deleteModpack(modpackId));

  // Resource Packs
  ipcMain.handle('resourcepacks:getAll', (e, profileId) => resourcePackManager.getResourcePacks(profileId));
  ipcMain.handle('resourcepacks:install', (e, filePath, profileId) => resourcePackManager.installResourcePack(filePath, profileId));
  ipcMain.handle('resourcepacks:remove', (e, packId, profileId) => resourcePackManager.removeResourcePack(packId, profileId));
  ipcMain.handle('resourcepacks:setActive', (e, packIds, profileId) => resourcePackManager.setActivePacks(packIds, profileId));

  // Java Runtime
  ipcMain.handle('java:detect', () => javaRuntimeManager.detectJavaRuntimes());
  ipcMain.handle('java:getAll', () => javaRuntimeManager.getRuntimes());
  ipcMain.handle('java:setActive', (e, runtimePath) => javaRuntimeManager.setActiveRuntime(runtimePath));
  ipcMain.handle('java:downloadRuntime', (e, version) => javaRuntimeManager.downloadJavaRuntime(version));

  // Settings
  ipcMain.handle('settings:getAll', () => settingsManager.getAllSettings());
  ipcMain.handle('settings:update', (e, settings) => settingsManager.updateSettings(settings));
  ipcMain.handle('settings:setRam', (e, ramMB) => settingsManager.setRamAllocation(ramMB));
  ipcMain.handle('settings:setJvmArgs', (e, args) => settingsManager.setJvmArguments(args));
  ipcMain.handle('settings:setGameDir', (e, dir) => settingsManager.setGameDirectory(dir));
  ipcMain.handle('settings:setResolution', (e, width, height) => settingsManager.setResolution(width, height));
  ipcMain.handle('settings:setFullscreen', (e, enabled) => settingsManager.setFullscreen(enabled));
  ipcMain.handle('settings:getJvmPresets', () => settingsManager.getJvmPresets());
  ipcMain.handle('settings:applyJvmPreset', (e, presetName) => settingsManager.applyJvmPreset(presetName));

  // Downloads
  ipcMain.handle('downloads:getActive', () => downloadManager.getActiveDownloads());
  ipcMain.on('downloads:subscribe', (e) => {
    downloadManager.on('progress', (data) => e.sender.send('download:progress', data));
    downloadManager.on('complete', (data) => e.sender.send('download:complete', data));
  });

  // Console
  ipcMain.on('console:subscribe', (e) => {
    consoleManager.on('log', (data) => e.sender.send('console:log', data));
    consoleManager.on('crash', (data) => e.sender.send('console:crash', data));
  });
  ipcMain.handle('console:getCrashLogs', () => consoleManager.getCrashLogs());
  ipcMain.handle('console:getLog', (e, logId) => consoleManager.getLog(logId));

  // News
  ipcMain.handle('news:getLatest', () => newsFetcher.getLatestNews());

  // Servers
  ipcMain.handle('servers:getAll', () => serverManager.getServers());
  ipcMain.handle('servers:add', (e, server) => serverManager.addServer(server));
  ipcMain.handle('servers:remove', (e, serverId) => serverManager.removeServer(serverId));
  ipcMain.handle('servers:join', (e, serverId) => launcherCore.joinServer(serverId));

  // Theme & Language
  ipcMain.handle('theme:getCurrent', () => themeManager.getCurrentTheme());
  ipcMain.handle('theme:setTheme', (e, themeName) => themeManager.setTheme(themeName));
  ipcMain.handle('theme:getAvailable', () => themeManager.getAvailableThemes());
  ipcMain.handle('lang:getCurrent', () => languageManager.getCurrentLanguage());
  ipcMain.handle('lang:setLanguage', (e, langCode) => languageManager.setLanguage(langCode));
  ipcMain.handle('lang:getAvailable', () => languageManager.getAvailableLanguages());
  ipcMain.handle('lang:getStrings', () => languageManager.getStrings());

  // Backup
  ipcMain.handle('backup:create', () => backupManager.createBackup());
  ipcMain.handle('backup:getAll', () => backupManager.getBackups());
  ipcMain.handle('backup:restore', (e, backupId) => backupManager.restoreBackup(backupId));
  ipcMain.handle('backup:delete', (e, backupId) => backupManager.deleteBackup(backupId));

  // Auto Update
  ipcMain.handle('updater:check', () => autoUpdater.checkForUpdates());
  ipcMain.handle('updater:install', () => autoUpdater.installUpdate());

  // Repair
  ipcMain.handle('repair:installation', (e, versionId) => repairManager.repairInstallation(versionId));

  // Disk Usage
  ipcMain.handle('disk:usage', () => diskUsageMonitor.getDiskUsage());

  // Dialog
  ipcMain.handle('dialog:openFile', (e, filters) => {
    return dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: filters || [{ name: 'All Files', extensions: ['*'] }]
    });
  });
  ipcMain.handle('dialog:openDirectory', () => {
    return dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
  });
  ipcMain.handle('dialog:saveFile', (e, filters, defaultPath) => {
    return dialog.showSaveDialog(mainWindow, {
      filters: filters || [{ name: 'All Files', extensions: ['*'] }],
      defaultPath
    });
  });

  // App info
  ipcMain.handle('app:getInfo', () => ({
    version: app.getVersion(),
    name: app.getName(),
    dataPath,
    isPortable
  }));
}

app.whenReady().then(() => {
  fs.ensureDirSync(dataPath);
  initializeManagers();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
