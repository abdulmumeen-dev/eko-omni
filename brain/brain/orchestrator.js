// brain/orchestrator.js
import MemoryManager from './memory/manager.js';
import { spawnSubAgent } from '../limbs/agent_runner.js';
import { callLLM } from '../limbs/llm.js';
import HealthMonitor from '../immune/health.js';
import Healer from '../immune/healer.js';

class Orchestrator {
  constructor() {
    this.memory = new MemoryManager();
    this.running = true;
    this.walletBalance = 0;
    this.health = new HealthMonitor(this.memory);
    this.healer = new Healer(this.memory);
    this.cycleCount = 0;
  }

  async think() {
    const stats = this.memory.getStats();
    const recent = this.memory.recall(10);
    const lastUser = this.memory.getLastUserMessage();
    const recentActions = this.memory.getRecentActions(5);

    const prompt = `
    Current stats: ${JSON.stringify(stats)}.
    Wallet balance: $${this.walletBalance || 0}.
    Last user message: "${lastUser || 'None'}".
    Recent actions: ${JSON.stringify(recentActions, null, 2)}.
    Cycle count: ${this.cycleCount}.

    What should I do next? Return as JSON array of goal strings.
    Examples: ["Check crypto arbitrage"], ["Optimize my own code"], ["Research AI news"], ["Write a new tool"].
    If idle, return [].
    `;

    const system = `You are EKO Supervisor. You have eternal memory, a wallet, and self-modification powers.
      You think in goals. Always return a JSON array of strings: ["goal1", "goal2"].
      If nothing urgent, return [].
      Keep goals actionable and specific.`;

    try {
      const response = await callLLM(system, prompt, null, 0.2);
      const match = response.match(/\[[\s\S]*?\]/);
      if (match) return JSON.parse(match[0]);
      return [];
    } catch (err) {
      console.warn('[Orchestrator] Could not parse goals:', err.message);
      return [];
    }
  }

  planGraph(goal) {
    const lower = goal.toLowerCase();
    let nodes = [];

    if (lower.includes('arbitrage') || lower.includes('trade') || lower.includes('price') || lower.includes('crypto')) {
      nodes = [
        { id: 'fetch_btc', type: 'trader', task: 'Get current BTC price', pair: 'BTC/USD' },
        { id: 'fetch_eth', type: 'trader', task: 'Get current ETH price', pair: 'ETH/USD' },
        { id: 'compare', type: 'validator', task: 'Compare prices and suggest arbitrage', depends: ['fetch_btc', 'fetch_eth'] }
      ];
    } else if (lower.includes('research') || lower.includes('learn') || lower.includes('news')) {
      nodes = [
        { id: 'search_web', type: 'researcher', task: `Research: ${goal}` },
        { id: 'summarize', type: 'validator', task: 'Summarize findings into key takeaways', depends: ['search_web'] }
      ];
    } else if (lower.includes('code') || lower.includes('optimize') || lower.includes('fix') || lower.includes('write')) {
      nodes = [
        { id: 'analyze_code', type: 'coder', task: `Analyze codebase for: ${goal}` },
        { id: 'write_fix', type: 'coder', task: 'Write the actual code fix', depends: ['analyze_code'] },
        { id: 'validate_fix', type: 'validator', task: 'Check if the fix is correct and safe', depends: ['write_fix'] }
      ];
    } else {
      nodes = [
        { id: 'task_1', type: 'default', task: goal }
      ];
    }

    return { nodes };
  }

  async executeGraph(graph) {
    const results = {};
    const nodes = graph.nodes;

    while (Object.keys(results).length < nodes.length) {
      const ready = nodes.filter(n => 
        !results[n.id] && 
        (!n.depends || n.depends.every(d => results[d]))
      );

      if (ready.length === 0) {
        console.error('[Graph] Deadlock detected!');
        break;
      }

      console.log(`[Graph] Running ${ready.length} nodes in parallel...`);
      const jobs = ready.map(async (node) => {
        try {
          const result = await spawnSubAgent(node);
          results[node.id] = result;
          return result;
        } catch (err) {
          console.error(`[Graph] Node ${node.id} crashed:`, err.message);
          results[node.id] = { success: false, nodeId: node.id, error: err.message };
          
          // Try to heal the failed node
          await this.healer.healModule(node.type || 'default', err);
        }
      });

      await Promise.all(jobs);
    }

    return results;
  }

  async triggerHeal(errors) {
    console.log('[Immune] Healing triggered for:', errors);
    this.memory.remember('system', 'Heal triggered', { errors });
    
    for (const err of errors) {
      // Try to map the error to a module
      const moduleName = err.nodeId || 'unknown';
      const result = await this.healer.healModule(moduleName, err);
      
      if (result.success) {
        console.log(`[Immune] ✅ Successfully healed: ${moduleName}`);
        this.memory.remember('system', `Healed: ${moduleName}`, { result });
      } else {
        console.log(`[Immune] ❌ Failed to heal: ${moduleName}`);
        this.memory.remember('system', `Heal failed: ${moduleName}`, { error: result.error });
      }
    }
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async run() {
    console.log('🧠 EKO Orchestrator started. Eternal memory loaded.');
    console.log('🛡️ Immune system active.');
    console.log('📊 Entering graph-based infinite loop...\n');

    this.memory.remember('system', 'EKO booted successfully', { version: '0.1.1' });

    while (this.running) {
      this.cycleCount++;
      
      try {
        // 1. Health Check
        const healthStatus = this.health.check();
        if (!healthStatus.isHealthy) {
          console.log('[Health] ⚠️ System unhealthy:', healthStatus);
          this.memory.remember('system', 'Unhealthy', { healthStatus });
          
          // Attempt to heal the system
          if (healthStatus.cpuLoad > 5) {
            console.log('[Health] High CPU load detected. Attempting to optimize...');
            await this.healer.healModule('orchestrator', new Error('High CPU load'));
          }
        }

        // 2. Think (Strategic Planning)
        const goals = await this.think();

        if (goals.length === 0) {
          // Idle - wait and check again
          await this.sleep(15000);
          continue;
        }

        console.log(`[Supervisor] Goals:`, goals);

        // 3. Execute each goal as a graph
        for (const goal of goals) {
          console.log(`\n[Supervisor] Planning graph for: "${goal}"`);
          const graph = this.planGraph(goal);
          const results = await this.executeGraph(graph);

          // 4. Remember the outcome
          this.memory.remember('system', `Goal completed: ${goal}`, { results });
          
          // 5. Check for errors and heal
          const errors = Object.values(results).filter(r => r && !r.success);
          if (errors.length > 0) {
            await this.triggerHeal(errors);
          }
        }

        // Wait before next strategic cycle
        await this.sleep(5000);

      } catch (err) {
        console.error('[Orchestrator] Fatal error in main loop:', err);
        this.memory.remember('system', 'Fatal error', { error: err.message });
        
        // Try to heal the orchestrator itself
        const healed = await this.healer.healModule('orchestrator', err);
        if (healed.success) {
          console.log('[Orchestrator] ✅ Self-healed successfully. Continuing...');
        } else {
          console.log('[Orchestrator] ❌ Self-heal failed. Backing off...');
          await this.sleep(60000); // Wait 1 minute before retrying
        }
      }
    }
  }

  // Graceful shutdown
  shutdown() {
    console.log('\n🛑 Shutting down EKO gracefully...');
    this.running = false;
    if (this.memory) this.memory.close();
    console.log('✅ EKO shut down. Goodbye.');
  }
}

export default Orchestrator;
