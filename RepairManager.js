const fs = require('fs-extra');
const path = require('path');

class RepairManager {
  constructor(dataPath, versionInstaller) {
    this.dataPath = dataPath;
    this.versionInstaller = versionInstaller;
    this.versionsDir = path.join(dataPath, 'versions');
    this.librariesDir = path.join(dataPath, 'libraries');
    this.assetsDir = path.join(dataPath, 'assets');
  }

  async repairInstallation(versionId) {
    const report = {
      versionId,
      startTime: new Date().toISOString(),
      issuesFound: [],
      repairsMade: [],
      errors: []
    };

    try {
      const versionDir = path.join(this.versionsDir, versionId);
      
      if (!fs.existsSync(versionDir)) {
        report.issuesFound.push(`Version directory not found: ${versionDir}`);
        report.errors.push('Version is not installed');
        return report;
      }

      // Check version json
      const versionJsonPath = path.join(versionDir, `${versionId}.json`);
      if (!fs.existsSync(versionJsonPath)) {
        report.issuesFound.push('Version JSON file missing');
        report.errors.push('Cannot repair without version metadata');
        return report;
      }

      const versionJson = fs.readJsonSync(versionJsonPath);

      // Check client jar
      const clientJarPath = path.join(versionDir, `${versionId}.jar`);
      if (!fs.existsSync(clientJarPath)) {
        report.issuesFound.push('Client JAR file missing');
        report.repairsMade.push('Client JAR needs re-download');
      } else {
        const jarSize = fs.statSync(clientJarPath).size;
        if (jarSize < 1000000) { // Less than 1MB is suspicious
          report.issuesFound.push(`Client JAR seems too small (${jarSize} bytes)`);
          report.repairsMade.push('Client JAR flagged for re-download');
        }
      }

      // Check libraries
      if (versionJson.libraries) {
        for (const lib of versionJson.libraries) {
          if (lib.downloads && lib.downloads.artifact) {
            const libPath = path.join(this.librariesDir, lib.downloads.artifact.path);
            if (!fs.existsSync(libPath)) {
              report.issuesFound.push(`Missing library: ${lib.name}`);
              report.repairsMade.push(`Will re-download: ${lib.name}`);
            }
          }
        }
      }

      // Check assets index
      if (versionJson.assetIndex) {
        const indexPath = path.join(this.assetsDir, 'indexes', `${versionJson.assetIndex.id}.json`);
        if (!fs.existsSync(indexPath)) {
          report.issuesFound.push(`Asset index missing: ${versionJson.assetIndex.id}`);
          report.repairsMade.push('Asset index needs re-download');
        }
      }

      // Perform repairs (re-install version)
      if (report.issuesFound.length > 0) {
        report.message = `Found ${report.issuesFound.length} issues. Re-installing version...`;
        await this.versionInstaller.installVersion(versionId);
        report.repairsMade.push('Version re-installed successfully');
      } else {
        report.message = 'No issues found. Installation looks good!';
      }

      report.endTime = new Date().toISOString();
      report.success = true;

      return report;
    } catch (error) {
      report.errors.push(error.message);
      report.success = false;
      report.endTime = new Date().toISOString();
      return report;
    }
  }

  scanAllInstallations() {
    const results = [];
    if (!fs.existsSync(this.versionsDir)) return results;

    const versions = fs.readdirSync(this.versionsDir);
    for (const versionId of versions) {
      const versionDir = path.join(this.versionsDir, versionId);
      const versionJson = path.join(versionDir, `${versionId}.json`);
      const clientJar = path.join(versionDir, `${versionId}.jar`);

      results.push({
        versionId,
        hasJson: fs.existsSync(versionJson),
        hasJar: fs.existsSync(clientJar),
        jarSize: fs.existsSync(clientJar) ? fs.statSync(clientJar).size : 0,
        status: fs.existsSync(versionJson) && fs.existsSync(clientJar) ? 'ok' : 'corrupted'
      });
    }

    return results;
  }
}

module.exports = RepairManager;
