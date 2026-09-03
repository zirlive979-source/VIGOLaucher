const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

class ModManager {
  constructor(dataPath, profileManager) {
    this.dataPath = dataPath;
    this.profileManager = profileManager;
    this.modsBaseDir = path.join(dataPath, 'mods');
    this.modsIndexFile = path.join(dataPath, 'mods-index.json');
    this.modsIndex = {};
    this.loadIndex();
    fs.ensureDirSync(this.modsBaseDir);
  }

  loadIndex() {
    try {
      if (fs.existsSync(this.modsIndexFile)) {
        this.modsIndex = fs.readJsonSync(this.modsIndexFile);
      }
    } catch (e) {
      this.modsIndex = {};
    }
  }

  saveIndex() {
    fs.writeJsonSync(this.modsIndexFile, this.modsIndex, { spaces: 2 });
  }

  getProfileModsDir(profileId) {
    const dir = path.join(this.modsBaseDir, profileId || 'default');
    fs.ensureDirSync(dir);
    return dir;
  }

  getMods(profileId) {
    const modsDir = this.getProfileModsDir(profileId);
    const mods = [];
    
    if (!fs.existsSync(modsDir)) return mods;

    const files = fs.readdirSync(modsDir).filter(f => f.endsWith('.jar'));
    for (const file of files) {
      const modInfo = this.readModInfo(path.join(modsDir, file));
      const modId = this.generateModId(file);
      mods.push({
        id: modId,
        name: modInfo.name || file.replace('.jar', ''),
        version: modInfo.version || 'Unknown',
        description: modInfo.description || '',
        authors: modInfo.authors || [],
        fileName: file,
        filePath: path.join(modsDir, file),
        size: fs.statSync(path.join(modsDir, file)).size,
        enabled: !file.endsWith('.disabled.jar'),
        loader: this.detectModLoader(modInfo)
      });
    }
    return mods;
  }

  readModInfo(jarPath) {
    try {
      const zip = new AdmZip(jarPath);
      
      // Try fabric.mod.json
      const fabricEntry = zip.getEntry('fabric.mod.json');
      if (fabricEntry) {
        const data = JSON.parse(fabricEntry.getData().toString('utf8'));
        return {
          name: data.name,
          version: data.version,
          description: data.description,
          authors: data.authors ? data.authors.map(a => typeof a === 'string' ? a : a.name) : [],
          loader: 'fabric'
        };
      }

      // Try mods.toml (Forge)
      const tomlEntry = zip.getEntry('META-INF/mods.toml');
      if (tomlEntry) {
        const content = tomlEntry.getData().toString('utf8');
        return this.parseTomlSimple(content);
      }

      // Try mcmod.info (old Forge)
      const mcmodEntry = zip.getEntry('mcmod.info');
      if (mcmodEntry) {
        const data = JSON.parse(mcmodEntry.getData().toString('utf8'));
        const mod = Array.isArray(data) ? data[0] : data;
        return {
          name: mod.name,
          version: mod.version,
          description: mod.description,
          authors: mod.authorList || [mod.author],
          loader: 'forge'
        };
      }

      return {};
    } catch (e) {
      return {};
    }
  }

  parseTomlSimple(content) {
    const info = { loader: 'forge' };
    const nameMatch = content.match(/displayName\s*=\s*"([^"]+)"/);
    const versionMatch = content.match(/version\s*=\s*"([^"]+)"/);
    const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
    const authorsMatch = content.match(/authors\s*=\s*"([^"]+)"/);

    if (nameMatch) info.name = nameMatch[1];
    if (versionMatch) info.version = versionMatch[1];
    if (descMatch) info.description = descMatch[1];
    if (authorsMatch) info.authors = authorsMatch[1].split(',').map(a => a.trim());

    return info;
  }

  detectModLoader(info) {
    return info.loader || 'unknown';
  }

  generateModId(fileName) {
    return Buffer.from(fileName).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
  }

  async installMod(filePath, profileId) {
    if (!fs.existsSync(filePath)) {
      throw new Error('Mod file not found');
    }

    const modsDir = this.getProfileModsDir(profileId);
    const fileName = path.basename(filePath);
    const destPath = path.join(modsDir, fileName);

    fs.copySync(filePath, destPath);

    return {
      success: true,
      mod: {
        id: this.generateModId(fileName),
        name: fileName.replace('.jar', ''),
        fileName,
        enabled: true
      }
    };
  }

  removeMod(modId, profileId) {
    const mods = this.getMods(profileId);
    const mod = mods.find(m => m.id === modId);
    if (mod && fs.existsSync(mod.filePath)) {
      fs.removeSync(mod.filePath);
      return { success: true };
    }
    return { success: false, error: 'Mod not found' };
  }

  toggleMod(modId, enabled, profileId) {
    const mods = this.getMods(profileId);
    const mod = mods.find(m => m.id === modId);
    if (!mod) return { success: false, error: 'Mod not found' };

    let newPath;
    if (enabled) {
      newPath = mod.filePath.replace('.disabled.jar', '.jar');
    } else {
      newPath = mod.filePath.replace('.jar', '.disabled.jar');
    }

    if (mod.filePath !== newPath) {
      fs.moveSync(mod.filePath, newPath);
    }

    return { success: true, enabled };
  }
}

module.exports = ModManager;
