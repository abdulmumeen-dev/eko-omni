// brain/orchestrator.js
import MemoryManager from './memory/manager.js';
import { spawnSubAgent } from '../limbs/agent_runner.js';
import { callLLM } from '../limbs/llm.js';

class Orchestrator {
  constructor() {
    this.memory = new MemoryManager();
    this.running = true;
    this.walletBalance = 0;
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
        const result = await spawnSubAgent(node);
        results[node.id] = result;
        return result;
      });

      await Promise.all(jobs);
    }

    return results;
  }

  async triggerHeal(errors) {
    console.log('[Immune] Healing triggered for:', errors);
    this.memory.remember('system', 'Heal triggered', { errors });
    
    for (const err of errors) {
      await this.memory.remember('system', 'Healing attempt', { 
        nodeId: err.nodeId, 
        error: err.error 
      });
    }
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async run() {
    console.log('🧠 EKO Orchestrator started. Eternal memory loaded.');
    console.log('📊 Entering graph-based infinite loop...\n');

    this.memory.remember('system', 'EKO booted successfully', { version: '0.1.0' });

    while (this.running) {
      try {
        const goals = await this.think();

        if (goals.length === 0) {
          await this.sleep(15000);
          continue;
        }

        console.log(`[Supervisor] Goals:`, goals);

        for (const goal of goals) {
          console.log(`\n[Supervisor] Planning graph for: "${goal}"`);
          const graph = this.planGraph(goal);
          const results = await this.executeGraph(graph);

          this.memory.remember('system', `Goal completed: ${goal}`, { results });
          
          const errors = Object.values(results).filter(r => r && !r.success);
          if (errors.length > 0) {
            await this.triggerHeal(errors);
          }
        }

        await this.sleep(5000);

      } catch (err) {
        console.error('[Orchestrator] Fatal error:', err);
        this.memory.remember('system', 'Fatal error', { error: err.message });
        await this.sleep(30000);
      }
    }
  }
}

export default Orchestrator;
