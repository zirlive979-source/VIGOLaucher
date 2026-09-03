const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

class ModpackManager {
  constructor(dataPath, modManager) {
    this.dataPath = dataPath;
    this.modManager = modManager;
    this.modpacksDir = path.join(dataPath, 'modpacks');
    this.modpacksIndexFile = path.join(dataPath, 'modpacks-index.json');
    this.modpacksIndex = {};
    this.loadIndex();
    fs.ensureDirSync(this.modpacksDir);
  }

  loadIndex() {
    try {
      if (fs.existsSync(this.modpacksIndexFile)) {
        this.modpacksIndex = fs.readJsonSync(this.modpacksIndexFile);
      }
    } catch (e) {
      this.modpacksIndex = {};
    }
  }

  saveIndex() {
    fs.writeJsonSync(this.modpacksIndexFile, this.modpacksIndex, { spaces: 2 });
  }

  getModpacks() {
    return Object.values(this.modpacksIndex);
  }

  async importModpack(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error('Modpack file not found');
    }

    const ext = path.extname(filePath).toLowerCase();
    let modpackData;

    if (ext === '.zip') {
      modpackData = this.importZipModpack(filePath);
    } else if (ext === '.json') {
      modpackData = fs.readJsonSync(filePath);
    } else {
      throw new Error('Unsupported modpack format');
    }

    const modpackId = `modpack_${Date.now()}`;
    const modpackDir = path.join(this.modpacksDir, modpackId);
    fs.ensureDirSync(modpackDir);

    const modpack = {
      id: modpackId,
      name: modpackData.name || path.basename(filePath, ext),
      version: modpackData.version || '1.0.0',
      mcVersion: modpackData.mcVersion || 'unknown',
      loader: modpackData.loader || 'vanilla',
      description: modpackData.description || '',
      mods: modpackData.mods || [],
      createdAt: new Date().toISOString()
    };

    this.modpacksIndex[modpackId] = modpack;
    this.saveIndex();

    // Save modpack metadata
    fs.writeJsonSync(path.join(modpackDir, 'modpack.json'), modpack, { spaces: 2 });

    return { success: true, modpack };
  }

  importZipModpack(zipPath) {
    const zip = new AdmZip(zipPath);
    const manifestEntry = zip.getEntry('manifest.json') || zip.getEntry('modrinth.index.json');
    
    if (manifestEntry) {
      const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
      return {
        name: manifest.name || 'Imported Modpack',
        version: manifest.versionId || manifest.version || '1.0.0',
        mcVersion: manifest.minecraft?.version || '',
        loader: manifest.minecraft?.modLoaders?.[0]?.id || 'vanilla',
        description: manifest.summary || '',
        mods: (manifest.files || []).map(f => ({
          name: f.path?.split('/').pop() || f.fileName || 'unknown',
          url: f.downloads?.[0] || '',
          size: f.fileSize || 0
        }))
      };
    }

    return { name: path.basename(zipPath, '.zip'), mods: [] };
  }

  async exportModpack(modpackId, exportPath) {
    const modpack = this.modpacksIndex[modpackId];
    if (!modpack) throw new Error('Modpack not found');

    const zip = new AdmZip();
    zip.addFile('manifest.json', Buffer.from(JSON.stringify(modpack, null, 2)));
    
    const exportFilePath = exportPath || path.join(this.dataPath, 'exports', `${modpack.name}-${modpack.version}.zip`);
    fs.ensureDirSync(path.dirname(exportFilePath));
    zip.writeZip(exportFilePath);

    return { success: true, exportPath: exportFilePath };
  }

  async applyModpack(modpackId, profileId) {
    const modpack = this.modpacksIndex[modpackId];
    if (!modpack) throw new Error('Modpack not found');

    // Clear existing mods for this profile
    const modsDir = this.modManager.getProfileModsDir(profileId);
    fs.emptyDirSync(modsDir);

    // Note: Full implementation would download each mod
    // This is a simplified version
    return { 
      success: true, 
      message: `Modpack ${modpack.name} applied. ${modpack.mods.length} mods would be installed.`,
      modpack 
    };
  }

  deleteModpack(modpackId) {
    if (!this.modpacksIndex[modpackId]) return { success: false, error: 'Modpack not found' };
    
    const modpackDir = path.join(this.modpacksDir, modpackId);
    if (fs.existsSync(modpackDir)) {
      fs.removeSync(modpackDir);
    }
    
    delete this.modpacksIndex[modpackId];
    this.saveIndex();
    return { success: true };
  }
}

module.exports = ModpackManager;
