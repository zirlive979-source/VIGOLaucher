const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class VersionManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.versionsDir = path.join(dataPath, 'versions');
    this.favoritesFile = path.join(dataPath, 'favorites.json');
    this.favorites = [];
    this.availableVersions = null;
    this.loadFavorites();
    fs.ensureDirSync(this.versionsDir);
  }

  loadFavorites() {
    try {
      if (fs.existsSync(this.favoritesFile)) {
        this.favorites = fs.readJsonSync(this.favoritesFile);
      }
    } catch (e) {
      this.favorites = [];
    }
  }

  saveFavorites() {
    fs.writeJsonSync(this.favoritesFile, this.favorites, { spaces: 2 });
  }

  setFavorite(versionId, isFavorite) {
    if (isFavorite) {
      if (!this.favorites.includes(versionId)) {
        this.favorites.push(versionId);
      }
    } else {
      this.favorites = this.favorites.filter(v => v !== versionId);
    }
    this.saveFavorites();
    return this.favorites;
  }

  getFavorites() {
    return this.favorites;
  }

  getInstalledVersions() {
    const versions = [];
    if (!fs.existsSync(this.versionsDir)) return versions;

    const dirs = fs.readdirSync(this.versionsDir);
    for (const dir of dirs) {
      const versionJson = path.join(this.versionsDir, dir, `${dir}.json`);
      if (fs.existsSync(versionJson)) {
        try {
          const data = fs.readJsonSync(versionJson);
          versions.push({
            id: data.id,
            type: data.type,
            releaseTime: data.releaseTime,
            isFavorite: this.favorites.includes(data.id),
            loader: this.detectLoader(data.id)
          });
        } catch (e) {
          console.error(`Failed to read version ${dir}:`, e);
        }
      }
    }
    return versions.sort((a, b) => b.releaseTime.localeCompare(a.releaseTime));
  }

  detectLoader(versionId) {
    if (versionId.includes('forge')) return 'Forge';
    if (versionId.includes('fabric')) return 'Fabric';
    if (versionId.includes('neoforge')) return 'NeoForge';
    return 'Vanilla';
  }

  async getAvailableVersions() {
    if (this.availableVersions) return this.availableVersions;
    
    try {
      const response = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json');
      this.availableVersions = response.data.versions
        .filter(v => v.type === 'release')
        .map(v => ({
          id: v.id,
          type: v.type,
          releaseTime: v.releaseTime,
          url: v.url,
          isFavorite: this.favorites.includes(v.id)
        }));
      return this.availableVersions;
    } catch (e) {
      console.error('Failed to fetch versions:', e);
      return [];
    }
  }

  async getSnapshotVersions() {
    try {
      const response = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json');
      return response.data.versions
        .filter(v => v.type === 'snapshot')
        .slice(0, 50)
        .map(v => ({
          id: v.id,
          type: v.type,
          releaseTime: v.releaseTime,
          url: v.url,
          isFavorite: this.favorites.includes(v.id)
        }));
    } catch (e) {
      console.error('Failed to fetch snapshots:', e);
      return [];
    }
  }

  getVersionPath(versionId) {
    return path.join(this.versionsDir, versionId);
  }

  isVersionInstalled(versionId) {
    return fs.existsSync(path.join(this.versionsDir, versionId, `${versionId}.json`));
  }
}

module.exports = VersionManager;
