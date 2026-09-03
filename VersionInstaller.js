const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { Client } = require('minecraft-launcher-core');

class VersionInstaller {
  constructor(dataPath, downloadManager) {
    this.dataPath = dataPath;
    this.versionsDir = path.join(dataPath, 'versions');
    this.librariesDir = path.join(dataPath, 'libraries');
    this.assetsDir = path.join(dataPath, 'assets');
    this.downloadManager = downloadManager;
    this.mlc = new Client();
  }

  async installVersion(versionId) {
    try {
      // Get version manifest
      const manifestResponse = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json');
      const versionMeta = manifestResponse.data.versions.find(v => v.id === versionId);
      
      if (!versionMeta) {
        throw new Error(`Version ${versionId} not found`);
      }

      const versionData = await axios.get(versionMeta.url);
      const versionJson = versionData.data;

      // Create version directory
      const versionDir = path.join(this.versionsDir, versionId);
      fs.ensureDirSync(versionDir);
      fs.writeJsonSync(path.join(versionDir, `${versionId}.json`), versionJson, { spaces: 2 });

      // Download client jar
      if (versionJson.downloads && versionJson.downloads.client) {
        const clientJarPath = path.join(versionDir, `${versionId}.jar`);
        await this.downloadManager.download(
          versionJson.downloads.client.url,
          clientJarPath,
          { id: `client-${versionId}`, name: `Minecraft ${versionId} Client` }
        );
      }

      // Download libraries
      const libraries = versionJson.libraries || [];
      for (const lib of libraries) {
        if (lib.downloads && lib.downloads.artifact) {
          const artifact = lib.downloads.artifact;
          const libPath = path.join(this.librariesDir, artifact.path);
          if (!fs.existsSync(libPath)) {
            fs.ensureDirSync(path.dirname(libPath));
            await this.downloadManager.download(
              artifact.url,
              libPath,
              { id: `lib-${lib.name}`, name: `Library: ${lib.name}` }
            );
          }
        }
      }

      // Download assets
      if (versionJson.assetIndex) {
        await this.downloadAssets(versionJson.assetIndex);
      }

      return { success: true, versionId };
    } catch (error) {
      console.error(`Failed to install version ${versionId}:`, error);
      throw error;
    }
  }

  async downloadAssets(assetIndex) {
    try {
      const indexData = await axios.get(assetIndex.url);
      const objects = indexData.data.objects;
      const objectsDir = path.join(this.assetsDir, 'objects');
      fs.ensureDirSync(objectsDir);

      // Save index file
      const indexesDir = path.join(this.assetsDir, 'indexes');
      fs.ensureDirSync(indexesDir);
      fs.writeJsonSync(path.join(indexesDir, `${assetIndex.id}.json`), indexData.data, { spaces: 2 });

      // Download each asset (in batches)
      const objectEntries = Object.entries(objects);
      for (let i = 0; i < objectEntries.length; i += 10) {
        const batch = objectEntries.slice(i, i + 10);
        await Promise.all(batch.map(async ([name, asset]) => {
          const hash = asset.hash;
          const subDir = hash.substr(0, 2);
          const assetPath = path.join(objectsDir, subDir, hash);
          
          if (!fs.existsSync(assetPath)) {
            fs.ensureDirSync(path.dirname(assetPath));
            try {
              await this.downloadManager.download(
                `https://resources.download.minecraft.net/${subDir}/${hash}`,
                assetPath,
                { id: `asset-${hash}`, name: `Asset: ${name}`, silent: true }
              );
            } catch (e) {
              console.warn(`Failed to download asset ${name}:`, e.message);
            }
          }
        }));
      }
    } catch (e) {
      console.error('Failed to download assets:', e);
    }
  }

