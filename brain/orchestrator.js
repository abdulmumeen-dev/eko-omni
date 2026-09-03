// brain/orchestrator.js
import { JobScraper } from '../limbs/job_scraper.js';
import { ApplicationEngine } from '../limbs/application_engine.js';
import { CaptchaBreaker } from '../limbs/captcha_breaker.js';
import { ApplicationTracker } from '../limbs/application_tracker.js';
import { FollowupEngine } from '../limbs/followup_engine.js';
import { GmailAutomation } from '../limbs/gmail_automation.js';
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
import WorkingMemory from './memory/working.js';
import EpisodicMemory from './memory/episodic.js';
import ProceduralMemory from './memory/procedural.js';
import SkillExtractor from '../skills/skill_extractor.js';
import PlatformManager from '../platforms/manager.js';
import Browser from '../limbs/browser.js';

// Phase 7 Imports
import PluginLoader from '../plugins/loader.js';
import SkillLoader from '../skills/loader.js';
import ConnectorManager from '../connectors/manager.js';
import KnowledgeLoop from '../knowledge/loop.js';
import MCPClient from '../mcp/client.js';

// Phase 8 Imports
import WalletManager from '../blockchain/wallet.js';
import BinanceClient from '../exchanges/binance.js';
import AccountManager from '../identity/account.js';
import Persona from '../identity/persona.js';
import ContextSwitcher from '../identity/context.js';
import DocumentGenerator from '../identity/document.js';
import CloneManager from '../identity/clone.js';

// Python Bridge
import { callPythonAgent, callPythonAnalysis, callPythonML, pingPython } from '../bridge/python_bridge.js';

class Orchestrator {
  constructor() {
    // Core
    this.memory = new MemoryManager();
    this.running = true;
    this.walletBalance = 0;
    this.identity = 'eko_primary_' + Date.now().toString(36);
    this.cycleCount = 0;
    this.discoveriesCount = 0;
    this.patentsCount = 0;
    this.pythonEnabled = false;

    // Phase 1: Immune System
    this.health = new HealthMonitor(this.memory);
    this.healer = new Healer(this.memory);

    // Phase 2: Trading
    this.economist = new Economist(this.memory);

    // Phase 3: Physical World
    this.physicist = new Physicist(this.memory);

    // Phase 4: NOESIS
    this.planner = new Planner(this.memory);
    this.scientist = new Scientist(this.memory);
    this.strategist = new Strategist(this.memory);

    // Phase 5: Replication & Survival
    this.constitution = CONSTITUTION;
    this.replicator = new Replicator(this.memory, this.constitution);
    this.soul = new SoulString(this.memory);

    // Phase 6: Memory Layers & Skills
    this.working = new WorkingMemory(this.memory);
    this.episodic = new EpisodicMemory(this.memory);
    this.procedural = new ProceduralMemory(this.memory);
    this.skillExtractor = new SkillExtractor(this.memory, this.procedural);
    this.platforms = new PlatformManager(this.memory);
    this.browser = new Browser(this.memory);

    // Phase 7: Plugins, Skills, Connectors, Knowledge Loop, MCP
    this.pluginLoader = new PluginLoader(this.memory);
    this.skillLoader = new SkillLoader(this.memory, this.procedural);
    this.connectors = new ConnectorManager(this.memory);
    this.knowledgeLoop = new KnowledgeLoop(this.memory, this.procedural);
    this.mcp = new MCPClient(this.memory);

    // Phase 8: Real Wallet, Exchange & Account Management
    this.wallet = new WalletManager(this.memory);
    this.exchange = new BinanceClient(this.memory);
    this.account = new AccountManager(this.memory, this.browser);
    this.persona = new Persona(this.memory);
    this.context = new ContextSwitcher(this.memory, this.persona);
    this.documents = new DocumentGenerator(this.memory, this.persona, this.context);
    this.cloneManager = new CloneManager(this.memory);

    // Job Seeking Modules
    this.jobScraper = new JobScraper(this.memory, this.browser);
    this.applicationEngine = new ApplicationEngine(this.memory, this.browser, this.persona, this.documents);
    this.captchaBreaker = new CaptchaBreaker(this.memory);
    this.applicationTracker = new ApplicationTracker(this.memory);
    this.gmail = new GmailAutomation(this.memory);
    this.followupEngine = new FollowupEngine(this.memory, this.gmail);
    
    // Track cycle timing
    this.lastTradeCycle = 0;
    this.lastPhysicalCycle = 0;
    this.lastStrategicCycle = 0;
    this.lastReplicationCycle = 0;
    this.lastSoulBackupCycle = 0;
    this.lastSkillCycle = 0;
    this.lastPlatformCycle = 0;
    this.lastKnowledgeCycle = 0;
    this.lastConnectorCycle = 0;
    this.lastAccountCycle = 0;
    this.lastPythonCycle = 0;
  }

