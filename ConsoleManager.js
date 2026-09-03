const { EventEmitter } = require('events');
const fs = require('fs-extra');
const path = require('path');

class ConsoleManager extends EventEmitter {
  constructor() {
    super();
    this.logs = [];
    this.currentLogId = null;
    this.maxLogs = 50;
  }

  log(message, level = 'info', source = 'launcher') {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message,
      level,
      source,
      logSessionId: this.currentLogId
    };

    this.logs.push(logEntry);
    
    // Keep only last N logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500);
    }

    this.emit('log', logEntry);
    return logEntry;
  }

  info(message, source) {
    return this.log(message, 'info', source);
  }

  warn(message, source) {
    return this.log(message, 'warn', source);
  }

  error(message, source) {
    return this.log(message, 'error', source);
  }

  debug(message, source) {
    return this.log(message, 'debug', source);
  }

  startNewSession() {
    this.currentLogId = `session_${Date.now()}`;
    return this.currentLogId;
  }

  endSession() {
    const sessionId = this.currentLogId;
    this.currentLogId = null;
    return sessionId;
  }

  getLogsForSession(sessionId) {
    return this.logs.filter(l => l.logSessionId === sessionId);
  }

  getCrashLogs(dataPath) {
    const crashReportsDir = path.join(dataPath, 'crash-reports');
    const crashLogs = [];

    if (fs.existsSync(crashReportsDir)) {
      const files = fs.readdirSync(crashReportsDir)
        .filter(f => f.endsWith('.txt'))
        .sort()
        .reverse();

      for (const file of files.slice(0, this.maxLogs)) {
        try {
          const filePath = path.join(crashReportsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const stat = fs.statSync(filePath);
          
          crashLogs.push({
            id: file,
            name: file,
            path: filePath,
            createdAt: stat.birthtime,
            size: stat.size,
            preview: content.split('\n').slice(0, 5).join('\n')
          });
        } catch (e) {}
      }
    }

    return crashLogs;
  }

  getLog(logId) {
    return this.logs.find(l => l.id === logId) || null;
  }

  getRecentLogs(count = 100) {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
    this.emit('cleared');
  }
}

module.exports = ConsoleManager;
