const { EventEmitter } = require('events');
const fs = require('fs-extra');
const path = require('path');
const msmc = require('msmc');

class AuthManager extends EventEmitter {
  constructor(dataPath, profileManager) {
    super();
    this.dataPath = dataPath;
    this.profileManager = profileManager;
    this.authFile = path.join(dataPath, 'auth.json');
    this.currentUser = null;
    this.loadAuth();
  }

  loadAuth() {
    try {
      if (fs.existsSync(this.authFile)) {
        const data = fs.readJsonSync(this.authFile);
        this.currentUser = data;
      }
    } catch (e) {
      console.error('Failed to load auth:', e);
    }
  }

  saveAuth() {
    fs.writeJsonSync(this.authFile, this.currentUser, { spaces: 2 });
  }

  async loginMicrosoft() {
    try {
      const result = await msmc.launch("electron", (update) => {
        console.log('Auth update:', update);
      });

      if (msmc.errorCheck(result)) {
        throw new Error(result.reason);
      }

      const profile = msmc.getProfile(result);
      this.currentUser = {
        type: 'microsoft',
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        username: profile.name,
        uuid: profile.id,
        expiresAt: Date.now() + (result.expires_in * 1000)
      };

      this.saveAuth();
      this.emit('login', this.currentUser);
      return this.currentUser;
    } catch (error) {
      console.error('Microsoft login failed:', error);
      throw error;
    }
  }

  loginOffline(username) {
    if (!username || username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    // Generate UUID from username (offline mode)
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(`OfflinePlayer:${username}`).digest('hex');
    const uuid = `${hash.substr(0,8)}-${hash.substr(8,4)}-${hash.substr(12,4)}-${hash.substr(16,4)}-${hash.substr(20,12)}`;

    this.currentUser = {
      type: 'offline',
      username: username.trim(),
      uuid: uuid,
      accessToken: 'offline_access_token'
    };

    this.saveAuth();
    this.emit('login', this.currentUser);
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    if (fs.existsSync(this.authFile)) {
      fs.removeSync(this.authFile);
    }
    this.emit('logout');
    return true;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  async refreshToken() {
    if (!this.currentUser || this.currentUser.type !== 'microsoft') return null;
    
    if (this.currentUser.expiresAt && Date.now() < this.currentUser.expiresAt) {
      return this.currentUser;
    }

    try {
      const result = await msmc.refresh(this.currentUser.refreshToken);
      if (msmc.errorCheck(result)) {
        this.logout();
        throw new Error('Token refresh failed');
      }

      this.currentUser.accessToken = result.access_token;
      this.currentUser.refreshToken = result.refresh_token;
      this.currentUser.expiresAt = Date.now() + (result.expires_in * 1000);
      this.saveAuth();
      return this.currentUser;
    } catch (e) {
      console.error('Token refresh failed:', e);
      return null;
    }
  }
}

module.exports = AuthManager;
