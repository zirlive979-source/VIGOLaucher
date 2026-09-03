const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class AutoUpdater {
  constructor() {
    this.currentVersion = require('../../package.json').version;
    this.updateUrl = 'https://api.github.com/repos/vigolauncher/vigolauncher/releases/latest';
    this.updateInfo = null;
  }

  async checkForUpdates() {
    try {
      const response = await axios.get(this.updateUrl, {
        timeout: 10000,
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      const latest = response.data;
      const latestVersion = latest.tag_name.replace(/^v/, '');
      
      this.updateInfo = {
        version: latestVersion,
        currentVersion: this.currentVersion,
        hasUpdate: this.compareVersions(latestVersion, this.currentVersion) > 0,
        releaseNotes: latest.body,
        publishedAt: latest.published_at,
        downloadUrl: this.getDownloadUrl(latest.assets),
        htmlUrl: latest.html_url
      };

      return this.updateInfo;
    } catch (error) {
      console.error('Update check failed:', error);
      return {
        version: this.currentVersion,
        currentVersion: this.currentVersion,
        hasUpdate: false,
        error: error.message
      };
    }
  }

  getDownloadUrl(assets) {
    const platform = process.platform;
    const arch = process.arch;

    let assetFilter;
    if (platform === 'win32') {
      assetFilter = a => a.name.endsWith('.exe') && !a.name.includes('blockmap');
    } else if (platform === 'darwin') {
      assetFilter = a => a.name.endsWith('.dmg') || a.name.endsWith('-mac.zip');
    } else {
      assetFilter = a => a.name.endsWith('.AppImage') || a.name.endsWith('.deb');
    }

    const asset = assets.find(assetFilter);
    return asset ? asset.browser_download_url : null;
  }

  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  async installUpdate() {
    if (!this.updateInfo || !this.updateInfo.hasUpdate) {
      return { success: false, message: 'No update available' };
    }

    // In a real implementation, this would download and install the update
    // For now, return the download URL
    return {
      success: true,
      message: 'Update available for download',
      downloadUrl: this.updateInfo.downloadUrl,
      htmlUrl: this.updateInfo.htmlUrl
    };
  }
}

module.exports = AutoUpdater;
