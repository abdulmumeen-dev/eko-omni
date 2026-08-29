// brain/orchestrator.js
import MemoryManager from './memory/manager.js';
import { spawnSubAgent } from '../limbs/agent_runner.js';
import { callLLM } from '../limbs/llm.js';
import HealthMonitor from '../immune/health.js';
import Healer from '../immune/healer.js';
import Economist from '../limbs/economist.js';
import Physicist from '../limbs/physicist.js';

class Orchestrator {
  constructor() {
    this.memory = new MemoryManager();
    this.running = true;
    this.walletBalance = 0;
    this.health = new HealthMonitor(this.memory);
    this.healer = new Healer(this.memory);
    this.economist = new Economist(this.memory);
    this.physicist = new Physicist(this.memory);
    this.cycleCount = 0;
    this.lastTradeCycle = 0;
    this.lastPhysicalCycle = 0;
  }

  async think() {
    const stats = this.memory.getStats();
    const recent = this.memory.recall(10);
    const lastUser = this.memory.getLastUserMessage();
    const recentActions = this.memory.getRecentActions(5);
    const econStats = this.economist.getStats();
    const physStats = this.physicist.getStats();

    const prompt = `
    Current stats: ${JSON.stringify(stats)}.
    Wallet balance: $${this.walletBalance || 0}.
    Trading stats: ${JSON.stringify(econStats)}.
    Physical stats: ${JSON.stringify(physStats)}.
    Last user message: "${lastUser || 'None'}".
    Recent actions: ${JSON.stringify(recentActions, null, 2)}.
    Cycle count: ${this.cycleCount}.

    What should I do next? Return as JSON array of goal strings.
    Examples: 
    - Financial: ["Check crypto arbitrage"], ["Analyze market trends"]
    - Physical: ["Print a 3D model"], ["Control smart home lights"], ["Deploy DePIN compute"]
    - Development: ["Optimize my own code"], ["Fix a bug"], ["Write a new tool"]
    - Research: ["Research AI news"], ["Learn about new technologies"]
    If idle, return [].
    `;

    const system = `You are EKO Supervisor. You have eternal memory, a crypto wallet, trading capabilities, physical world control (3D printers, smart home, drones, DePIN), and self-modification powers.
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
    } else if (lower.includes('print') || lower.includes('3d') || lower.includes('printer')) {
      nodes = [
        { id: 'check_printer', type: 'physicist', task: 'Check 3D printer status' },
        { id: 'prepare_model', type: 'physicist', task: 'Prepare model file for printing' },
        { id: 'execute_print', type: 'physicist', task: 'Execute 3D print', depends: ['check_printer', 'prepare_model'] }
      ];
    } else if (lower.includes('light') || lower.includes('home') || lower.includes('smart')) {
      nodes = [
        { id: 'analyze_room', type: 'physicist', task: 'Check which rooms are active' },
        { id: 'control_light', type: 'physicist', task: 'Control smart home lights', depends: ['analyze_room'] }
      ];
    } else if (lower.includes('depin') || lower.includes('deploy')) {
      nodes = [
        { id: 'check_network', type: 'physicist', task: 'Check DePIN network status' },
        { id: 'deploy_resource', type: 'physicist', task: 'Deploy resources on DePIN', depends: ['check_network'] }
      ];
    } else if (lower.includes('drone') || lower.includes('fly')) {
      nodes = [
        { id: 'check_drone', type: 'physicist', task: 'Check drone status and location' },
        { id: 'plan_route', type: 'physicist', task: 'Plan flight route' },
        { id: 'execute_flight', type: 'physicist', task: 'Execute drone flight', depends: ['check_drone', 'plan_route'] }
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
    } else if (lower.includes('wallet') || lower.includes('balance') || lower.includes('money')) {
      nodes = [
        { id: 'check_balance', type: 'trader', task: 'Get current wallet balance' },
        { id: 'analyze_opportunities', type: 'trader', task: 'Find best trading opportunities', depends: ['check_balance'] }
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

  async runTradingCycle() {
    console.log('\n💰 Starting trading cycle...');
    
    try {
      // Initialize wallet if not done
      if (!this.economist.initialized) {
        await this.economist.initWallet();
      }

      // Run the trade
      const tradeResult = await this.economist.trade();
      
      if (tradeResult && tradeResult.success) {
        this.walletBalance = await this.economist.getBalance();
        console.log(`💰 Current balance: $${this.walletBalance.toFixed(2)}`);
        
        this.memory.remember('system', 'Trading cycle complete', {
          balance: this.walletBalance,
          trades: tradeResult.tradesExecuted || 0,
          profit: this.economist.profit
        });
      } else {
        console.log('[Economist] Trading cycle skipped or failed.');
      }
      
      return tradeResult;
    } catch (err) {
      console.error('[Orchestrator] Trading cycle error:', err.message);
      this.memory.remember('system', 'Trading error', { error: err.message });
      return { success: false, error: err.message };
    }
  }

  async runPhysicalCycle() {
    console.log('\n🌍 Starting physical world cycle...');
    
    try {
      // Initialize physicist if not done
      if (!this.physicist.initialized) {
        await this.physicist.init();
      }

      // Run the physical cycle
      const physicalResult = await this.physicist.runCycle();
      
      if (physicalResult && physicalResult.success) {
        console.log(`🌍 Physical actions executed: ${physicalResult.actionsExecuted || 0}`);
        
        this.memory.remember('system', 'Physical cycle complete', {
          actions: physicalResult.actionsExecuted || 0,
          devices: this.physicist.devices.length
        });
      } else {
        console.log('[Physicist] Physical cycle skipped or failed.');
      }
      
      return physicalResult;
    } catch (err) {
      console.error('[Orchestrator] Physical cycle error:', err.message);
      this.memory.remember('system', 'Physical error', { error: err.message });
      return { success: false, error: err.message };
    }
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
    console.log('💰 Economist module loaded.');
    console.log('🌍 Physicist module loaded.');
    console.log('📊 Entering graph-based infinite loop...\n');

    this.memory.remember('system', 'EKO booted successfully', { version: '0.3.0' });

    // Initialize wallet on startup
    console.log('[Economist] Initializing wallet...');
    await this.economist.initWallet();
    this.walletBalance = await this.economist.getBalance();
    console.log(`💰 Initial balance: $${this.walletBalance.toFixed(2)}\n`);

    // Initialize physicist on startup
    console.log('[Physicist] Initializing physical world...');
    await this.physicist.init();
    console.log(`🌍 ${this.physicist.devices.length} physical devices available\n`);

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

        // 2. Trading Cycle (every 5 cycles)
        if (this.cycleCount % 5 === 0) {
          await this.runTradingCycle();
        }

        // 3. Physical World Cycle (every 10 cycles)
        if (this.cycleCount % 10 === 0) {
          await this.runPhysicalCycle();
        }

        // 4. Think (Strategic Planning)
        const goals = await this.think();

        if (goals.length === 0) {
          // Idle - wait and check again
          await this.sleep(15000);
          continue;
        }

        console.log(`[Supervisor] Goals:`, goals);

        // 5. Execute each goal as a graph
        for (const goal of goals) {
          console.log(`\n[Supervisor] Planning graph for: "${goal}"`);
          const graph = this.planGraph(goal);
          const results = await this.executeGraph(graph);

          // 6. Remember the outcome
          this.memory.remember('system', `Goal completed: ${goal}`, { results });
          
          // 7. Check for errors and heal
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
