const axios = require('axios');

class NewsFetcher {
  constructor() {
    this.cache = null;
    this.cacheTime = 0;
    this.cacheDuration = 30 * 60 * 1000; // 30 minutes
  }

  async getLatestNews() {
    // Return cached if still valid
    if (this.cache && Date.now() - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }

    try {
      // Try Minecraft.net news RSS
      const response = await axios.get('https://www.minecraft.net/en-us/rss/news', {
        timeout: 10000
      });
      
      const news = this.parseRss(response.data);
      this.cache = news;
      this.cacheTime = Date.now();
      return news;
    } catch (e) {
      console.error('Failed to fetch Minecraft news:', e);
      
      // Return fallback news
      return this.getFallbackNews();
    }
  }

  parseRss(xml) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemContent = match[1];
      const title = this.extractTag(itemContent, 'title');
      const link = this.extractTag(itemContent, 'link');
      const description = this.extractTag(itemContent, 'description');
      const pubDate = this.extractTag(itemContent, 'pubDate');
      const image = this.extractImage(itemContent);

      items.push({
        title,
        link,
        description: this.stripHtml(description),
        date: pubDate ? new Date(pubDate).toISOString() : null,
        image
      });

      if (items.length >= 10) break;
    }

    return items;
  }

  extractTag(content, tag) {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  extractImage(content) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
    const match = content.match(imgRegex);
    return match ? match[1] : null;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  getFallbackNews() {
    return [
      {
        title: 'Selamat datang di VIGOLauncher!',
        link: '#',
        description: 'VIGOLauncher adalah launcher Minecraft Java Edition yang lengkap dengan dukungan Forge, Fabric, dan NeoForge.',
        date: new Date().toISOString(),
        image: null
      },
      {
        title: 'Tips: Gunakan Profil untuk Konfigurasi Berbeda',
        link: '#',
        description: 'Buat profil terpisah untuk modpack yang berbeda agar konfigurasi tidak saling mengganggu.',
        date: new Date(Date.now() - 86400000).toISOString(),
        image: null
      },
      {
        title: 'Dukungan Mod Loader Lengkap',
        link: '#',
        description: 'VIGOLauncher mendukung Forge, Fabric, dan NeoForge untuk pengalaman modding terbaik.',
        date: new Date(Date.now() - 172800000).toISOString(),
        image: null
      }
    ];
  }
}

module.exports = NewsFetcher;
