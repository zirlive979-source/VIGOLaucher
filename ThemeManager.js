const fs = require('fs-extra');
const path = require('path');

class ThemeManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.themeFile = path.join(dataPath, 'theme.json');
    this.currentTheme = 'dark';
    this.themes = {
      dark: {
        name: 'Dark',
        variables: {
          '--bg-primary': '#1a1a2e',
          '--bg-secondary': '#16213e',
          '--bg-tertiary': '#0f3460',
          '--bg-card': '#1e2a4a',
          '--bg-hover': '#2a3a5c',
          '--text-primary': '#ffffff',
          '--text-secondary': '#a0aec0',
          '--text-muted': '#718096',
          '--accent': '#e94560',
          '--accent-hover': '#ff6b81',
          '--success': '#48bb78',
          '--warning': '#ecc94b',
          '--error': '#fc8181',
          '--border': '#2d3748',
          '--border-light': '#4a5568'
        }
      },
      light: {
        name: 'Light',
        variables: {
          '--bg-primary': '#f7fafc',
          '--bg-secondary': '#edf2f7',
          '--bg-tertiary': '#e2e8f0',
          '--bg-card': '#ffffff',
          '--bg-hover': '#e2e8f0',
          '--text-primary': '#1a202c',
          '--text-secondary': '#4a5568',
          '--text-muted': '#718096',
          '--accent': '#e94560',
          '--accent-hover': '#c5304d',
          '--success': '#38a169',
          '--warning': '#d69e2e',
          '--error': '#e53e3e',
          '--border': '#cbd5e0',
          '--border-light': '#e2e8f0'
        }
      },
      'vigo-blue': {
        name: 'VIGO Blue',
        variables: {
          '--bg-primary': '#0c1445',
          '--bg-secondary': '#1a237e',
          '--bg-tertiary': '#283593',
          '--bg-card': '#1e2a6a',
          '--bg-hover': '#303f9f',
          '--text-primary': '#ffffff',
          '--text-secondary': '#b3b9ff',
          '--text-muted': '#7986cb',
          '--accent': '#00bcd4',
          '--accent-hover': '#26c6da',
          '--success': '#00e676',
          '--warning': '#ffc107',
          '--error': '#ff5252',
          '--border': '#3949ab',
          '--border-light': '#5c6bc0'
        }
      },
      'emerald': {
        name: 'Emerald',
        variables: {
          '--bg-primary': '#0d1f17',
          '--bg-secondary': '#143024',
          '--bg-tertiary': '#1b4332',
          '--bg-card': '#1e4a36',
          '--bg-hover': '#2d6a4f',
          '--text-primary': '#ffffff',
          '--text-secondary': '#b7e4c7',
          '--text-muted': '#74c69d',
          '--accent': '#40916c',
          '--accent-hover': '#52b788',
          '--success': '#95d5b2',
          '--warning': '#d4a373',
          '--error': '#e76f51',
          '--border': '#2d6a4f',
          '--border-light': '#40916c'
        }
      }
    };
    this.loadTheme();
  }

  loadTheme() {
    try {
      if (fs.existsSync(this.themeFile)) {
        const data = fs.readJsonSync(this.themeFile);
        if (this.themes[data.currentTheme]) {
          this.currentTheme = data.currentTheme;
        }
      }
    } catch (e) {}
  }

  saveTheme() {
    fs.writeJsonSync(this.themeFile, { currentTheme: this.currentTheme }, { spaces: 2 });
  }

  getCurrentTheme() {
    return {
      name: this.currentTheme,
      ...this.themes[this.currentTheme]
    };
  }

  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this.saveTheme();
      return this.getCurrentTheme();
    }
    return null;
  }

  getAvailableThemes() {
    return Object.entries(this.themes).map(([key, theme]) => ({
      id: key,
      name: theme.name
    }));
  }

  getCssVariables(themeName) {
    const theme = this.themes[themeName || this.currentTheme];
    if (!theme) return '';
    
    return Object.entries(theme.variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
  }
}

module.exports = ThemeManager;
