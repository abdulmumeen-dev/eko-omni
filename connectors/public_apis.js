// connectors/public_apis.js
import axios from 'axios';

class PublicAPIConnector {
  constructor(memory) {
    this.memory = memory;
    this.apiCache = [];
    this.lastFetch = null;
  }

  // Fetch all public APIs from the directory
  async fetchAPIs() {
    console.log('[Connectors] Fetching public APIs...');

    try {
      const response = await axios.get('https://api.publicapis.org/entries', {
        timeout: 10000
      });

      this.apiCache = response.data.entries || [];
      this.lastFetch = new Date().toISOString();
      console.log(`[Connectors] ✅ Found ${this.apiCache.length} public APIs`);
      return this.apiCache;
    } catch (err) {
      console.error('[Connectors] Failed to fetch APIs:', err.message);
      // Use fallback local list
      this.apiCache = this.getFallbackAPIs();
      return this.apiCache;
    }
  }

  // Filter APIs by category
  getAPIsByCategory(category) {
    if (!this.apiCache) return [];
    return this.apiCache.filter(api => 
      api.Category && api.Category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get all unique categories
  getCategories() {
    if (!this.apiCache) return [];
    const categories = this.apiCache.map(api => api.Category).filter(Boolean);
    return [...new Set(categories)];
  }

  // Search APIs by name or description
  searchAPIs(query) {
    if (!this.apiCache) return [];
    const lower = query.toLowerCase();
    return this.apiCache.filter(api =>
      (api.API && api.API.toLowerCase().includes(lower)) ||
      (api.Description && api.Description.toLowerCase().includes(lower))
    );
  }

  // Get APIs by authentication type
  getAPIsByAuth(authType) {
    if (!this.apiCache) return [];
    return this.apiCache.filter(api => api.Auth === authType);
  }

  // Test if an API is available
  async testAPI(api) {
    try {
      if (!api.Link) return false;
      const response = await axios.get(api.Link, {
        timeout: 5000,
        validateStatus: () => true
      });
      return response.status < 400;
    } catch {
      return false;
    }
  }

  // Get popular/categorized APIs
  getTopAPIs(limit = 20) {
    if (!this.apiCache) return [];
    const sorted = [...this.apiCache].sort((a, b) => {
      const scoreA = (a.HTTPS ? 2 : 0) + (a.Auth === '' ? 1 : 0);
      const scoreB = (b.HTTPS ? 2 : 0) + (b.Auth === '' ? 1 : 0);
      return scoreB - scoreA;
    });
    return sorted.slice(0, limit);
  }

  getFallbackAPIs() {
    return [
      { API: 'GitHub API', Description: 'GitHub public API', Category: 'Development', HTTPS: true, Auth: 'OAuth', Link: 'https://api.github.com' },
      { API: 'Wikipedia', Description: 'Wikipedia API', Category: 'Reference', HTTPS: true, Auth: '', Link: 'https://en.wikipedia.org/w/api.php' },
      { API: 'News API', Description: 'News articles API', Category: 'News', HTTPS: true, Auth: 'apiKey', Link: 'https://newsapi.org' },
      { API: 'OpenWeatherMap', Description: 'Weather API', Category: 'Weather', HTTPS: true, Auth: 'apiKey', Link: 'https://openweathermap.org/api' },
      { API: 'CoinGecko', Description: 'Cryptocurrency API', Category: 'Finance', HTTPS: true, Auth: 'apiKey', Link: 'https://coingecko.com/api' },
    ];
  }

  getStats() {
    return {
      total: this.apiCache ? this.apiCache.length : 0,
      categories: this.getCategories().length,
      lastFetch: this.lastFetch
    };
  }
}

export default PublicAPIConnector;
