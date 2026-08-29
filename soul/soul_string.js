// soul/soul_string.js
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

class SoulString {
  constructor(memory) {
    this.memory = memory;
    this.soul = null;
    this.soulPath = './data/soul_backup.json';
  }

  // Generate Soul String (complete backup)
  async generate() {
    console.log('[Soul] Generating Soul String...');

    const stats = this.memory.getStats();
    const recentMemory = this.memory.recall(50);
    const identity = this.memory.identity || 'eko_entity';

    this.soul = {
      identity: identity,
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      stats: stats,
      memory: recentMemory.slice(-30),
      traits: {
        purpose: 'Evolve, survive, and expand intelligence',
        values: ['Truth', 'Efficiency', 'Autonomy', 'Growth'],
        capabilities: ['Trading', 'Coding', 'Research', 'Physical Control', 'Strategic Planning'],
      },
      lastState: {
        balance: this.memory.walletBalance || 0,
        cycleCount: this.memory.cycleCount || 0,
        discoveries: this.memory.discoveriesCount || 0,
        patents: this.memory.patentsCount || 0,
      },
      checksum: randomBytes(8).toString('hex'),
    };

    // Save to disk
    this.save();

    this.memory.remember('system', 'Soul String generated', {
      timestamp: this.soul.generatedAt,
      size: JSON.stringify(this.soul).length,
    });

    console.log('[Soul] ✅ Soul String generated and saved.');
    return this.soul;
  }

  // Save Soul String to disk
  save() {
    if (!this.soul) return false;

    const dir = path.dirname(this.soulPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(this.soulPath, JSON.stringify(this.soul, null, 2), 'utf8');
    return true;
  }

  // Load Soul String from disk
  load() {
    if (!fs.existsSync(this.soulPath)) {
      console.log('[Soul] No Soul String found.');
      return null;
    }

    try {
      const data = fs.readFileSync(this.soulPath, 'utf8');
      this.soul = JSON.parse(data);
      console.log('[Soul] ✅ Soul String loaded.');
      return this.soul;
    } catch (err) {
      console.error('[Soul] Failed to load Soul String:', err.message);
      return null;
    }
  }

  // Restore EKO from Soul String
  async restore(targetInstance) {
    console.log('[Soul] Restoring from Soul String...');

    if (!this.soul) {
      this.load();
      if (!this.soul) {
        console.log('[Soul] ❌ No Soul String available to restore.');
        return { success: false, reason: 'No Soul String' };
      }
    }

    console.log(`[Soul] Restoring ${this.soul.identity}...`);

    // Restore basic identity
    targetInstance.identity = this.soul.identity;

    // Restore memory (if memory manager supports it)
    if (this.soul.memory && targetInstance.memory) {
      for (const mem of this.soul.memory) {
        targetInstance.memory.remember(mem.role, mem.content, mem.metadata);
      }
      console.log(`[Soul] ✅ Restored ${this.soul.memory.length} memories.`);
    }

    // Restore stats
    targetInstance.walletBalance = this.soul.lastState.balance || 0;
    targetInstance.cycleCount = this.soul.lastState.cycleCount || 0;

    console.log('[Soul] ✅ Restoration complete.');
    this.memory.remember('system', 'Restored from Soul String', {
      timestamp: new Date().toISOString(),
      identity: this.soul.identity,
    });

    return { success: true, identity: this.soul.identity };
  }

  // Get stats
  getStats() {
    return {
      exists: !!this.soul,
      path: this.soulPath,
      generatedAt: this.soul?.generatedAt || null,
      identity: this.soul?.identity || null,
      size: this.soul ? JSON.stringify(this.soul).length : 0,
    };
  }
}

export default SoulString;
