const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class DiskUsageMonitor {
  constructor(dataPath) {
    this.dataPath = dataPath;
  }

  getDiskUsage() {
    const launcherData = this.getDirectorySize(this.dataPath);
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    // Get disk info
    const diskInfo = this.getDiskInfo(this.dataPath);

    // Breakdown by category
    const breakdown = {
      versions: this.getDirectorySize(path.join(this.dataPath, 'versions')),
      libraries: this.getDirectorySize(path.join(this.dataPath, 'libraries')),
      assets: this.getDirectorySize(path.join(this.dataPath, 'assets')),
      mods: this.getDirectorySize(path.join(this.dataPath, 'mods')),
      modpacks: this.getDirectorySize(path.join(this.dataPath, 'modpacks')),
      resourcepacks: this.getDirectorySize(path.join(this.dataPath, 'resourcepacks')),
      backups: this.getDirectorySize(path.join(this.dataPath, 'backups')),
      instances: this.getDirectorySize(path.join(this.dataPath, 'instances')),
      other: 0
    };

    const accountedFor = Object.values(breakdown).reduce((a, b) => a + b, 0);
    breakdown.other = Math.max(0, launcherData - accountedFor);

    return {
      launcher: {
        total: launcherData,
        breakdown
      },
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: totalMemory - freeMemory,
        usedPercent: Math.round(((totalMemory - freeMemory) / totalMemory) * 100)
      },
      disk: diskInfo,
      platform: {
        os: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        hostname: os.hostname()
      }
    };
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    try {
      if (!fs.existsSync(dirPath)) return 0;
      
      const stat = fs.statSync(dirPath);
      if (stat.isFile()) return stat.size;
      
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        totalSize += this.getDirectorySize(path.join(dirPath, item));
      }
    } catch (e) {}
    return totalSize;
  }

  getDiskInfo(dirPath) {
    try {
      // This is a simplified version
      // On Linux/macOS we could use `df`, but for cross-platform:
      const stat = fs.statSync(dirPath);
      
      // Estimate using os module (not perfect but works)
      const totalDisk = this.estimateTotalDisk();
      
      return {
        total: totalDisk.total,
        free: totalDisk.free,
        used: totalDisk.total - totalDisk.free,
        usedPercent: Math.round(((totalDisk.total - totalDisk.free) / totalDisk.total) * 100)
      };
    } catch (e) {
      return {
        total: 0,
        free: 0,
        used: 0,
        usedPercent: 0
      };
    }
  }

  estimateTotalDisk() {
    // Very rough estimate - in production use proper disk info APIs
    const total = 1024 * 1024 * 1024 * 500; // Assume 500GB
    const free = os.freemem() * 10; // Rough estimate
    return { total, free: Math.min(free, total * 0.3) };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = DiskUsageMonitor;
