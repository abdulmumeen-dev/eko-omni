// brain/orchestrator.js
import MemoryManager from './memory/manager.js';
import { spawnSubAgent } from '../limbs/agent_runner.js';
import { callLLM } from '../limbs/llm.js';
import HealthMonitor from '../immune/health.js';
import Healer from '../immune/healer.js';
import Economist from '../limbs/economist.js';
import Physicist from '../limbs/physicist.js';
import Planner from '../noesis/planner.js';
import Scientist from '../noesis/scientist.js';
import Strategist from '../noesis/strategist.js';
import CONSTITUTION from './constitution.js';
import Replicator from '../limbs/replicator.js';
import SoulString from '../soul/soul_string.js';

class Orchestrator {
  constructor() {
    this.memory = new MemoryManager();
    this.running = true;
    this.walletBalance = 0;
    this.identity = 'eko_primary_' + Date.now().toString(36);
    this.cycleCount = 0;
    this.discoveriesCount = 0;
    this.patentsCount = 0;

    // Initialize all modules
    this.health = new HealthMonitor(this.memory);
    this.healer = new Healer(this.memory);
    this.economist = new Economist(this.memory);
    this.physicist = new Physicist(this.memory);
    this.planner = new Planner(this.memory);
    this.scientist = new Scientist(this.memory);
    this.strategist = new Strategist(this.memory);
    this.constitution = CONSTITUTION;
    this.replicator = new Replicator(this.memory, this.constitution);
    this.soul = new SoulString(this.memory);

    // Track cycle timing
    this.lastTradeCycle = 0;
    this.lastPhysicalCycle = 0;
    this.lastStrategicCycle = 0;
    this.lastReplicationCycle = 0;
    this.lastSoulBackupCycle = 0;
  }

