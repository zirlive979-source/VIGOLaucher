const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

class BackupManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.backupsDir = path.join(dataPath, 'backups');
    fs.ensureDirSync(this.backupsDir);
  }

  createBackup() {
    const backupId = `backup_${Date.now()}`;
    const backupPath = path.join(this.backupsDir, `${backupId}.zip`);

    try {
      const zip = new AdmZip();
      
      // Add important files and directories
      const itemsToBackup = [
        'profiles.json',
        'settings.json',
        'auth.json',
        'favorites.json',
        'servers.json',
        'mods-index.json',
        'modpacks-index.json',
        'mods',
        'resourcepacks',
        'modpacks'
      ];

      for (const item of itemsToBackup) {
        const itemPath = path.join(this.dataPath, item);
        if (fs.existsSync(itemPath)) {
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            this.addDirectoryToZip(zip, itemPath, item);
          } else {
            zip.addFile(item, fs.readFileSync(itemPath));
          }
        }
      }

      zip.writeZip(backupPath);

      const backupInfo = {
        id: backupId,
        path: backupPath,
        createdAt: new Date().toISOString(),
        size: fs.statSync(backupPath).size
      };

      // Save backup index
      const indexFile = path.join(this.backupsDir, 'index.json');
      let index = [];
      if (fs.existsSync(indexFile)) {
        index = fs.readJsonSync(indexFile);
      }
      index.unshift(backupInfo);
      
      // Keep only last 20 backups
      if (index.length > 20) {
        const oldBackups = index.slice(20);
        for (const old of oldBackups) {
          if (fs.existsSync(old.path)) {
            fs.removeSync(old.path);
          }
        }
        index = index.slice(0, 20);
      }
      
      fs.writeJsonSync(indexFile, index, { spaces: 2 });

      return { success: true, backup: backupInfo };
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  addDirectoryToZip(zip, dirPath, zipPath) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.join(zipPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.addDirectoryToZip(zip, fullPath, relativePath);
      } else {
        zip.addFile(relativePath.replace(/\\/g, '/'), fs.readFileSync(fullPath));
      }
    }
  }

  getBackups() {
    const indexFile = path.join(this.backupsDir, 'index.json');
    if (fs.existsSync(indexFile)) {
      return fs.readJsonSync(indexFile);
    }
    return [];
  }

  restoreBackup(backupId) {
    const backups = this.getBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup || !fs.existsSync(backup.path)) {
      throw new Error('Backup not found');
    }

    try {
      // Create temp directory for restoration
      const tempDir = path.join(this.dataPath, 'temp', 'restore');
      fs.emptyDirSync(tempDir);

      const zip = new AdmZip(backup.path);
      zip.extractAllTo(tempDir, true);

      // Copy files back
      const items = fs.readdirSync(tempDir);
      for (const item of items) {
        const srcPath = path.join(tempDir, item);
        const destPath = path.join(this.dataPath, item);
        
        if (fs.existsSync(destPath)) {
          fs.removeSync(destPath);
        }
        fs.copySync(srcPath, destPath);
      }

      // Cleanup
      fs.removeSync(tempDir);

      return { success: true, backupId };
    } catch (error) {
      console.error('Backup restoration failed:', error);
      throw error;
    }
  }

  deleteBackup(backupId) {
    const indexFile = path.join(this.backupsDir, 'index.json');
    let backups = fs.existsSync(indexFile) ? fs.readJsonSync(indexFile) : [];
    
    const backup = backups.find(b => b.id === backupId);
    if (backup && fs.existsSync(backup.path)) {
      fs.removeSync(backup.path);
    }
    
    backups = backups.filter(b => b.id !== backupId);
    fs.writeJsonSync(indexFile, backups, { spaces: 2 });
    
    return { success: true };
  }
}

module.exports = BackupManager;
