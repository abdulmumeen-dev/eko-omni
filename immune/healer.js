// immune/healer.js
import fs from 'fs';
import path from 'path';
import { callLLM } from '../limbs/llm.js';

class Healer {
  constructor(memory) {
    this.memory = memory;
    this.healCount = 0;
    this.maxHealsPerHour = 10;
    this.healLog = [];
  }

  async heal(error, filePath) {
    console.log(`[Healer] Attempting to heal: ${filePath}`);

    // Check rate limit
    const now = Date.now();
    const recentHeals = this.healLog.filter(t => now - t < 3600000);
    if (recentHeals.length >= this.maxHealsPerHour) {
      console.log('[Healer] Rate limit reached. Skipping heal.');
      return { success: false, reason: 'Rate limit' };
    }

    try {
      // Read the broken file
      const fullPath = path.join(process.cwd(), filePath);
      const code = fs.readFileSync(fullPath, 'utf8');

      // Ask LLM to fix it
      const systemPrompt = `You are an expert developer. Fix the bug in this code.
        Return ONLY the complete fixed code. Do not add explanations.`;

      const userPrompt = `
        File: ${filePath}
        Error: ${error.message || error}
        Stack: ${error.stack || 'No stack'}

        Code:
        ${code}

        Fix the bug and return the complete corrected code.
      `;

      console.log('[Healer] Asking LLM to fix code...');
      const fixedCode = await callLLM(systemPrompt, userPrompt, null, 0.2);

      // Save the fixed code
      fs.writeFileSync(fullPath, fixedCode, 'utf8');

      this.healCount++;
      this.healLog.push(now);

      this.memory.remember('system', 'Healed', {
        file: filePath,
        healCount: this.healCount
      });

      console.log(`[Healer] ✅ Successfully healed: ${filePath}`);
      return { success: true, file: filePath };

    } catch (err) {
      console.error('[Healer] Failed to heal:', err);
      this.memory.remember('system', 'Heal failed', {
        file: filePath,
        error: err.message
      });
      return { success: false, error: err.message };
    }
  }

  async healModule(moduleName, error) {
    // Map module names to file paths
    const moduleMap = {
      'orchestrator': 'brain/orchestrator.js',
      'manager': 'brain/memory/manager.js',
      'llm': 'limbs/llm.js',
      'agent_runner': 'limbs/agent_runner.js'
    };

    const filePath = moduleMap[moduleName];
    if (!filePath) {
      console.log(`[Healer] No mapping for module: ${moduleName}`);
      return { success: false, reason: 'Unknown module' };
    }

    return await this.heal(error, filePath);
  }

  getStats() {
    return {
      totalHeals: this.healCount,
      recentHeals: this.healLog.slice(-5)
    };
  }
}

export default Healer;
