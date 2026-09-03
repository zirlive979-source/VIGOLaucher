# VIGOLauncher 🎮

> Launcher Minecraft Java Edition yang lengkap, open-source, dan modern

[![Build Status](https://github.com/vigolauncher/vigolauncher/actions/workflows/build.yml/badge.svg)](https://github.com/vigolauncher/vigolauncher/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](#)

VIGOLauncher adalah launcher Minecraft Java Edition yang dibangun dengan arsitektur **Launcher UI → Launcher Core → Java Runtime → Minecraft**. Bukan sekadar website yang berpura-pura menjalankan Minecraft, tapi benar-benar menjalankan game asli melalui Java Runtime.

## ✨ Fitur Utama

### 🎮 Game & Versi
- **Play Minecraft** — Jalankan versi pilihan dengan satu klik
- **Version Manager** — Lihat dan kelola semua versi terpasang
- **Version Installer** — Pasang versi baru langsung dari launcher
- **Snapshot Support** — Dukungan penuh versi snapshot
- **Forge Support** — Pasang & jalankan Forge
- **Fabric Support** — Pasang & jalankan Fabric
- **NeoForge Support** — Dukungan NeoForge terbaru

### 🧩 Modding
- **Mod Manager** — Pasang, hapus, aktifkan/nonaktifkan mod
- **Modpack Manager** — Impor/ekspor & kelola modpack
- **Resource Pack Manager** — Kelola resource pack

### 👤 Akun & Profil
- **Microsoft Account Login** — Login resmi OAuth Microsoft
- **Profile Manager** — Beberapa profil dengan konfigurasi berbeda
- **Offline Profile** — Mode offline untuk single player
- **Logout Account** — Keluar dari akun dengan aman

### ⚙️ Pengaturan
- **RAM Allocation** — Atur RAM dengan slider intuitif
- **Java Runtime Manager** — Pilih & deteksi otomatis Java
- **JVM Arguments** — Konfigurasi argumen JVM kustom
- **JVM Presets** — Preset performa (Tinggi, Seimbang, Hemat)
- **Game Directory** — Folder game kustom per profil
- **Resolution Settings** — Atur resolusi layar
- **Fullscreen Setting** — Mode layar penuh/windowed

### 📊 Monitoring & Maintenance
- **Download Manager** — Progress bar real-time
- **Game Console** — Lihat log Minecraft langsung
- **Crash Log Viewer** — Baca crash log dengan mudah
- **Repair Installation** — Perbaiki file rusak otomatis
- **Disk Usage** — Monitor penggunaan penyimpanan

### ✨ Tambahan
- **News Panel** — Berita Minecraft terbaru
- **Server List** — Simpan server favorit
- **Quick Server Join** — Masuk server cepat
- **Theme System** — Dark, Light, VIGO Blue, Emerald
- **Language System** — Indonesia & English
- **Auto Update Launcher** — Pembaruan otomatis
- **Backup Profile** — Backup & restore konfigurasi
- **Portable Mode** — Data tersimpan di folder launcher

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────┐
│         Launcher UI (Electron)          │
│    HTML / CSS / JavaScript Interface    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│            Launcher Core                 │
│  Node.js - Auth, Download, Mods, Config  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Java Runtime Manager           │
│    Deteksi & kelola Java installation    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│              Minecraft Game              │
│      Java Edition asli dari Mojang       │
└─────────────────────────────────────────┘
```

## 🚀 Memulai

### Prasyarat
- Node.js 18+
- npm atau yarn
- Java 8/17/21 (untuk menjalankan Minecraft)

### Instalasi Development

```bash
# Clone repository
git clone https://github.com/vigolauncher/vigolauncher.git
cd vigolauncher

# Install dependencies
npm install

# Jalankan dalam mode development
npm run dev

# Build untuk produksi
npm run build
```

### Build Platform Spesifik

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 🔧 GitHub Actions Workflow

Proyek ini sudah dilengkapi dengan GitHub Actions untuk build otomatis:

1. **Push ke branch main/master** → Build semua platform
2. **Push tag `v*`** → Build + Buat GitHub Release otomatis

File workflow: `.github/workflows/build.yml`

### Cara Mengaktifkan

1. Push kode ini ke repository GitHub Anda
2. Buka tab **Actions** di repository
3. Aktifkan GitHub Actions
4. Untuk membuat rilis:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
5. Workflow akan otomatis build dan membuat release

## 📦 Website Download

Website download resmi tersedia di folder `website/`. Untuk menghostingnya:

1. Aktifkan **GitHub Pages** di repository settings
2. Pilih source dari folder `website`
3. Atau hosting di layanan lain (Vercel, Netlify, dll)

## ⚠️ Catatan Penting tentang APK Android

**VIGOLauncher adalah aplikasi desktop (Windows/macOS/Linux), bukan APK Android.**

Alasan:
- Minecraft Java Edition membutuhkan **Java Runtime Environment** yang tidak berjalan langsung di Android
- Arsitektur CPU desktop (x86/x64) berbeda dengan Android (ARM)
- Launcher ini dibangun dengan **Electron** yang hanya mendukung desktop

Jika Anda ingin bermain Minecraft Java di Android, pertimbangkan:
- **PojavLauncher** — Launcher Java Edition khusus Android
- **Minecraft Bedrock Edition** — Versi resmi Android dari Google Play

## 📁 Struktur Proyek

```
vigolauncher/
├── .github/workflows/
│   └── build.yml              # GitHub Actions CI/CD
├── src/
│   ├── main.js                # Entry point Electron
│   ├── ui/                    # Layer UI
│   │   ├── index.html         # Halaman utama
│   │   ├── styles.css         # Styling
│   │   └── app.js             # Logika UI
│   └── core/                  # Layer Core
│       ├── LauncherCore.js    # Inti launcher
│       ├── AuthManager.js     # Autentikasi
│       ├── SettingsManager.js # Pengaturan
│       ├── ProfileManager.js  # Manajemen profil
│       ├── DownloadManager.js # Download manager
│       ├── ConsoleManager.js  # Konsol game
│       ├── NewsFetcher.js     # Pengambil berita
│       ├── ServerManager.js   # Daftar server
│       ├── BackupManager.js   # Backup & restore
│       ├── ThemeManager.js    # Sistem tema
│       ├── LanguageManager.js # Multi bahasa
│       ├── AutoUpdater.js     # Pembaruan otomatis
│       ├── RepairManager.js   # Perbaikan instalasi
│       ├── DiskUsageMonitor.js# Monitor disk
│       ├── auth/
│       │   └── AuthManager.js
│       ├── versions/
│       │   ├── VersionManager.js
│       │   └── VersionInstaller.js
│       ├── mods/
│       │   ├── ModManager.js
│       │   ├── ModpackManager.js
│       │   └── ResourcePackManager.js
│       └── runtime/
│           └── JavaRuntimeManager.js
├── assets/                    # Icon & asset
├── website/                   # Website download
│   └── index.html
├── package.json               # Konfigurasi npm
└── README.md                  # Dokumentasi ini
```

## 🤝 Kontribusi

Kontribusi sangat diterima! Cara berkontribusi:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detail.

## ⚖️ Disclaimer

VIGOLauncher adalah proyek komunitas independen dan **tidak berafiliasi** dengan Mojang Studios atau Microsoft.

Minecraft adalah merek dagang dari Mojang Studios / Microsoft. Anda tetap memerlukan akun Minecraft yang sah untuk bermain di server online.

---

Dibuat dengan ❤️ untuk komunitas Minecraft Indonesia dan dunia.
