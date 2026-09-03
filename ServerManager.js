const fs = require('fs-extra');
const path = require('path');

class ServerManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.serversFile = path.join(dataPath, 'servers.json');
    this.servers = [];
    this.loadServers();
  }

  loadServers() {
    try {
      if (fs.existsSync(this.serversFile)) {
        this.servers = fs.readJsonSync(this.serversFile);
      }
    } catch (e) {
      this.servers = [];
    }
  }

  saveServers() {
    fs.writeJsonSync(this.serversFile, this.servers, { spaces: 2 });
  }

  getServers() {
    return this.servers;
  }

  addServer(server) {
    const id = `server_${Date.now()}`;
    const newServer = {
      id,
      name: server.name || 'Unnamed Server',
      address: server.address || '',
      port: server.port || 25565,
      description: server.description || '',
      icon: server.icon || null,
      isFavorite: server.isFavorite || false,
      createdAt: new Date().toISOString(),
      lastJoined: null
    };

    this.servers.push(newServer);
    this.saveServers();
    return newServer;
  }

  removeServer(serverId) {
    const index = this.servers.findIndex(s => s.id === serverId);
    if (index !== -1) {
      this.servers.splice(index, 1);
      this.saveServers();
      return true;
    }
    return false;
  }

  updateServer(serverId, updates) {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      Object.assign(server, updates);
      this.saveServers();
      return server;
    }
    return null;
  }

  toggleFavorite(serverId) {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.isFavorite = !server.isFavorite;
      this.saveServers();
      return server;
    }
    return null;
  }

  markJoined(serverId) {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.lastJoined = new Date().toISOString();
      this.saveServers();
      return server;
    }
    return null;
  }

  getServerAddress(serverId) {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      return server.port === 25565 ? server.address : `${server.address}:${server.port}`;
    }
    return null;
  }
}

module.exports = ServerManager;
