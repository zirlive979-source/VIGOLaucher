const fs = require('fs-extra');
const path = require('path');

class SettingsManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.settingsFile = path.join(dataPath, 'settings.json');
    this.settings = this.getDefaultSettings();
    this.loadSettings();
  }

  getDefaultSettings() {
    const totalMemoryMB = Math.floor(require('os').totalmem() / (1024 * 1024));
    const recommendedRAM = Math.min(Math.floor(totalMemoryMB / 4), 8192);

    return {
      ram: {
        min: 512,
        max: recommendedRAM,
        allocation: recommendedRAM
      },
      java: {
        runtimePath: '',
        jvmArguments: '',
        autoDetect: true
      },
      game: {
        directory: path.join(require('os').homedir(), '.minecraft'),
        resolution: {
          width: 1280,
          height: 720
        },
        fullscreen: false
      },
      launcher: {
        theme: 'dark',
        language: 'id',
        autoUpdate: true,
        closeOnLaunch: false,
        showConsole: false
      },
      jvmPresets: {
        'performance': {
          name: 'Performa Tinggi',
          args: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1'
        },
        'balanced': {
          name: 'Seimbang',
          args: '-XX:+UseG1GC -XX:MaxGCPauseMillis=50'
        },
        'low-memory': {
          name: 'Memori Rendah',
          args: '-XX:+UseSerialGC -Xmx1G -Xms512M'
        },
        'stable': {
          name: 'Stabil',
          args: '-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:MaxGCPauseMillis=100'
        }
      },
      activeJvmPreset: 'balanced'
    };
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const saved = fs.readJsonSync(this.settingsFile);
        this.settings = { ...this.settings, ...saved };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  saveSettings() {
    fs.writeJsonSync(this.settingsFile, this.settings, { spaces: 2 });
  }

  getAllSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    return this.settings;
  }

  setRamAllocation(ramMB) {
    this.settings.ram.allocation = parseInt(ramMB);
    this.saveSettings();
    return this.settings.ram;
  }

  setJvmArguments(args) {
    this.settings.java.jvmArguments = args;
    this.saveSettings();
    return this.settings.java;
  }

  setGameDirectory(dir) {
    this.settings.game.directory = dir;
    this.saveSettings();
    return this.settings.game;
  }

  setResolution(width, height) {
    this.settings.game.resolution = { width: parseInt(width), height: parseInt(height) };
    this.saveSettings();
    return this.settings.game.resolution;
  }

  setFullscreen(enabled) {
    this.settings.game.fullscreen = enabled;
    this.saveSettings();
    return this.settings.game.fullscreen;
  }

  getJvmPresets() {
    return this.settings.jvmPresets;
  }

  applyJvmPreset(presetName) {
    const preset = this.settings.jvmPresets[presetName];
    if (preset) {
      this.settings.java.jvmArguments = preset.args;
      this.settings.activeJvmPreset = presetName;
      this.saveSettings();
      return { success: true, preset, args: preset.args };
    }
    return { success: false, error: 'Preset not found' };
  }
}

module.exports = SettingsManager;