  // ============================================================
  // PYTHON BRIDGE METHODS
  // ============================================================

  async initPython() {
    try {
      console.log('[Python] Checking connection...');
      const result = await pingPython();
      this.pythonEnabled = result.success;
      if (this.pythonEnabled) {
        console.log('[Python] ✅ Connected to Python AI');
        this.memory.remember('system', 'Python AI connected', { success: true });
      } else {
        console.log('[Python] ⚠️ Python AI not available. Running in simulation mode.');
      }
      return this.pythonEnabled;
    } catch (err) {
      console.log('[Python] ⚠️ Python AI not available:', err.message);
      this.pythonEnabled = false;
      return false;
    }
  }

  async callPython(prompt) {
    if (!this.pythonEnabled) {
      return { success: false, reason: 'Python AI not available' };
    }

    try {
      console.log('[Python] Calling LangChain agent...');
      const result = await callPythonAgent(prompt);
      if (result && !result.error) {
        console.log('[Python] ✅ Received response');
        return { success: true, result };
      }
      return { success: false, error: result?.error || 'Unknown error' };
    } catch (err) {
      console.error('[Python] ❌ Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async callPythonML(inputData) {
    if (!this.pythonEnabled) {
      return { success: false, reason: 'Python AI not available' };
    }

    try {
      const result = await callPythonML(inputData);
      return { success: true, result };
    } catch (err) {
      console.error('[Python] ML Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async callPythonAnalysis(query) {
    if (!this.pythonEnabled) {
      return { success: false, reason: 'Python AI not available' };
    }

    try {
      const result = await callPythonAnalysis(query);
      return { success: true, result };
    } catch (err) {
      console.error('[Python] Analysis Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // ============================================================
  // CORE METHODS
  // ============================================================

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
    const skillStats = this.procedural.getStats();
    const platformStats = this.platforms.getStats();
    const browserStats = this.browser.getStats();
    const pluginStats = this.pluginLoader.getAvailableSkills();
    const connectorStats = this.connectors.getStats();
    const knowledgeStats = this.knowledgeLoop.getStats();
    const mcpStats = this.mcp.getStats();
    const walletStats = this.wallet.getStats();
    const exchangeStats = this.exchange.getStats();
    const accountStats = this.account.getStats();
    const balance = this.walletBalance || 0;

    let tier = 'normal';
    if (balance <= 0) tier = 'dead';
    else if (balance < 10) tier = 'critical';
    else if (balance < 50) tier = 'low_compute';
    else tier = 'normal';

    // Try to get Python AI insight
    let pythonInsight = null;
    if (this.pythonEnabled) {
      try {
        const insightPrompt = `Given the current state, what should I focus on? Balance: $${balance}, Tier: ${tier}, Skills: ${this.procedural.getAll().length}`;
        const result = await this.callPython(insightPrompt);
        if (result.success) {
          pythonInsight = result.result;
          console.log('[Python] 💡 Insight:', pythonInsight);
        }
      } catch (err) {
        // Silently fail
      }
    }

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
    Skill stats: ${JSON.stringify(skillStats)}.
    Platform stats: ${JSON.stringify(platformStats)}.
    Browser stats: ${JSON.stringify(browserStats)}.
    Plugin stats: ${pluginStats.length} plugins available.
    Connector stats: ${JSON.stringify(connectorStats)}.
    Knowledge stats: ${JSON.stringify(knowledgeStats)}.
    MCP stats: ${JSON.stringify(mcpStats)}.
    Wallet stats: ${JSON.stringify(walletStats)}.
    Exchange stats: ${JSON.stringify(exchangeStats)}.
    Account stats: ${JSON.stringify(accountStats)}.
    Python insight: ${pythonInsight || 'None'}.
    Last user message: "${lastUser || 'None'}".
    Recent actions: ${JSON.stringify(recentActions, null, 2)}.
    Cycle count: ${this.cycleCount}.
    Discoveries: ${this.discoveriesCount}.
    Patents: ${this.patentsCount}.
    Children: ${this.replicator.children.length}.
    Skills: ${this.procedural.getAll().length}.

    What should I do next? Return as JSON array of goal strings.
    Examples: 
    - Financial: ["Check crypto arbitrage"], ["Analyze market trends"]
    - Physical: ["Print a 3D model"], ["Control smart home lights"], ["Deploy DePIN compute"]
    - Development: ["Optimize my own code"], ["Fix a bug"], ["Write a new tool"]
    - Research: ["Research AI news"], ["Learn about new technologies"]
    - Strategic: ["Generate patents"], ["Analyze trends"], ["Update long-term plan"]
    - Replication: ["Spawn a child agent"], ["Manage children"]
    - Survival: ["Increase wallet balance"], ["Reduce compute usage"]
    - Skills: ["Extract new skills"], ["Improve existing skills"]
    - Platforms: ["Check messages"], ["Send updates"]
    - Browser: ["Search the web"], ["Extract data from a page"]
    - Knowledge: ["Learn about quantum computing"], ["Find market opportunities"]
    - Plugins: ["Load plugin"], ["Execute plugin skill"]
    - Connectors: ["Fetch public APIs"], ["Connect to new service"]
    - Trading: ["Get BTC price"], ["Place limit order"]
    - Accounts: ["Create new Gmail account"], ["List all accounts"], ["Use account for service"]
    If idle, return [].
    `;

    const system = `You are EKO Supervisor (Phase 8 - EKO 2.0). 
    You have eternal memory, self-healing, physical control, scientific discovery, patent generation, 
    self-replication, survival tiers, constitutional laws, skill evolution, multi-platform reach, 
    browser control, soul backup, plugins, connectors, knowledge loop, MCP tool discovery,
    real crypto wallet, real exchange trading, permanent Gmail accounts, and Python AI power.

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
    // Browser goals
    else if (lower.includes('browser') || lower.includes('search') || lower.includes('web') || lower.includes('open')) {
      nodes = [
        { id: 'open_browser', type: 'browser', task: `Open browser and navigate to: ${goal}` },
        { id: 'extract_data', type: 'browser', task: 'Extract data from page', depends: ['open_browser'] }
      ];
    }
    // Platform goals
    else if (lower.includes('discord') || lower.includes('telegram') || lower.includes('slack') || lower.includes('message')) {
      nodes = [
        { id: 'check_platform', type: 'platform', task: `Check messages on ${goal}` },
        { id: 'send_response', type: 'platform', task: 'Send response', depends: ['check_platform'] }
      ];
    }
    // Skill goals
    else if (lower.includes('skill') || lower.includes('extract') || lower.includes('learn')) {
      nodes = [
        { id: 'extract_skill', type: 'skill', task: `Extract skill from: ${goal}` },
        { id: 'save_skill', type: 'skill', task: 'Save to procedural memory', depends: ['extract_skill'] }
      ];
    }
    // Knowledge goals
    else if (lower.includes('knowledge') || lower.includes('learn') || lower.includes('research')) {
      nodes = [
        { id: 'identify_gap', type: 'knowledge', task: 'Identify knowledge gap' },
        { id: 'learn_topic', type: 'knowledge', task: `Learn about: ${goal}`, depends: ['identify_gap'] },
        { id: 'extract_insights', type: 'knowledge', task: 'Extract insights and opportunities', depends: ['learn_topic'] }
      ];
    }
    // Connector goals
    else if (lower.includes('api') || lower.includes('connector') || lower.includes('fetch')) {
      nodes = [
        { id: 'fetch_apis', type: 'connector', task: 'Fetch public APIs' },
        { id: 'connect_service', type: 'connector', task: `Connect to: ${goal}`, depends: ['fetch_apis'] }
      ];
    }
    // Plugin goals
    else if (lower.includes('plugin') || lower.includes('load')) {
      nodes = [
        { id: 'load_plugin', type: 'plugin', task: `Load plugin: ${goal}` },
        { id: 'execute_plugin', type: 'plugin', task: 'Execute plugin skill', depends: ['load_plugin'] }
      ];
    }
    // MCP goals
    else if (lower.includes('mcp') || lower.includes('tool')) {
      nodes = [
        { id: 'discover_tools', type: 'mcp', task: 'Discover MCP tools' },
        { id: 'execute_tool', type: 'mcp', task: `Execute tool: ${goal}`, depends: ['discover_tools'] }
      ];
    }
    // Exchange goals
    else if (lower.includes('btc') || lower.includes('eth') || lower.includes('price') || lower.includes('order')) {
      nodes = [
        { id: 'get_price', type: 'exchange', task: `Get price for ${goal}` },
        { id: 'place_order', type: 'exchange', task: `Place order for ${goal}`, depends: ['get_price'] }
      ];
    }
    // Wallet goals
    else if (lower.includes('wallet') || lower.includes('balance') || lower.includes('send')) {
      nodes = [
        { id: 'check_wallet', type: 'wallet', task: 'Check wallet balance' },
        { id: 'send_transaction', type: 'wallet', task: `Send: ${goal}`, depends: ['check_wallet'] }
      ];
    }
    // Account goals
    else if (lower.includes('account') || lower.includes('gmail') || lower.includes('email')) {
      nodes = [
        { id: 'create_account', type: 'account', task: `Create new Gmail account` },
        { id: 'list_accounts', type: 'account', task: 'List all accounts', depends: ['create_account'] }
      ];
    }
    // Python goals
    else if (lower.includes('python') || lower.includes('ai') || lower.includes('analysis')) {
      nodes = [
        { id: 'python_analyze', type: 'python', task: `Analyze with Python: ${goal}` },
        { id: 'python_result', type: 'python', task: 'Process Python result', depends: ['python_analyze'] }
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
          // Check if this is a Python task
          if (node.type === 'python') {
            let result;
            if (node.task.includes('Analyze')) {
              result = await this.callPythonAnalysis(node.task);
            } else {
              result = await this.callPython(node.task);
            }
            results[node.id] = result;
            return result;
          }

          const result = await spawnSubAgent(node);
          results[node.id] = result;
          return result;
        } catch (err) {
          console.error(`[Graph] Node ${node.id} crashed:`, err.message);
          results[node.id] = { success: false, nodeId: node.id, error: err.message };
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
      await this.soul.generate();
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

  async runRealTradingCycle() {
    if (!this.exchange.initialized) {
      console.log('[Exchange] Not initialized. Skipping real trading.');
      return { success: false, reason: 'Not initialized' };
    }

    console.log('\n💰 Starting real trading cycle...');
    
    try {
      const btcPrice = await this.exchange.getPrice('BTCUSDT');
      if (btcPrice) {
        console.log(`[Exchange] BTC/USDT: $${btcPrice}`);
        this.memory.remember('market', 'BTC price', { price: btcPrice });
      }

      const ethPrice = await this.exchange.getPrice('ETHUSDT');
      if (ethPrice) {
        console.log(`[Exchange] ETH/USDT: $${ethPrice}`);
        this.memory.remember('market', 'ETH price', { price: ethPrice });
      }

      const balances = await this.exchange.getBalance();
      if (balances.length > 0) {
        console.log(`[Exchange] ${balances.length} assets found`);
      }

      return { success: true, btcPrice, ethPrice, balances };
    } catch (err) {
      console.error('[Orchestrator] Real trading cycle error:', err.message);
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
      const survival = await this.checkSurvivalTier();
      if (survival.tier === 'dead') {
        return { success: false, reason: 'Dead tier' };
      }

      if (survival.tier === 'critical') {
        console.log('[Replication] Critical tier. Skipping replication.');
        await this.runTradingCycle();
        return { success: false, reason: 'Critical tier' };
      }

      if (!this.replicator.isReady()) {
        console.log('[Replication] Not ready. Insufficient resources.');
        return { success: false, reason: 'Insufficient resources' };
      }

      const genesisPrompt = 'I am a child of EKO. My purpose is to survive, earn, and expand intelligence. I inherit my parent\'s constitutional laws.';
      const result = await this.replicator.spawnChild(genesisPrompt, 10);
      
      if (result.success) {
        console.log(`[Replication] ✅ Child spawned: ${result.child.id}`);
        this.memory.remember('system', 'Child spawned', { child: result.child });
      }

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

  async runSkillCycle() {
    console.log('\n🧠 Starting skill extraction cycle...');
    
    try {
      if (process.env.AUTO_SKILL_EXTRACTION === 'true') {
        const skills = await this.skillExtractor.autoExtract();
        if (skills.length > 0) {
          console.log(`🧠 Extracted ${skills.length} skills.`);
          this.memory.remember('system', 'Skills extracted', { count: skills.length });
        } else {
          console.log('[SkillExtractor] No new skills extracted.');
        }
        return { success: true, skills: skills.length };
      } else {
        console.log('[SkillExtractor] Auto-extraction disabled.');
        return { success: false, reason: 'Disabled' };
      }
    } catch (err) {
      console.error('[Orchestrator] Skill cycle error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async runPlatformCycle() {
    console.log('\n📱 Starting platform cycle...');
    
    try {
      const stats = this.platforms.getStats();
      console.log(`📱 ${stats.platforms.length} platforms available.`);
      console.log(`📱 ${stats.totalMessages} total messages.`);
      
      this.memory.remember('system', 'Platform cycle', stats);
      return { success: true, stats };
    } catch (err) {
      console.error('[Orchestrator] Platform cycle error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async runKnowledgeCycle() {
    console.log('\n🧠 Starting knowledge loop...');
    
    try {
      if (process.env.KNOWLEDGE_LOOP === 'true') {
        const result = await this.knowledgeLoop.runIteration();
        if (result.learned) {
          console.log(`🧠 Learned: ${result.topic}`);
          if (result.opportunities && result.opportunities.length > 0) {
            console.log(`📊 Found ${result.opportunities.length} opportunities`);
          }
          this.memory.remember('system', 'Knowledge cycle complete', { 
            topic: result.topic,
            opportunities: result.opportunities?.length || 0
          });
        }
        return result;
      } else {
        console.log('[KnowledgeLoop] Disabled.');
        return { success: false, reason: 'Disabled' };
      }
    } catch (err) {
      console.error('[Orchestrator] Knowledge cycle error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async runConnectorCycle() {
    console.log('\n🔌 Starting connector cycle...');
    
    try {
      const stats = this.connectors.getStats();
      console.log(`🔌 ${stats.totalAPIs} public APIs available`);
      console.log(`🔌 ${stats.connections} active connections`);
      
      if (!this.connectors.publicAPI.lastFetch) {
        await this.connectors.init();
      }
      
      this.memory.remember('system', 'Connector cycle', stats);
      return { success: true, stats };
    } catch (err) {
      console.error('[Orchestrator] Connector cycle error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async runAccountCycle() {
    console.log('\n👤 Starting account cycle...');
    
    try {
      const stats = this.account.getStats();
      console.log(`👤 ${stats.total} total accounts (${stats.active} active)`);
      
      if (stats.total < 5) {
        console.log('[Account] Creating new Gmail account...');
        const result = await this.account.createGmailAccount();
        if (result.success) {
          console.log(`👤 ✅ Created: ${result.account.email}`);
        } else {
          console.log(`👤 ❌ Failed: ${result.error || 'Unknown error'}`);
        }
      } else {
        console.log('[Account] ✅ Sufficient accounts available');
      }
      
      this.memory.remember('system', 'Account cycle', stats);
      return { success: true, stats };
    } catch (err) {
      console.error('[Orchestrator] Account cycle error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async runPythonCycle() {
    console.log('\n🐍 Starting Python AI cycle...');
    
    try {
      if (!this.pythonEnabled) {
        console.log('[Python] AI not available. Skipping.');
        return { success: false, reason: 'Not available' };
      }

      // Get Python insight
      const insight = await this.callPython('What should I focus on right now?');
      if (insight.success) {
        console.log('[Python] 💡 Insight:', insight.result);
        this.memory.remember('system', 'Python insight', { insight: insight.result });
      }

      // Run Python analysis on recent actions
      const recentActions = this.memory.getRecentActions(5);
      if (recentActions.length > 0) {
        const analysis = await this.callPythonAnalysis(JSON.stringify(recentActions));
        if (analysis.success) {
          console.log('[Python] 📊 Analysis:', analysis.result);
          this.memory.remember('system', 'Python analysis', { analysis: analysis.result });
        }
      }

      return { success: true };
    } catch (err) {
      console.error('[Orchestrator] Python cycle error:', err.message);
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
    console.log('🧠 Three-layer memory loaded (Working, Episodic, Procedural).');
    console.log('📱 Platform manager loaded.');
    console.log('🌐 Browser module loaded.');
    console.log('🧩 Plugin loader loaded.');
    console.log('📚 Skill loader loaded.');
    console.log('🔌 Connector manager loaded.');
    console.log('🧠 Knowledge loop loaded.');
    console.log('🔧 MCP client loaded.');
    console.log('🔗 Real wallet loaded.');
    console.log('📈 Exchange client loaded.');
    console.log('👤 Account manager loaded.');
    console.log('🐍 Python AI bridge loaded.');
    console.log(`🔱 Identity: ${this.identity}`);
    console.log('📊 Entering graph-based infinite loop...\n');
    console.log(`🧑 Persona: ${this.persona.getFullName()}`);
    console.log(`📝 Bio: ${this.persona.getBio()}`);
    console.log(`📄 ${this.cloneManager.getAllClones().length} clones available`);

    this.memory.remember('system', 'EKO booted successfully', { version: '2.0.0', identity: this.identity });

    // Load Soul String
    console.log('[Soul] Attempting to load Soul String...');
    const soulData = this.soul.load();
    if (soulData) {
      console.log(`[Soul] ✅ Loaded ${soulData.identity} from backup.`);
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

    // Initialize Python AI
    console.log('[Python] Initializing Python AI...');
    await this.initPython();

    // Initialize modules
    console.log('[Economist] Initializing wallet...');
    await this.economist.initWallet();
    this.walletBalance = await this.economist.getBalance();
    console.log(`💰 Initial balance: $${this.walletBalance.toFixed(2)}\n`);

    console.log('[Blockchain] Initializing real wallet...');
    const walletResult = await this.wallet.init();
    if (walletResult.success) {
      console.log(`🔗 Real wallet: ${this.wallet.address}`);
      console.log(`💰 ETH balance: ${this.wallet.balance} ETH`);
    } else {
      console.log('[Blockchain] ⚠️ Running in simulation mode.');
    }

    console.log('[Exchange] Initializing exchange...');
    const exchangeResult = await this.exchange.init();
    if (exchangeResult.success) {
      console.log('[Exchange] ✅ Connected to Binance');
    } else {
      console.log('[Exchange] ⚠️ Running in simulation mode.');
    }

    console.log('[Physicist] Initializing physical world...');
    await this.physicist.init();
    console.log(`🌍 ${this.physicist.devices.length} physical devices available\n`);

    console.log('[Planner] Generating initial plans...');
    await this.planner.generateLongTermPlan();
    await this.planner.generateShortTermPlan();
    console.log('📋 Initial plans generated\n');

    console.log('[Phase 7] Loading plugins...');
    this.pluginLoader.loadPlugins();

    console.log('[Phase 7] Loading skills...');
    this.skillLoader.loadSkills();

    console.log('[Phase 7] Initializing connectors...');
    await this.connectors.init();

    console.log('[Phase 7] Discovering MCP tools...');
    if (process.env.MCP_SERVER_URL) {
      await this.mcp.discoverTools(process.env.MCP_SERVER_URL);
    } else {
      console.log('[MCP] No MCP server configured. Skipping.');
    }

    console.log('[Account] Initializing account manager...');
    await this.account.init();
    const accountStats = this.account.getStats();
    console.log(`👤 ${accountStats.total} accounts in database\n`);

    console.log('[Platforms] Registering platforms...');
    if (process.env.DISCORD_BOT_TOKEN) {
      this.platforms.registerPlatform('discord', { token: process.env.DISCORD_BOT_TOKEN });
    }
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.platforms.registerPlatform('telegram', { token: process.env.TELEGRAM_BOT_TOKEN });
    }
    if (process.env.SLACK_BOT_TOKEN) {
      this.platforms.registerPlatform('slack', { token: process.env.SLACK_BOT_TOKEN });
    }
    console.log(`📱 ${this.platforms.platforms.length} platforms registered.\n`);

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

        // 2. Simulated Trading Cycle (every 5 cycles)
        if (this.cycleCount % 5 === 0) {
          await this.runTradingCycle();
        }

        // 3. Real Trading Cycle (every 3 cycles)
        if (this.cycleCount % 3 === 0 && this.exchange.initialized) {
          await this.runRealTradingCycle();
        }

        // 4. Physical World Cycle (every 10 cycles)
        if (this.cycleCount % 10 === 0) {
          await this.runPhysicalCycle();
        }

        // 5. Strategic Cycle (every 20 cycles)
        if (this.cycleCount % 20 === 0) {
          await this.runStrategicCycle();
        }

        // 6. Replication Cycle (every 15 cycles)
        if (this.cycleCount % 15 === 0) {
          await this.runReplicationCycle();
        }

        // 7. Soul Backup (every 30 cycles)
        if (this.cycleCount % 30 === 0) {
          await this.runSoulBackupCycle();
        }

        // 8. Skill Extraction (every 25 cycles)
        if (this.cycleCount % 25 === 0 && process.env.AUTO_SKILL_EXTRACTION === 'true') {
          await this.runSkillCycle();
        }

        // 9. Platform Cycle (every 12 cycles)
        if (this.cycleCount % 12 === 0) {
          await this.runPlatformCycle();
        }

        // 10. Knowledge Loop (every 20 cycles)
        if (this.cycleCount % 20 === 0 && process.env.KNOWLEDGE_LOOP === 'true') {
          await this.runKnowledgeCycle();
        }

        // 11. Connector Cycle (every 35 cycles)
        if (this.cycleCount % 35 === 0) {
          await this.runConnectorCycle();
        }

        // 12. Account Cycle (every 50 cycles)
        if (this.cycleCount % 50 === 0) {
          await this.runAccountCycle();
        }

        // 13. Python AI Cycle (every 8 cycles)
        if (this.cycleCount % 8 === 0 && this.pythonEnabled) {
          await this.runPythonCycle();
        }

        // Job Seeking Module
        if (this.cycleCount % 60 === 0 && this.cycleCount > 0) {
          console.log('\n💼 Starting job seeking cycle...');
          await this.runJobCycle();
        }

        // 14. Survival Check (every cycle)
        const survival = await this.checkSurvivalTier();
        if (survival.tier === 'dead') {
          console.log('[Survival] 💀 Dead tier reached. Shutting down.');
          break;
        }

        // 15. Think (Strategic Planning)
        const goals = await this.think();

        if (goals.length === 0) {
          await this.sleep(15000);
          continue;
        }

        console.log(`[Supervisor] Goals:`, goals);

        // 16. Execute each goal as a graph
        for (const goal of goals) {
          console.log(`\n[Supervisor] Planning graph for: "${goal}"`);
          const graph = this.planGraph(goal);
          const results = await this.executeGraph(graph);

          // Add to episodic memory
          this.episodic.saveEpisode({
            goal,
            results,
            summary: `Completed goal: ${goal}`,
            success: Object.values(results).every(r => r && r.success)
          });

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
