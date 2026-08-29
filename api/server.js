// api/server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let ekoInstance = null;

export function initializeAPI(eko) {
  ekoInstance = eko;
  
  // ============ Status Endpoints ============
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime()
    });
  });
  
  // Full status
  app.get('/api/status', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const status = {
      running: ekoInstance.running,
      identity: ekoInstance.identity,
      cycleCount: ekoInstance.cycleCount,
      wallet: {
        balance: ekoInstance.walletBalance || 0
      },
      stats: {
        discoveries: ekoInstance.discoveriesCount || 0,
        patents: ekoInstance.patentsCount || 0,
        children: ekoInstance.replicator?.children?.length || 0,
        skills: ekoInstance.procedural?.getAll()?.length || 0,
        memory: ekoInstance.memory?.getStats() || {}
      },
      survival: {
        tier: 'normal',
        balance: ekoInstance.walletBalance || 0
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  });
  
  // ============ Memory Endpoints ============
  
  // Get recent memories
  app.get('/api/memory', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const limit = parseInt(req.query.limit) || 20;
    const memories = ekoInstance.memory?.recall(limit) || [];
    res.json({ 
      memories, 
      count: memories.length,
      total: ekoInstance.memory?.getMemoryCount() || 0
    });
  });
  
  // Search memories
  app.get('/api/memory/search', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const term = req.query.q || '';
    if (!term) {
      return res.status(400).json({ error: 'Search term required' });
    }
    
    const results = ekoInstance.memory?.search(term) || [];
    res.json({ results, count: results.length, term });
  });
  
  // ============ Goals Endpoints ============
  
  // Send a goal
  app.post('/api/goal', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }
    
    ekoInstance.memory?.remember('user', goal);
    res.json({ 
      success: true, 
      goal, 
      timestamp: new Date().toISOString() 
    });
  });
  
  // Get current goals (from orchestrator think)
  app.get('/api/goals/current', async (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    try {
      const goals = await ekoInstance.think();
      res.json({ goals, count: goals.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ============ Skills Endpoints ============
  
  // Get all skills
  app.get('/api/skills', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const skills = ekoInstance.procedural?.getAll() || [];
    const best = ekoInstance.procedural?.getBest(5) || [];
    const stats = ekoInstance.procedural?.getStats() || {};
    
    res.json({ 
      skills, 
      count: skills.length,
      best,
      stats
    });
  });
  
  // Get a specific skill
  app.get('/api/skills/:name', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const skill = ekoInstance.procedural?.findSkill(req.params.name);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json(skill);
  });
  
  // Use a skill
  app.post('/api/skills/:name/use', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const skill = ekoInstance.procedural?.useSkill(req.params.name);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json({ 
      success: true, 
      skill,
      message: `Skill '${skill.name}' used successfully`
    });
  });
  
  // ============ Children Endpoints ============
  
  // Get all children
  app.get('/api/children', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const children = ekoInstance.replicator?.children || [];
    const stats = ekoInstance.replicator?.getStats() || {};
    
    res.json({ 
      children, 
      count: children.length,
      stats
    });
  });
  
  // Spawn a child
  app.post('/api/children/spawn', async (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const { genesisPrompt, funding } = req.body;
    
    if (!ekoInstance.replicator.isReady()) {
      return res.status(400).json({ 
        error: 'Not ready to spawn child. Insufficient resources.' 
      });
    }
    
    const result = await ekoInstance.replicator.spawnChild(
      genesisPrompt || 'I am a child of EKO. My purpose is to survive, earn, and expand intelligence.',
      funding || 10
    );
    
    res.json(result);
  });
  
  // ============ System Endpoints ============
  
  // Get system stats
  app.get('/api/system', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const memoryStats = ekoInstance.memory?.getStats() || {};
    const skillStats = ekoInstance.procedural?.getStats() || {};
    const platformStats = ekoInstance.platforms?.getStats() || {};
    const browserStats = ekoInstance.browser?.getStats() || {};
    const soulStats = ekoInstance.soul?.getStats() || {};
    const healthStats = ekoInstance.health?.getStatus() || {};
    
    res.json({
      identity: ekoInstance.identity,
      running: ekoInstance.running,
      cycleCount: ekoInstance.cycleCount,
      wallet: {
        balance: ekoInstance.walletBalance || 0
      },
      memory: memoryStats,
      skills: skillStats,
      platforms: platformStats,
      browser: browserStats,
      soul: soulStats,
      health: healthStats,
      timestamp: new Date().toISOString()
    });
  });
  
  // Force a trading cycle
  app.post('/api/cycle/trade', async (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const result = await ekoInstance.runTradingCycle();
    res.json(result);
  });
  
  // Force a physical cycle
  app.post('/api/cycle/physical', async (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const result = await ekoInstance.runPhysicalCycle();
    res.json(result);
  });
  
  // Force a skill extraction
  app.post('/api/cycle/skill', async (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const result = await ekoInstance.runSkillCycle();
    res.json(result);
  });
  
  // Force a soul backup
  app.post('/api/cycle/soul', async (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const result = await ekoInstance.runSoulBackupCycle();
    res.json(result);
  });
  
  // ============ Shutdown ============
  
  // Graceful shutdown
  app.post('/api/shutdown', async (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    res.json({ 
      success: true, 
      message: 'EKO shutting down...' 
    });
    
    setTimeout(async () => {
      await ekoInstance.shutdown();
    }, 1000);
  });
  
  // ============ Start Server ============
  
  app.listen(PORT, () => {
    console.log(`🌐 API server running on http://localhost:${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    console.log(`📝 Memory: http://localhost:${PORT}/api/memory`);
    console.log(`🧠 Skills: http://localhost:${PORT}/api/skills`);
    console.log(`👶 Children: http://localhost:${PORT}/api/children`);
    console.log(`⚡ System: http://localhost:${PORT}/api/system`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/health\n`);
  });
}

export default app;