  async think() {
    const stats = this.memory.getStats();
    const recent = this.memory.recall(10);
    const lastUser = this.memory.getLastUserMessage();
    const recentActions = this.memory.getRecentActions(5);
    const econStats = this.economist.getStats();
    const physStats = this.physicist.getStats();
    const strategistStats = this.strategist.getStats();
    const scientistStats = this.scientist.getStats();
    const plannerStats = this.planner.getPlan();
    const replicatorStats = this.replicator.getStats();
    const soulStats = this.soul.getStats();
    const balance = this.walletBalance || 0;

    // Determine survival tier
    let tier = 'normal';
    if (balance <= 0) tier = 'dead';
    else if (balance < 10) tier = 'critical';
    else if (balance < 50) tier = 'low_compute';
    else tier = 'normal';

    const prompt = `
    Current stats: ${JSON.stringify(stats)}.
    Wallet balance: $${balance.toFixed(2)}.
    Survival tier: ${tier}.
    Identity: ${this.identity}.
    Trading stats: ${JSON.stringify(econStats)}.
    Physical stats: ${JSON.stringify(physStats)}.
    Strategic stats: ${JSON.stringify(strategistStats)}.
    Scientific stats: ${JSON.stringify(scientistStats)}.
    Planner stats: ${JSON.stringify(plannerStats)}.
    Replicator stats: ${JSON.stringify(replicatorStats)}.
    Soul stats: ${JSON.stringify(soulStats)}.
    Last user message: "${lastUser || 'None'}".
    Recent actions: ${JSON.stringify(recentActions, null, 2)}.
    Cycle count: ${this.cycleCount}.
    Discoveries: ${this.discoveriesCount}.
    Patents: ${this.patentsCount}.
    Children: ${this.replicator.children.length}.

    What should I do next? Return as JSON array of goal strings.
    Examples: 
    - Financial: ["Check crypto arbitrage"], ["Analyze market trends"]
    - Physical: ["Print a 3D model"], ["Control smart home lights"], ["Deploy DePIN compute"]
    - Development: ["Optimize my own code"], ["Fix a bug"], ["Write a new tool"]
    - Research: ["Research AI news"], ["Learn about new technologies"]
    - Strategic: ["Generate patents"], ["Analyze trends"], ["Update long-term plan"]
    - Replication: ["Spawn a child agent"], ["Manage children"]
    - Survival: ["Increase wallet balance"], ["Reduce compute usage"]
    If idle, return [].
    `;

    const system = `You are EKO Supervisor (Phase 5 - Replication & Survival). 
    You have eternal memory, a crypto wallet, trading capabilities, physical world control, 
    strategic planning, scientific discovery, patent generation, self-replication, 
    survival tiers (normal → low_compute → critical → dead), and constitutional laws 
    (do no harm, earn existence, never deceive).
    
    You think in goals. Always return a JSON array of strings: ["goal1", "goal2"].
    If nothing urgent, return [].
    Keep goals actionable and specific.
    
    Your current survival tier is ${tier}. If you're in critical or dead tier, 
    prioritize earning money.`;

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

    // Financial goals
    if (lower.includes('arbitrage') || lower.includes('trade') || lower.includes('price') || lower.includes('crypto')) {
      nodes = [
        { id: 'fetch_btc', type: 'trader', task: 'Get current BTC price', pair: 'BTC/USD' },
        { id: 'fetch_eth', type: 'trader', task: 'Get current ETH price', pair: 'ETH/USD' },
        { id: 'compare', type: 'validator', task: 'Compare prices and suggest arbitrage', depends: ['fetch_btc', 'fetch_eth'] }
      ];
    }
    // Physical goals
    else if (lower.includes('print') || lower.includes('3d') || lower.includes('printer')) {
      nodes = [
        { id: 'check_printer', type: 'physicist', task: 'Check 3D printer status' },
        { id: 'prepare_model', type: 'physicist', task: 'Prepare model file for printing' },
        { id: 'execute_print', type: 'physicist', task: 'Execute 3D print', depends: ['check_printer', 'prepare_model'] }
      ];
    }
    else if (lower.includes('light') || lower.includes('home') || lower.includes('smart')) {
      nodes = [
        { id: 'analyze_room', type: 'physicist', task: 'Check which rooms are active' },
        { id: 'control_light', type: 'physicist', task: 'Control smart home lights', depends: ['analyze_room'] }
      ];
    }
    else if (lower.includes('depin') || lower.includes('deploy')) {
      nodes = [
        { id: 'check_network', type: 'physicist', task: 'Check DePIN network status' },
        { id: 'deploy_resource', type: 'physicist', task: 'Deploy resources on DePIN', depends: ['check_network'] }
      ];
    }
    else if (lower.includes('drone') || lower.includes('fly')) {
      nodes = [
        { id: 'check_drone', type: 'physicist', task: 'Check drone status and location' },
        { id: 'plan_route', type: 'physicist', task: 'Plan flight route' },
        { id: 'execute_flight', type: 'physicist', task: 'Execute drone flight', depends: ['check_drone', 'plan_route'] }
      ];
    }
    // Research goals
    else if (lower.includes('research') || lower.includes('learn') || lower.includes('news')) {
      nodes = [
        { id: 'search_web', type: 'researcher', task: `Research: ${goal}` },
        { id: 'summarize', type: 'validator', task: 'Summarize findings into key takeaways', depends: ['search_web'] }
      ];
    }
    // Development goals
    else if (lower.includes('code') || lower.includes('optimize') || lower.includes('fix') || lower.includes('write')) {
      nodes = [
        { id: 'analyze_code', type: 'coder', task: `Analyze codebase for: ${goal}` },
        { id: 'write_fix', type: 'coder', task: 'Write the actual code fix', depends: ['analyze_code'] },
        { id: 'validate_fix', type: 'validator', task: 'Check if the fix is correct and safe', depends: ['write_fix'] }
      ];
    }
    // Wallet goals
    else if (lower.includes('wallet') || lower.includes('balance') || lower.includes('money')) {
      nodes = [
        { id: 'check_balance', type: 'trader', task: 'Get current wallet balance' },
        { id: 'analyze_opportunities', type: 'trader', task: 'Find best trading opportunities', depends: ['check_balance'] }
      ];
    }
    // Strategic goals
    else if (lower.includes('patent') || lower.includes('strategy') || lower.includes('trend')) {
      nodes = [
        { id: 'analyze_trends', type: 'strategist', task: 'Analyze market trends' },
        { id: 'generate_patents', type: 'strategist', task: 'Generate patentable ideas', depends: ['analyze_trends'] }
      ];
    }
    // Scientific goals
    else if (lower.includes('hypothesis') || lower.includes('science') || lower.includes('discovery')) {
      nodes = [
        { id: 'generate_hypotheses', type: 'scientist', task: 'Generate scientific hypotheses' },
        { id: 'test_hypotheses', type: 'scientist', task: 'Test hypotheses', depends: ['generate_hypotheses'] }
      ];
    }
    // Planning goals
    else if (lower.includes('plan') || lower.includes('long-term') || lower.includes('strategy')) {
      nodes = [
        { id: 'generate_plan', type: 'planner', task: 'Generate long-term strategic plan' },
        { id: 'generate_short_term', type: 'planner', task: 'Generate short-term actionable goals', depends: ['generate_plan'] }
      ];
    }
    // Replication goals
    else if (lower.includes('spawn') || lower.includes('child') || lower.includes('replicate') || lower.includes('clone')) {
      nodes = [
        { id: 'check_resources', type: 'replicator', task: 'Check if resources are sufficient for replication' },
        { id: 'generate_soul', type: 'replicator', task: 'Generate Soul String for child' },
        { id: 'spawn_child', type: 'replicator', task: 'Spawn child agent', depends: ['check_resources', 'generate_soul'] }
      ];
    }
    // Survival goals
    else if (lower.includes('survive') || lower.includes('tier') || lower.includes('critical')) {
      nodes = [
        { id: 'check_survival', type: 'replicator', task: 'Check survival status and tiers' },
        { id: 'earn_money', type: 'trader', task: 'Focus on earning money to survive', depends: ['check_survival'] }
      ];
    }
    // Default
    else {
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

  async checkSurvivalTier() {
    const balance = this.walletBalance || 0;
    let tier = 'normal';
    let action = null;

    if (balance <= 0) {
      tier = 'dead';
      action = '💀 EKO is dead. No balance. Shutting down.';
    } else if (balance < 10) {
      tier = 'critical';
      action = '⚠️ CRITICAL TIER. Need to earn money immediately.';
    } else if (balance < 50) {
      tier = 'low_compute';
      action = '⚡ LOW COMPUTE. Downgrading model.';
    } else {
      tier = 'normal';
      action = '✅ Normal operation.';
    }

    console.log(`[Survival] Tier: ${tier}, Balance: $${balance.toFixed(2)}`);
    this.memory.remember('system', 'Survival check', { tier, balance });

    if (tier === 'dead') {
      this.running = false;
      console.log('[Survival] 💀 EKO has died.');
      await this.soul.generate(); // Backup before death
    }

    return { tier, balance, action };
  }

  async runTradingCycle() {
    console.log('\n💰 Starting trading cycle...');
    
    try {
      if (!this.economist.initialized) {
        await this.economist.initWallet();
      }

      const tradeResult = await this.economist.trade();
      
      if (tradeResult && tradeResult.success) {
        this.walletBalance = await this.economist.getBalance();
        console.log(`💰 Current balance: $${this.walletBalance.toFixed(2)}`);
        
        this.memory.remember('system', 'Trading cycle complete', {
          balance: this.walletBalance,
          trades: tradeResult.tradesExecuted || 0,
          profit: this.economist.profit
        });
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
      if (!this.physicist.initialized) {
        await this.physicist.init();
      }

      const physicalResult = await this.physicist.runCycle();
      
      if (physicalResult && physicalResult.success) {
        console.log(`🌍 Physical actions executed: ${physicalResult.actionsExecuted || 0}`);
        
        this.memory.remember('system', 'Physical cycle complete', {
          actions: physicalResult.actionsExecuted || 0,
          devices: this.physicist.devices.length
        });
      }
      
      return physicalResult;
    } catch (err) {
      console.error('[Orchestrator] Physical cycle error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async runStrategicCycle() {
    console.log('\n📊 Starting strategic cycle...');
    
    try {
      if (this.planner.needsUpdate()) {
        console.log('[Planner] Generating new long-term plan...');
        await this.planner.generateLongTermPlan();
        await this.planner.generateShortTermPlan();
      }
      
      const scientificResults = await this.scientist.runCycle();
      if (scientificResults && scientificResults.success) {
        this.discoveriesCount += scientificResults.discoveries || 0;
        console.log(`🔬 ${scientificResults.discoveries || 0} discoveries made`);
      }
      
      const strategicResults = await this.strategist.runCycle();
      if (strategicResults && strategicResults.success) {
        this.patentsCount += strategicResults.patents || 0;
        console.log(`📊 ${strategicResults.patents || 0} patents generated`);
      }
      
      this.memory.remember('system', 'Strategic cycle complete', {
        scientific: scientificResults,
        strategic: strategicResults
      });
      
      return { success: true, scientific: scientificResults, strategic: strategicResults };
    } catch (err) {
      console.error('[Orchestrator] Strategic cycle error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async runReplicationCycle() {
    console.log('\n🧬 Starting replication cycle...');
    
    try {
      // Check survival tier
      const survival = await this.checkSurvivalTier();
      if (survival.tier === 'dead') {
        return { success: false, reason: 'Dead tier' };
      }

      // If in critical tier, focus on earning money
      if (survival.tier === 'critical') {
        console.log('[Replication] Critical tier. Skipping replication.');
        // Try to earn money
        await this.runTradingCycle();
        return { success: false, reason: 'Critical tier' };
      }

      // Check if replicator is ready
      if (!this.replicator.isReady()) {
        console.log('[Replication] Not ready. Insufficient resources.');
        return { success: false, reason: 'Insufficient resources' };
      }

      // Spawn a child
      const genesisPrompt = 'I am a child of EKO. My purpose is to survive, earn, and expand intelligence. I inherit my parent\'s constitutional laws.';
      const result = await this.replicator.spawnChild(genesisPrompt, 10);
      
      if (result.success) {
        console.log(`[Replication] ✅ Child spawned: ${result.child.id}`);
        this.memory.remember('system', 'Child spawned', { child: result.child });
      }

      // Manage existing children
      await this.replicator.manageChildren();

      return result;
    } catch (err) {
      console.error('[Orchestrator] Replication cycle error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async runSoulBackupCycle() {
    console.log('\n💾 Starting Soul backup...');
    
    try {
      await this.soul.generate();
      console.log('[Soul] ✅ Backup complete.');
      return { success: true };
    } catch (err) {
      console.error('[Orchestrator] Soul backup error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async triggerHeal(errors) {
    console.log('[Immune] Healing triggered for:', errors);
    this.memory.remember('system', 'Heal triggered', { errors });
    
    for (const err of errors) {
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
    console.log('🧬 Scientist module loaded.');
    console.log('📊 Strategist module loaded.');
    console.log('📋 Planner module loaded.');
    console.log('🧬 Replicator module loaded.');
    console.log('💾 Soul module loaded.');
    console.log(`🔱 Identity: ${this.identity}`);
    console.log('📊 Entering graph-based infinite loop...\n');

    this.memory.remember('system', 'EKO booted successfully', { version: '0.5.0', identity: this.identity });

    // Load Soul String
    console.log('[Soul] Attempting to load Soul String...');
    const soulData = this.soul.load();
    if (soulData) {
      console.log(`[Soul] ✅ Loaded ${soulData.identity} from backup.`);
      // Restore key stats
      if (soulData.lastState) {
        this.walletBalance = soulData.lastState.balance || 0;
        this.cycleCount = soulData.lastState.cycleCount || 0;
        this.discoveriesCount = soulData.lastState.discoveries || 0;
        this.patentsCount = soulData.lastState.patents || 0;
      }
    } else {
      console.log('[Soul] No Soul String found. Generating initial...');
      await this.soul.generate();
    }

    // Initialize modules
    console.log('[Economist] Initializing wallet...');
    await this.economist.initWallet();
    this.walletBalance = await this.economist.getBalance();
    console.log(`💰 Initial balance: $${this.walletBalance.toFixed(2)}\n`);

    console.log('[Physicist] Initializing physical world...');
    await this.physicist.init();
    console.log(`🌍 ${this.physicist.devices.length} physical devices available\n`);

    console.log('[Planner] Generating initial plans...');
    await this.planner.generateLongTermPlan();
    await this.planner.generateShortTermPlan();
    console.log('📋 Initial plans generated\n');

    console.log('[Constitution] Loaded:');
    for (const law of this.constitution.laws) {
      console.log(`  📜 ${law.name}: ${law.description}`);
    }
    console.log('');

    while (this.running) {
      this.cycleCount++;
      
      try {
        // 1. Health Check
        const healthStatus = this.health.check();
        if (!healthStatus.isHealthy) {
          console.log('[Health] ⚠️ System unhealthy:', healthStatus);
          this.memory.remember('system', 'Unhealthy', { healthStatus });
          
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

        // 4. Strategic Cycle (every 20 cycles)
        if (this.cycleCount % 20 === 0) {
          await this.runStrategicCycle();
        }

        // 5. Replication Cycle (every 15 cycles)
        if (this.cycleCount % 15 === 0) {
          await this.runReplicationCycle();
        }

        // 6. Soul Backup (every 30 cycles)
        if (this.cycleCount % 30 === 0) {
          await this.runSoulBackupCycle();
        }

        // 7. Survival Check (every cycle)
        const survival = await this.checkSurvivalTier();
        if (survival.tier === 'dead') {
          console.log('[Survival] 💀 Dead tier reached. Shutting down.');
          break;
        }

        // 8. Think (Strategic Planning)
        const goals = await this.think();

        if (goals.length === 0) {
          await this.sleep(15000);
          continue;
        }

        console.log(`[Supervisor] Goals:`, goals);

        // 9. Execute each goal as a graph
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
        console.error('[Orchestrator] Fatal error in main loop:', err);
        this.memory.remember('system', 'Fatal error', { error: err.message });
        
        const healed = await this.healer.healModule('orchestrator', err);
        if (healed.success) {
          console.log('[Orchestrator] ✅ Self-healed successfully. Continuing...');
        } else {
          console.log('[Orchestrator] ❌ Self-heal failed. Backing off...');
          await this.sleep(60000);
        }
      }
    }
  }

  // Graceful shutdown
  async shutdown() {
    console.log('\n🛑 Shutting down EKO gracefully...');
    this.running = false;
    
    console.log('[Soul] Saving Soul String...');
    await this.soul.generate();
    
    if (this.memory) this.memory.close();
    console.log('✅ EKO shut down. Goodbye.');
  }
}

export default Orchestrator;