  async installForge(mcVersion) {
    try {
      // Get Forge versions for this Minecraft version
      const forgeVersions = await this.getForgeVersions(mcVersion);
      if (forgeVersions.length === 0) {
        throw new Error(`No Forge version found for Minecraft ${mcVersion}`);
      }

      const latestForge = forgeVersions[0];
      const forgeVersion = `${mcVersion}-${latestForge}`;
      
      // Download Forge installer
      const installerUrl = `https://maven.minecraftforge.net/net/minecraftforge/forge/${forgeVersion}/forge-${forgeVersion}-installer.jar`;
      const installerPath = path.join(this.dataPath, 'temp', `forge-installer-${forgeVersion}.jar`);
      fs.ensureDirSync(path.dirname(installerPath));
      
      await this.downloadManager.download(
        installerUrl,
        installerPath,
        { id: `forge-installer-${forgeVersion}`, name: `Forge Installer ${forgeVersion}` }
      );

      // Note: Full Forge installation requires running the installer jar
      // This is a simplified version that downloads and sets up basic structure
      const forgeDir = path.join(this.versionsDir, `forge-${forgeVersion}`);
      fs.ensureDirSync(forgeDir);

      // Create a basic version json that points to Forge
      const forgeVersionJson = {
        id: `forge-${forgeVersion}`,
        inheritsFrom: mcVersion,
        type: "release",
        mainClass: "net.minecraftforge.userdev.LaunchTesting",
        releaseTime: new Date().toISOString(),
        time: new Date().toISOString(),
        minimumLauncherVersion: 21
      };

      fs.writeJsonSync(path.join(forgeDir, `forge-${forgeVersion}.json`), forgeVersionJson, { spaces: 2 });

      return { success: true, forgeVersion: `forge-${forgeVersion}`, mcVersion };
    } catch (error) {
      console.error('Forge installation failed:', error);
      throw error;
    }
  }

  async getForgeVersions(mcVersion) {
    try {
      const response = await axios.get(`https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json`);
      const versions = response.data[mcVersion] || [];
      return versions.sort((a, b) => b.localeCompare(a));
    } catch (e) {
      console.error('Failed to fetch Forge versions:', e);
      return [];
    }
  }

  async installFabric(mcVersion) {
    try {
      // Get Fabric loader versions
      const loaderResponse = await axios.get('https://meta.fabricmc.net/v2/versions/loader');
      const latestLoader = loaderResponse.data[0].version;

      // Get Fabric installer
      const installerResponse = await axios.get('https://meta.fabricmc.net/v2/versions/installer');
      const latestInstaller = installerResponse.data[0].version;

      const fabricVersionId = `fabric-loader-${latestLoader}-${mcVersion}`;
      const fabricDir = path.join(this.versionsDir, fabricVersionId);
      fs.ensureDirSync(fabricDir);

      // Download Fabric loader jar
      const loaderUrl = `https://maven.fabricmc.net/net/fabricmc/fabric-loader/${latestLoader}/fabric-loader-${latestLoader}.jar`;
      await this.downloadManager.download(
        loaderUrl,
        path.join(fabricDir, `${fabricVersionId}.jar`),
        { id: `fabric-loader-${latestLoader}`, name: `Fabric Loader ${latestLoader}` }
      );

      // Create Fabric version json
      const fabricVersionJson = {
        id: fabricVersionId,
        inheritsFrom: mcVersion,
        type: "release",
        mainClass: "net.fabricmc.loader.impl.launch.knot.KnotClient",
        releaseTime: new Date().toISOString(),
        time: new Date().toISOString(),
        minimumLauncherVersion: 21,
        libraries: [
          {
            name: `net.fabricmc:fabric-loader:${latestLoader}`,
            downloads: {
              artifact: {
                url: loaderUrl,
                path: `net/fabricmc/fabric-loader/${latestLoader}/fabric-loader-${latestLoader}.jar`
              }
            }
          }
        ]
      };

      fs.writeJsonSync(path.join(fabricDir, `${fabricVersionId}.json`), fabricVersionJson, { spaces: 2 });

      return { success: true, fabricVersion: fabricVersionId, mcVersion };
    } catch (error) {
      console.error('Fabric installation failed:', error);
      throw error;
    }
  }

  async installNeoForge(mcVersion) {
    try {
      const neoResponse = await axios.get('https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge');
      const versions = neoResponse.data.versions.filter(v => v.startsWith(mcVersion));
      
      if (versions.length === 0) {
        throw new Error(`No NeoForge version found for Minecraft ${mcVersion}`);
      }

      const latestNeo = versions.sort((a, b) => b.localeCompare(a))[0];
      const neoVersionId = `neoforge-${latestNeo}`;
      const neoDir = path.join(this.versionsDir, neoVersionId);
      fs.ensureDirSync(neoDir);

      // Create NeoForge version json
      const neoVersionJson = {
        id: neoVersionId,
        inheritsFrom: mcVersion,
        type: "release",
        mainClass: "net.neoforged.neoforge.client.loading.ClientModLoader",
        releaseTime: new Date().toISOString(),
        time: new Date().toISOString(),
        minimumLauncherVersion: 21
      };

      fs.writeJsonSync(path.join(neoDir, `${neoVersionId}.json`), neoVersionJson, { spaces: 2 });

      return { success: true, neoVersion: neoVersionId, mcVersion };
    } catch (error) {
      console.error('NeoForge installation failed:', error);
      throw error;
    }
  }
}

module.exports = VersionInstaller;
