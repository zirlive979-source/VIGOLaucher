const { EventEmitter } = require('events');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class DownloadManager extends EventEmitter {
  constructor() {
    super();
    this.activeDownloads = new Map();
    this.downloadHistory = [];
  }

  async download(url, destPath, options = {}) {
    const downloadId = options.id || `download_${Date.now()}`;
    const downloadInfo = {
      id: downloadId,
      name: options.name || path.basename(destPath),
      url,
      destPath,
      progress: 0,
      speed: 0,
      downloaded: 0,
      total: 0,
      status: 'downloading',
      startTime: Date.now()
    };

    this.activeDownloads.set(downloadId, downloadInfo);
    this.emit('start', downloadInfo);

    try {
      fs.ensureDirSync(path.dirname(destPath));

      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        maxRedirects: 5
      });

      const totalSize = parseInt(response.headers['content-length'] || '0');
      downloadInfo.total = totalSize;

      const writer = fs.createWriteStream(destPath);
      let downloaded = 0;
      let lastUpdate = Date.now();
      let lastDownloaded = 0;

      response.data.on('data', (chunk) => {
        downloaded += chunk.length;
        downloadInfo.downloaded = downloaded;
        
        if (totalSize > 0) {
          downloadInfo.progress = Math.round((downloaded / totalSize) * 100);
        }

        // Calculate speed
        const now = Date.now();
        if (now - lastUpdate > 500) {
          const elapsed = (now - lastUpdate) / 1000;
          downloadInfo.speed = (downloaded - lastDownloaded) / elapsed;
          lastUpdate = now;
          lastDownloaded = downloaded;
        }

        if (!options.silent) {
          this.emit('progress', { ...downloadInfo });
        }
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          downloadInfo.status = 'completed';
          downloadInfo.progress = 100;
          this.activeDownloads.delete(downloadId);
          this.downloadHistory.push({ ...downloadInfo, endTime: Date.now() });
          this.emit('complete', { ...downloadInfo });
          resolve({ success: true, path: destPath, downloadInfo });
        });

        writer.on('error', (err) => {
          downloadInfo.status = 'failed';
          downloadInfo.error = err.message;
          this.activeDownloads.delete(downloadId);
          this.emit('error', { ...downloadInfo, error: err.message });
          reject(err);
        });

        response.data.on('error', (err) => {
          writer.destroy();
          downloadInfo.status = 'failed';
          downloadInfo.error = err.message;
          this.activeDownloads.delete(downloadId);
          reject(err);
        });
      });
    } catch (error) {
      downloadInfo.status = 'failed';
      downloadInfo.error = error.message;
      this.activeDownloads.delete(downloadId);
      this.emit('error', { ...downloadInfo, error: error.message });
      throw error;
    }
  }

  getActiveDownloads() {
    return Array.from(this.activeDownloads.values());
  }

  cancelDownload(downloadId) {
    const download = this.activeDownloads.get(downloadId);
    if (download) {
      // In a real implementation, we would abort the axios request
      download.status = 'cancelled';
      this.activeDownloads.delete(downloadId);
      this.emit('cancelled', download);
      return true;
    }
    return false;
  }

  getDownloadHistory() {
    return this.downloadHistory;
  }
}

module.exports = DownloadManager;
