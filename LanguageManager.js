const fs = require('fs-extra');
const path = require('path');

class LanguageManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.langFile = path.join(dataPath, 'language.json');
    this.currentLanguage = 'id';
    this.languages = {
      id: {
        name: 'Indonesia',
        flag: '🇮🇩',
        strings: {
          app: {
            name: 'VIGOLauncher',
            tagline: 'Launcher Minecraft Java Edition Terbaik'
          },
          nav: {
            home: 'Beranda',
            versions: 'Versi',
            mods: 'Mod',
            modpacks: 'Modpack',
            resourcepacks: 'Resource Pack',
            accounts: 'Akun',
            profiles: 'Profil',
            servers: 'Server',
            settings: 'Pengaturan',
            console: 'Konsol',
            news: 'Berita',
            downloads: 'Download'
          },
          home: {
            play: 'Mainkan Minecraft',
            selectVersion: 'Pilih Versi',
            quickJoin: 'Masuk Server Cepat',
            recentNews: 'Berita Terbaru',
            systemStatus: 'Status Sistem',
            diskUsage: 'Penggunaan Disk',
            ramAllocation: 'Alokasi RAM'
          },
          versions: {
            installed: 'Versi Terpasang',
            available: 'Versi Tersedia',
            snapshots: 'Snapshot',
            install: 'Pasang',
            installed: 'Terpasang',
            favorite: 'Favorit',
            forge: 'Forge',
            fabric: 'Fabric',
            neoforge: 'NeoForge',
            installForge: 'Pasang Forge',
            installFabric: 'Pasang Fabric',
            installNeoForge: 'Pasang NeoForge'
          },
          auth: {
            loginMicrosoft: 'Login dengan Microsoft',
            loginOffline: 'Mode Offline',
            username: 'Nama Pengguna',
            enterUsername: 'Masukkan nama pengguna...',
            logout: 'Keluar',
            loggedInAs: 'Masuk sebagai',
            notLoggedIn: 'Belum Masuk'
          },
          settings: {
            title: 'Pengaturan',
            ram: 'Alokasi RAM',
            ramDesc: 'Jumlah memori yang dialokasikan untuk Minecraft',
            java: 'Java Runtime',
            javaDesc: 'Pilih versi Java yang akan digunakan',
            autoDetect: 'Deteksi Otomatis',
            jvmArgs: 'Argumen JVM',
            jvmArgsDesc: 'Argumen tambahan untuk Java Virtual Machine',
            presets: 'Preset',
            gameDir: 'Folder Game',
            gameDirDesc: 'Lokasi penyimpanan data Minecraft',
            resolution: 'Resolusi',
            fullscreen: 'Layar Penuh',
            theme: 'Tema',
            language: 'Bahasa',
            autoUpdate: 'Pembaruan Otomatis',
            closeOnLaunch: 'Tutup Launcher Saat Main',
            showConsole: 'Tampilkan Konsol'
          },
          mods: {
            title: 'Manajer Mod',
            install: 'Pasang Mod',
            remove: 'Hapus',
            enable: 'Aktifkan',
            disable: 'Nonaktifkan',
            enabled: 'Aktif',
            disabled: 'Nonaktif',
            noMods: 'Belum ada mod yang terpasang'
          },
          modpacks: {
            title: 'Manajer Modpack',
            import: 'Impor Modpack',
            export: 'Ekspor Modpack',
            apply: 'Terapkan',
            delete: 'Hapus',
            create: 'Buat Modpack Baru'
          },
          servers: {
            title: 'Daftar Server',
            add: 'Tambah Server',
            remove: 'Hapus',
            join: 'Masuk',
            name: 'Nama Server',
            address: 'Alamat IP',
            port: 'Port',
            favorite: 'Favorit'
          },
          common: {
            save: 'Simpan',
            cancel: 'Batal',
            delete: 'Hapus',
            edit: 'Edit',
            refresh: 'Segarkan',
            loading: 'Memuat...',
            success: 'Berhasil',
            error: 'Kesalahan',
            confirm: 'Konfirmasi',
            close: 'Tutup',
            browse: 'Jelajahi',
            download: 'Unduh',
            installing: 'Memasang...',
            launching: 'Menjalankan...'
          }
        }
      },
      en: {
        name: 'English',
        flag: '🇬🇧',
        strings: {
          app: {
            name: 'VIGOLauncher',
            tagline: 'The Best Minecraft Java Edition Launcher'
          },
          nav: {
            home: 'Home',
            versions: 'Versions',
            mods: 'Mods',
            modpacks: 'Modpacks',
            resourcepacks: 'Resource Packs',
            accounts: 'Accounts',
            profiles: 'Profiles',
            servers: 'Servers',
            settings: 'Settings',
            console: 'Console',
            news: 'News',
            downloads: 'Downloads'
          },
          home: {
            play: 'Play Minecraft',
            selectVersion: 'Select Version',
            quickJoin: 'Quick Server Join',
            recentNews: 'Recent News',
            systemStatus: 'System Status',
            diskUsage: 'Disk Usage',
            ramAllocation: 'RAM Allocation'
          },
          versions: {
            installed: 'Installed Versions',
            available: 'Available Versions',
            snapshots: 'Snapshots',
            install: 'Install',
            installed: 'Installed',
            favorite: 'Favorite',
            forge: 'Forge',
            fabric: 'Fabric',
            neoforge: 'NeoForge',
            installForge: 'Install Forge',
            installFabric: 'Install Fabric',
            installNeoForge: 'Install NeoForge'
          },
          auth: {
            loginMicrosoft: 'Login with Microsoft',
            loginOffline: 'Offline Mode',
            username: 'Username',
            enterUsername: 'Enter username...',
            logout: 'Logout',
            loggedInAs: 'Logged in as',
            notLoggedIn: 'Not Logged In'
          },
          settings: {
            title: 'Settings',
            ram: 'RAM Allocation',
            ramDesc: 'Amount of memory allocated to Minecraft',
            java: 'Java Runtime',
            javaDesc: 'Select Java version to use',
            autoDetect: 'Auto Detect',
            jvmArgs: 'JVM Arguments',
            jvmArgsDesc: 'Additional arguments for Java Virtual Machine',
            presets: 'Presets',
            gameDir: 'Game Directory',
            gameDirDesc: 'Minecraft data storage location',
            resolution: 'Resolution',
            fullscreen: 'Fullscreen',
            theme: 'Theme',
            language: 'Language',
            autoUpdate: 'Auto Update',
            closeOnLaunch: 'Close Launcher on Play',
            showConsole: 'Show Console'
          },
          mods: {
            title: 'Mod Manager',
            install: 'Install Mod',
            remove: 'Remove',
            enable: 'Enable',
            disable: 'Disable',
            enabled: 'Enabled',
            disabled: 'Disabled',
            noMods: 'No mods installed yet'
          },
          modpacks: {
            title: 'Modpack Manager',
            import: 'Import Modpack',
            export: 'Export Modpack',
            apply: 'Apply',
            delete: 'Delete',
            create: 'Create New Modpack'
          },
          servers: {
            title: 'Server List',
            add: 'Add Server',
            remove: 'Remove',
            join: 'Join',
            name: 'Server Name',
            address: 'IP Address',
            port: 'Port',
            favorite: 'Favorite'
          },
          common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            refresh: 'Refresh',
            loading: 'Loading...',
            success: 'Success',
            error: 'Error',
            confirm: 'Confirm',
            close: 'Close',
            browse: 'Browse',
            download: 'Download',
            installing: 'Installing...',
            launching: 'Launching...'
          }
        }
      }
    };
    this.loadLanguage();
  }

  loadLanguage() {
    try {
      if (fs.existsSync(this.langFile)) {
        const data = fs.readJsonSync(this.langFile);
        if (this.languages[data.currentLanguage]) {
          this.currentLanguage = data.currentLanguage;
        }
      }
    } catch (e) {}
  }

  saveLanguage() {
    fs.writeJsonSync(this.langFile, { currentLanguage: this.currentLanguage }, { spaces: 2 });
  }

  getCurrentLanguage() {
    return {
      code: this.currentLanguage,
      name: this.languages[this.currentLanguage].name,
      flag: this.languages[this.currentLanguage].flag
    };
  }

  setLanguage(langCode) {
    if (this.languages[langCode]) {
      this.currentLanguage = langCode;
      this.saveLanguage();
      return this.getCurrentLanguage();
    }
    return null;
  }

  getAvailableLanguages() {
    return Object.entries(this.languages).map(([code, lang]) => ({
      code,
      name: lang.name,
      flag: lang.flag
    }));
  }

  getStrings() {
    return this.languages[this.currentLanguage].strings;
  }

  t(key) {
    const parts = key.split('.');
    let result = this.languages[this.currentLanguage].strings;
    for (const part of parts) {
      if (result && result[part]) {
        result = result[part];
      } else {
        return key;
      }
    }
    return result;
  }
}

module.exports = LanguageManager;
