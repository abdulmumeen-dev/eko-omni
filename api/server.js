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
  
  // Status endpoint
  app.get('/api/status', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const status = {
      running: ekoInstance.running,
      identity: ekoInstance.identity,
      wallet: {
        balance: ekoInstance.walletBalance
      },
      stats: {
        cycles: ekoInstance.cycleCount,
        discoveries: ekoInstance.discoveriesCount,
        patents: ekoInstance.patentsCount,
        children: ekoInstance.replicator?.children?.length || 0,
        skills: ekoInstance.procedural?.getAll()?.length || 0
      },
      memory: ekoInstance.memory?.getStats() || {},
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  });
  
  // Memory endpoint
  app.get('/api/memory', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const limit = parseInt(req.query.limit) || 20;
    const memories = ekoInstance.memory?.recall(limit) || [];
    res.json({ memories, count: memories.length });
  });
  
  // Goals endpoint
  app.post('/api/goal', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }
    
    ekoInstance.memory?.remember('user', goal);
    res.json({ success: true, goal, timestamp: new Date().toISOString() });
  });
  
  // Skills endpoint
  app.get('/api/skills', (req, res) => {
    if (!ekoInstance) {
      return res.status(503).json({ error: 'EKO not initialized' });
    }
    
    const skills = ekoInstance.procedural?.getAll() || [];
    res.json({ skills, count: skills.length });
  });
  
  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
  
  // Start server
  app.listen(PORT, () => {
    console.log(`🌐 API server running on http://localhost:${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    console.log(`📝 Memory: http://localhost:${PORT}/api/memory`);
    console.log(`🧠 Skills: http://localhost:${PORT}/api/skills`);
  });
}

export default app;
