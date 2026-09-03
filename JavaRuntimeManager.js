const fs = require('fs-extra');
const path = require('path');
const { execSync, spawn } = require('child_process');

class JavaRuntimeManager {
  constructor() {
    this.runtimes = [];
    this.activeRuntime = null;
    this.detectJavaRuntimes();
  }

  detectJavaRuntimes() {
    this.runtimes = [];
    
    // Check common Java locations
    const commonPaths = this.getCommonJavaPaths();
    
    for (const javaPath of commonPaths) {
      if (fs.existsSync(javaPath)) {
        const version = this.getJavaVersion(javaPath);
        if (version) {
          this.runtimes.push({
            path: javaPath,
            version: version,
            architecture: this.getArchitecture(javaPath),
            isDefault: false
          });
        }
      }
    }

    // Check PATH
    try {
      const whichJava = process.platform === 'win32' 
        ? execSync('where java', { encoding: 'utf8' }).split('\n')[0].trim()
        : execSync('which java', { encoding: 'utf8' }).trim();
      
      if (whichJava && fs.existsSync(whichJava) && !this.runtimes.find(r => r.path === whichJava)) {
        const version = this.getJavaVersion(whichJava);
        if (version) {
          this.runtimes.push({
            path: whichJava,
            version: version,
            architecture: this.getArchitecture(whichJava),
            isDefault: true
          });
        }
      }
    } catch (e) {}

    // Set first as active if none set
    if (this.runtimes.length > 0 && !this.activeRuntime) {
      const defaultRuntime = this.runtimes.find(r => r.isDefault) || this.runtimes[0];
      this.activeRuntime = defaultRuntime.path;
    }

    return this.runtimes;
  }

  getCommonJavaPaths() {
    const paths = [];
    const platform = process.platform;

    if (platform === 'win32') {
      // Windows
      paths.push('C:\\Program Files\\Java\\jre-1.8\\bin\\java.exe');
      paths.push('C:\\Program Files\\Java\\jdk1.8.0_XXX\\bin\\java.exe');
      paths.push('C:\\Program Files\\Java\\jre-17\\bin\\java.exe');
      paths.push('C:\\Program Files\\Java\\jdk-17\\bin\\java.exe');
      paths.push('C:\\Program Files\\Java\\jre-21\\bin\\java.exe');
      paths.push('C:\\Program Files\\Java\\jdk-21\\bin\\java.exe');
      paths.push('C:\\Program Files (x86)\\Java\\jre-1.8\\bin\\java.exe');
      paths.push('C:\\Program Files (x86)\\Java\\jre-17\\bin\\java.exe');
      
      // Check all Java installations
      try {
        const javaDirs = fs.readdirSync('C:\\Program Files\\Java');
        for (const dir of javaDirs) {
          paths.push(`C:\\Program Files\\Java\\${dir}\\bin\\java.exe`);
        }
      } catch (e) {}
    } else if (platform === 'darwin') {
      // macOS
      paths.push('/Library/Java/JavaVirtualMachines/jdk1.8.0_XXX.jdk/Contents/Home/bin/java');
      paths.push('/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home/bin/java');
      paths.push('/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home/bin/java');
      paths.push('/usr/bin/java');
      
      try {
        const jvms = fs.readdirSync('/Library/Java/JavaVirtualMachines');
        for (const jvm of jvms) {
          paths.push(`/Library/Java/JavaVirtualMachines/${jvm}/Contents/Home/bin/java`);
        }
      } catch (e) {}
    } else {
      // Linux
      paths.push('/usr/lib/jvm/java-8-openjdk-amd64/bin/java');
      paths.push('/usr/lib/jvm/java-17-openjdk-amd64/bin/java');
      paths.push('/usr/lib/jvm/java-21-openjdk-amd64/bin/java');
      paths.push('/usr/bin/java');
      paths.push('/usr/lib/jvm/default-java/bin/java');
      
      try {
        const jvms = fs.readdirSync('/usr/lib/jvm');
        for (const jvm of jvms) {
          paths.push(`/usr/lib/jvm/${jvm}/bin/java`);
        }
      } catch (e) {}
    }

    return paths;
  }

  getJavaVersion(javaPath) {
    try {
      const output = spawn(javaPath, ['-version'], { encoding: 'utf8' });
      let stderr = '';
      
      return new Promise((resolve) => {
        output.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        output.on('close', () => {
          const match = stderr.match(/version "([^"]+)"/) || stderr.match(/version "([^"]+)"/);
          if (match) {
            resolve(match[1]);
          } else {
            resolve(null);
          }
        });
      });
    } catch (e) {
      return null;
    }
  }

  getArchitecture(javaPath) {
    try {
      // Simple heuristic based on path
      if (javaPath.includes('x86') || javaPath.includes('i386')) return '32-bit';
      if (javaPath.includes('amd64') || javaPath.includes('x64')) return '64-bit';
      return process.arch === 'x64' ? '64-bit' : '32-bit';
    } catch (e) {
      return 'Unknown';
    }
  }

  getRuntimes() {
    return this.runtimes;
  }

  setActiveRuntime(runtimePath) {
    if (this.runtimes.find(r => r.path === runtimePath)) {
      this.activeRuntime = runtimePath;
      return { success: true, activeRuntime: this.activeRuntime };
    }
    return { success: false, error: 'Runtime not found' };
  }

  getActiveRuntime() {
    return this.activeRuntime || (this.runtimes[0]?.path || null);
  }

  async downloadJavaRuntime(version) {
    // This would download Java from Adoptium or similar
    // For now, return a placeholder
    return {
      success: true,
      message: `Java ${version} download would start here. Please install Java manually from adoptium.net`,
      url: `https://adoptium.net/temurin/releases/?version=${version}`
    };
  }
}

module.exports = JavaRuntimeManager;
