const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { Client, Authenticator } = require('minecraft-launcher-core');

class LauncherCore extends EventEmitter {
  constructor(options) {
    super();
    this.authManager = options.authManager;
    this.versionManager = options.versionManager;
    this.javaRuntimeManager = options.javaRuntimeManager;
    this.settingsManager = options.settingsManager;
    this.profileManager = options.profileManager;
    this.consoleManager = options.consoleManager;
    this.dataPath = options.dataPath;
    this.mlc = new Client();
    this.currentProcess = null;
    this.isRunning = false;

    // Setup MLC events
    this.mlc.on('debug', (e) => this.consoleManager.debug(e, 'minecraft'));
    this.mlc.on('data', (e) => this.consoleManager.info(e, 'minecraft'));
    this.mlc.on('error', (e) => this.consoleManager.error(e, 'minecraft'));
    this.mlc.on('close', (e) => {
      this.isRunning = false;
      this.currentProcess = null;
      this.consoleManager.info(`Minecraft closed with code: ${e}`, 'launcher');
      this.emit('close', e);
    });
  }

  async launch(options = {}) {
    if (this.isRunning) {
      throw new Error('Minecraft is already running');
    }

    const profile = this.profileManager.getActiveProfile();
    const settings = this.settingsManager.getAllSettings();
    const user = await this.authManager.refreshToken();

    if (!user) {
      throw new Error('Not logged in. Please login first.');
    }

    const versionId = options.version || profile.version || 'latest';
    const versionDir = this.versionManager.getVersionPath(versionId);

    if (!fs.existsSync(versionDir)) {
      throw new Error(`Version ${versionId} is not installed. Please install it first.`);
    }

    this.consoleManager.startNewSession();
    this.consoleManager.info(`Starting Minecraft ${versionId}...`, 'launcher');

    // Build auth
    let auth;
    if (user.type === 'microsoft') {
      auth = {
        access_token: user.accessToken,
        client_token: user.uuid,
        uuid: user.uuid,
        name: user.username,
        user_properties: '{}',
        meta: {
          type: 'microsoft',
          demo: false
        }
      };
    } else {
      auth = Authenticator.getAuth(user.username);
    }

    // Build launch options
    const javaPath = this.javaRuntimeManager.getActiveRuntime();
    const ramAllocation = profile.ramAllocation || settings.ram.allocation;
    const jvmArgs = profile.jvmArguments || settings.java.jvmArguments;
    const gameDir = profile.gameDirectory || settings.game.directory;
    const resolution = profile.resolution || settings.game.resolution;
    const fullscreen = profile.fullscreen !== undefined ? profile.fullscreen : settings.game.fullscreen;

    const launchOpts = {
      clientPackage: null,
      authorization: auth,
      root: gameDir,
      version: {
        number: versionId,
        type: 'release'
      },
      memory: {
        max: `${ramAllocation}M`,
        min: `${Math.min(512, ramAllocation)}M`
      },
      javaPath: javaPath,
      overrides: {
        gameDirectory: gameDir
      }
    };

    // Add custom JVM args
    if (jvmArgs && jvmArgs.trim()) {
      launchOpts.overrides.jvmArgs = jvmArgs.trim().split(' ').filter(a => a);
    }

    // Add resolution
    if (resolution) {
      launchOpts.overrides.gameArgs = [];
      if (fullscreen) {
        launchOpts.overrides.gameArgs.push('--fullscreen');
      } else {
        launchOpts.overrides.gameArgs.push(
          '--width', resolution.width.toString(),
          '--height', resolution.height.toString()
        );
      }
    }

    // Add server if specified
    if (options.serverAddress) {
      if (!launchOpts.overrides.gameArgs) launchOpts.overrides.gameArgs = [];
      launchOpts.overrides.gameArgs.push('--server', options.serverAddress);
    }

    try {
      this.emit('launching', { version: versionId });
      this.isRunning = true;
      
      await this.mlc.launch(launchOpts);
      this.currentProcess = this.mlc.getProcess();
      
      this.consoleManager.info('Minecraft launched successfully!', 'launcher');
      this.emit('launched', { version: versionId, pid: this.currentProcess?.pid });
      
      return { success: true, version: versionId };
    } catch (error) {
      this.isRunning = false;
      this.consoleManager.error(`Failed to launch Minecraft: ${error.message}`, 'launcher');
      this.emit('error', error);
      throw error;
    }
  }

  async joinServer(serverId) {
    // ServerManager would provide the address
    // For now, this is a placeholder that would be called with a server address
    return { success: true, message: 'Server join would be handled here' };
  }

  stop() {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      this.consoleManager.info('Minecraft process terminated', 'launcher');
      return true;
    }
    return false;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      pid: this.currentProcess?.pid || null
    };
  }
}

module.exports = LauncherCore;
