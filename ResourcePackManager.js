const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

class ResourcePackManager {
  constructor(dataPath, profileManager) {
    this.dataPath = dataPath;
    this.profileManager = profileManager;
    this.resourcePacksBaseDir = path.join(dataPath, 'resourcepacks');
    fs.ensureDirSync(this.resourcePacksBaseDir);
  }

  getProfileResourcePacksDir(profileId) {
    const dir = path.join(this.resourcePacksBaseDir, profileId || 'default');
    fs.ensureDirSync(dir);
    return dir;
  }

  getResourcePacks(profileId) {
    const packsDir = this.getProfileResourcePacksDir(profileId);
    const packs = [];

    if (!fs.existsSync(packsDir)) return packs;

    const items = fs.readdirSync(packsDir);
    for (const item of items) {
      const itemPath = path.join(packsDir, item);
      const packInfo = this.readPackInfo(itemPath);
      if (packInfo) {
        packs.push({
          id: Buffer.from(item).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substr(0, 16),
          name: packInfo.pack?.description || item,
          format: packInfo.pack?.pack_format || 0,
          fileName: item,
          filePath: itemPath,
          isFolder: fs.statSync(itemPath).isDirectory(),
          size: this.getDirectorySize(itemPath)
        });
      }
    }
    return packs;
  }

  readPackInfo(itemPath) {
    try {
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const metaPath = path.join(itemPath, 'pack.mcmeta');
        if (fs.existsSync(metaPath)) {
          return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        }
      } else if (itemPath.endsWith('.zip')) {
        const zip = new AdmZip(itemPath);
        const metaEntry = zip.getEntry('pack.mcmeta');
        if (metaEntry) {
          return JSON.parse(metaEntry.getData().toString('utf8'));
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    try {
      const stat = fs.statSync(dirPath);
      if (stat.isFile()) return stat.size;
      
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        totalSize += this.getDirectorySize(path.join(dirPath, file));
      }
    } catch (e) {}
    return totalSize;
  }

  async installResourcePack(filePath, profileId) {
    if (!fs.existsSync(filePath)) {
      throw new Error('Resource pack file not found');
    }

    const packsDir = this.getProfileResourcePacksDir(profileId);
    const fileName = path.basename(filePath);
    const destPath = path.join(packsDir, fileName);

    if (fs.statSync(filePath).isDirectory()) {
      fs.copySync(filePath, destPath);
    } else {
      fs.copySync(filePath, destPath);
    }

    return { success: true, fileName };
  }

  removeResourcePack(packId, profileId) {
    const packs = this.getResourcePacks(profileId);
    const pack = packs.find(p => p.id === packId);
    if (pack && fs.existsSync(pack.filePath)) {
      fs.removeSync(pack.filePath);
      return { success: true };
    }
    return { success: false, error: 'Resource pack not found' };
  }

  setActivePacks(packIds, profileId) {
    // This would update the options.txt or similar
    // For now, we just store the selection
    const profile = this.profileManager.getProfile(profileId);
    if (profile) {
      profile.activeResourcePacks = packIds;
      this.profileManager.updateProfile(profileId, profile);
    }
    return { success: true, activePacks: packIds };
  }
}

module.exports = ResourcePackManager;
