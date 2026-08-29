// plugins/loader.js
import fs from 'fs';
import path from 'path';

class PluginLoader {
  constructor(memory) {
    this.memory = memory;
    this.plugins = [];
    this.registryPath = './plugins/registry.json';
  }

  // Load all plugins from registry
  loadPlugins() {
    console.log('[Plugins] Loading plugins...');

    try {
      const data = fs.readFileSync(this.registryPath, 'utf8');
      const registry = JSON.parse(data);
      this.plugins = registry.plugins || [];
      console.log(`[Plugins] ✅ Loaded ${this.plugins.length} plugins`);
      return this.plugins;
    } catch (err) {
      console.error('[Plugins] Failed to load registry:', err.message);
      return [];
    }
  }

  // Get all skill names from plugins
  getAvailableSkills() {
    const skills = [];
    for (const plugin of this.plugins) {
      if (plugin.skills) {
        skills.push(...plugin.skills);
      }
    }
    return skills;
  }

  // Get plugins by hook
  getPluginsByHook(hook) {
    return this.plugins.filter(p => p.hooks && p.hooks.includes(hook));
  }

  // Execute a plugin hook
  async executeHook(hook, context) {
    const plugins = this.getPluginsByHook(hook);
    if (plugins.length === 0) return context;

    console.log(`[Plugins] Executing hook: ${hook} (${plugins.length} plugins)`);

    for (const plugin of plugins) {
      try {
        // Import plugin dynamically
        const modulePath = `./${plugin.id}/${plugin.id}.js`;
        // For now, just log
        console.log(`  [Plugin] ${plugin.name} executed`);
      } catch (err) {
        console.error(`  [Plugin] ${plugin.name} failed:`, err.message);
      }
    }

    return context;
  }
}

export default PluginLoader;
