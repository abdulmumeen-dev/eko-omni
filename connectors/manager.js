// connectors/manager.js
import PublicAPIConnector from './public_apis.js';
import axios from 'axios';

class ConnectorManager {
  constructor(memory) {
    this.memory = memory;
    this.publicAPI = new PublicAPIConnector(memory);
    this.connections = [];
  }

  // Initialize connectors
  async init() {
    console.log('[Connectors] Initializing...');
    await this.publicAPI.fetchAPIs();
    console.log(`[Connectors] ✅ ${this.publicAPI.apiCache.length} APIs available`);
  }

  // Connect to a public API
  async connectToAPI(api) {
    console.log(`[Connectors] Connecting to: ${api.API}`);

    try {
      // Test if available
      const available = await this.publicAPI.testAPI(api);
      if (!available) {
        console.log(`[Connectors] ⚠️ ${api.API} not available`);
        return { success: false, reason: 'Unavailable' };
      }

      this.connections.push({
        name: api.API,
        url: api.Link,
        auth: api.Auth || 'none',
        connected: new Date().toISOString()
      });

      this.memory.remember('connector', `Connected to ${api.API}`, { api });
      console.log(`[Connectors] ✅ Connected to ${api.API}`);
      return { success: true, api };
    } catch (err) {
      console.error(`[Connectors] Failed to connect to ${api.API}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Get top APIs by category
  getAPIsByCategory(category) {
    return this.publicAPI.getAPIsByCategory(category);
  }

  // Search APIs
  searchAPIs(query) {
    return this.publicAPI.searchAPIs(query);
  }

  // Get all categories
  getCategories() {
    return this.publicAPI.getCategories();
  }

  // Get stats
  getStats() {
    return {
      totalAPIs: this.publicAPI.apiCache.length,
      connections: this.connections.length,
      categories: this.publicAPI.getCategories().length
    };
  }
}

export default ConnectorManager;
