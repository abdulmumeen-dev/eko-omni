// limbs/browser.js
import { callLLM } from './llm.js';

class Browser {
  constructor(memory) {
    this.memory = memory;
    this.tabs = [];
    this.history = [];
    this.maxTabs = 5;
  }

  // Open a URL
  async open(url) {
    console.log(`[Browser] Opening: ${url}`);

    if (this.tabs.length >= this.maxTabs) {
      // Close the oldest tab
      this.tabs.shift();
    }

    const tab = {
      id: 'tab_' + Date.now(),
      url,
      opened: new Date().toISOString(),
      content: null
    };

    // In production: use puppeteer/playwright
    // For now: simulate
    await this.sleep(1000);
    tab.content = `Simulated content from ${url}`;

    this.tabs.push(tab);
    this.history.push({ url, timestamp: new Date().toISOString() });
    this.memory.remember('system', `Browsed: ${url}`, { url });

    console.log(`[Browser] ✅ Tab opened: ${tab.id}`);
    return tab;
  }

  // Extract data from current tab
  async extract(tabId, selector) {
    console.log(`[Browser] Extracting from tab: ${tabId}`);

    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) {
      console.log('[Browser] Tab not found.');
      return null;
    }

    // In production: parse DOM
    // For now: simulate with LLM
    const prompt = `
    Extract information from this content:
    ${tab.content}

    Return a JSON object with extracted data.
    `;

    try {
      const response = await callLLM(
        'You extract structured data from content.',
        prompt,
        null,
        0.2
      );
      let data;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) data = JSON.parse(match[0]);
      } catch {
        data = { content: tab.content };
      }
      return data;
    } catch (err) {
      console.error('[Browser] Extraction failed:', err.message);
      return null;
    }
  }

  // Close tab
  close(tabId) {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index > -1) {
      this.tabs.splice(index, 1);
      console.log(`[Browser] Closed tab: ${tabId}`);
      return true;
    }
    return false;
  }

  // Get current tabs
  getTabs() {
    return this.tabs;
  }

  // Get history
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  // Search the web
  async search(query) {
    console.log(`[Browser] Searching: ${query}`);

    // In production: use search API
    // For now: simulate
    const results = [
      { title: 'Result 1', url: 'https://example.com/1' },
      { title: 'Result 2', url: 'https://example.com/2' },
      { title: 'Result 3', url: 'https://example.com/3' }
    ];

    this.memory.remember('system', `Searched: ${query}`, { results });
    return results;
  }

  // Get stats
  getStats() {
    return {
      tabs: this.tabs.length,
      maxTabs: this.maxTabs,
      history: this.history.length
    };
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

export default Browser;
