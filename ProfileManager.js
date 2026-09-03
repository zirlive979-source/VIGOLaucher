const fs = require('fs-extra');
const path = require('path');

class ProfileManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.profilesFile = path.join(dataPath, 'profiles.json');
    this.profiles = {};
    this.activeProfileId = null;
    this.loadProfiles();
  }

  loadProfiles() {
    try {
      if (fs.existsSync(this.profilesFile)) {
        const data = fs.readJsonSync(this.profilesFile);
        this.profiles = data.profiles || {};
        this.activeProfileId = data.activeProfileId || null;
      }
      
      // Create default profile if none exists
      if (Object.keys(this.profiles).length === 0) {
        this.createProfile({
          name: 'Default',
          version: 'latest',
          gameDirectory: path.join(require('os').homedir(), '.minecraft'),
          icon: 'default'
        });
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
    }
  }

  saveProfiles() {
    fs.writeJsonSync(this.profilesFile, {
      profiles: this.profiles,
      activeProfileId: this.activeProfileId
    }, { spaces: 2 });
  }

  getAllProfiles() {
    return Object.values(this.profiles);
  }

  getActiveProfile() {
    return this.profiles[this.activeProfileId] || Object.values(this.profiles)[0];
  }

  setActiveProfile(id) {
    if (this.profiles[id]) {
      this.activeProfileId = id;
      this.saveProfiles();
      return this.profiles[id];
    }
    return null;
  }

  getProfile(id) {
    return this.profiles[id];
  }

  createProfile(profileData) {
    const id = `profile_${Date.now()}`;
    const profile = {
      id,
      name: profileData.name || 'New Profile',
      version: profileData.version || 'latest',
      gameDirectory: profileData.gameDirectory || path.join(this.dataPath, 'instances', id),
      icon: profileData.icon || 'default',
      jvmArguments: profileData.jvmArguments || '',
      ramAllocation: profileData.ramAllocation || null,
      javaRuntime: profileData.javaRuntime || null,
      resolution: profileData.resolution || null,
      fullscreen: profileData.fullscreen || false,
      mods: [],
      resourcePacks: [],
      createdAt: new Date().toISOString(),
      lastUsed: null
    };

    fs.ensureDirSync(profile.gameDirectory);
    this.profiles[id] = profile;
    
    if (!this.activeProfileId) {
      this.activeProfileId = id;
    }
    
    this.saveProfiles();
    return profile;
  }

  updateProfile(id, profileData) {
    if (this.profiles[id]) {
      this.profiles[id] = { ...this.profiles[id], ...profileData, id };
      this.saveProfiles();
      return this.profiles[id];
    }
    return null;
  }

  deleteProfile(id) {
    if (this.profiles[id]) {
      delete this.profiles[id];
      if (this.activeProfileId === id) {
        const remaining = Object.keys(this.profiles);
        this.activeProfileId = remaining.length > 0 ? remaining[0] : null;
      }
      this.saveProfiles();
      return true;
    }
    return false;
  }
}

module.exports = ProfileManager;
