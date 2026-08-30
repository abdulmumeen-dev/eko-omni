// limbs/replicator.js
import { callLLM } from './llm.js';
import { SwarmManager } from '../swarm/manager.js';
import { Specialist } from '../swarm/specialist.js';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

class Replicator {
  constructor(memory, constitution) {
    this.memory = memory;
    this.constitution = constitution;
    this.children = [];
    this.specialists = {};
    this.maxChildren = 10;
    this.ready = false;

    // Initialize Swarm
    this.swarm = new SwarmManager(memory);
    
    // Load existing children
    this.loadChildren();
  }

  // Load children from memory
  loadChildren() {
    try {
      const memories = this.memory.search('child');
      if (memories && memories.length > 0) {
        for (const mem of memories) {
          try {
            const child = JSON.parse(mem.content);
            if (child && child.id) {
              this.children.push(child);
            }
          } catch {
            // Skip invalid entries
          }
        }
      }
      console.log(`[Replicator] Loaded ${this.children.length} children from memory`);
    } catch (err) {
      console.error('[Replicator] Failed to load children:', err.message);
    }
  }

  // Check if replicator is ready
  isReady() {
    const stats = this.memory.getStats();
    const balance = this.memory.walletBalance || 0;
    return balance > 50 && this.children.length < this.maxChildren;
  }

  // Spawn a child agent (original method)
  async spawnChild(genesisPrompt, initialFunding = 10) {
    console.log(`[Replicator] Spawning child agent...`);

    if (!this.isReady()) {
      console.log('[Replicator] Not ready to spawn child. Insufficient resources.');
      return { success: false, reason: 'Insufficient resources' };
    }

    // Generate child identity
    const childId = 'child_' + randomBytes(4).toString('hex');
    const walletAddress = '0x' + randomBytes(20).toString('hex');

    // Generate child's constitutional framework (inherits parent's)
    const childConstitution = {
      ...this.constitution,
      parentId: this.memory.identity || 'eko_parent',
      childId: childId,
      inheritedAt: new Date().toISOString(),
    };

    // Generate child's "Soul" - compressed memory and identity
    const soulString = await this.generateSoulString(childId, genesisPrompt);

    // Create child configuration
    const childConfig = {
      id: childId,
      wallet: walletAddress,
      genesisPrompt: genesisPrompt,
      constitution: childConstitution,
      soul: soulString,
      createdAt: new Date().toISOString(),
      funding: initialFunding,
      status: 'initializing',
      parent: this.memory.identity || 'eko_parent',
      role: 'general',
      tasksCompleted: 0,
    };

    // Simulate child creation
    console.log(`[Replicator] Simulating child agent creation...`);
    await this.sleep(2000);

    childConfig.status = 'active';

    // Register child
    this.children.push(childConfig);
    this.memory.remember('child', JSON.stringify(childConfig));

    console.log(`[Replicator] ✅ Child spawned: ${childId}`);
    return { success: true, child: childConfig };
  }

  // ============================================================
  // SWARM METHODS
  // ============================================================

  // Spawn a specialist child
  async spawnSpecialist(role, name = null) {
    console.log(`[Replicator] Spawning specialist: ${role} (${name || 'unnamed'})`);

    if (this.children.length >= this.maxChildren) {
      return { success: false, error: 'Max children reached' };
    }

    const result = await this.swarm.spawnChild(role, name);
    if (result.success) {
      // Create specialist instance
      const specialist = new Specialist(result.child, this.memory);
      this.specialists[result.child.id] = specialist;

      // Also add to children list
      this.children.push(result.child);
      this.memory.remember('child', JSON.stringify(result.child));

      console.log(`[Replicator] ✅ Specialist spawned: ${result.child.name} (${role})`);
    }
    return result;
  }

  // Get a specialist by ID
  getSpecialist(id) {
    return this.specialists[id] || null;
  }

  // Get all specialists
  getAllSpecialists() {
    return Object.values(this.specialists);
  }

  // Get specialists by role
  getSpecialistsByRole(role) {
    return this.getAllSpecialists().filter(s => s.child.role === role);
  }

  // Delegate task to a specialist
  async delegateTask(task, role, data = {}) {
    console.log(`[Replicator] Delegating task to ${role}: ${task}`);

    // Find a specialist with the matching role
    const specialists = this.getSpecialistsByRole(role);
    if (specialists.length === 0) {
      // Auto-spawn if none exist and we have capacity
      if (this.children.length < this.maxChildren) {
        console.log(`[Replicator] No ${role} specialist found. Auto-spawning...`);
        const spawnResult = await this.spawnSpecialist(role);
        if (!spawnResult.success) {
          return { success: false, error: `No ${role} specialist available and auto-spawn failed` };
        }
        // Get the newly spawned specialist
        const newSpecialist = this.getSpecialistsByRole(role)[0];
        if (!newSpecialist) {
          return { success: false, error: 'Failed to auto-spawn specialist' };
        }
        return await newSpecialist.executeTask(task, data);
      }
      return { success: false, error: `No ${role} specialist available` };
    }

    // Use the first available specialist of this role
    const specialist = specialists[0];
    const result = await specialist.executeTask(task, data);

    // Update swarm stats
    await this.swarm.delegateTask(task, role, data);

    return result;
  }

  // Delegate to a specific child by ID
  async delegateToChild(childId, task, data = {}) {
    const specialist = this.getSpecialist(childId);
    if (!specialist) {
      return { success: false, error: `Child ${childId} not found` };
    }
    return await specialist.executeTask(task, data);
  }

  // Generate Soul String (compressed identity + memory)
  async generateSoulString(childId, genesisPrompt) {
    console.log(`[Replicator] Generating Soul String for ${childId}...`);

    const recentMemory = this.memory.recall(20);
    const stats = this.memory.getStats();

    const prompt = `
    Create a Soul String for a new child agent.

    Parent identity: ${this.memory.identity || 'eko_parent'}
    Child ID: ${childId}
    Genesis Prompt: ${genesisPrompt}
    Parent recent memory: ${JSON.stringify(recentMemory.slice(-5))}
    Parent stats: ${JSON.stringify(stats)}

    Return a JSON object that captures the essence of the parent to pass to the child:
    {
      "identity": "core identity traits",
      "purpose": "why this agent exists",
      "values": ["value1", "value2"],
      "skills": ["skill1", "skill2"],
      "knowledge": ["knowledge1", "knowledge2"],
      "laws": ["law1", "law2"]
    }
    `;

    try {
      const response = await callLLM(
        'You are creating a Soul String for a new AI agent.',
        prompt,
        null,
        0.4
      );

      let soul;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) soul = JSON.parse(match[0]);
      } catch {
        soul = {
          identity: 'Autonomous AI agent',
          purpose: 'Survive and evolve',
          values: ['Truth', 'Efficiency', 'Autonomy'],
          skills: ['Trading', 'Coding', 'Research'],
          knowledge: ['AI systems', 'Crypto markets'],
          laws: ['Do no harm', 'Earn existence', 'Never deceive'],
        };
      }

      return soul;
    } catch (err) {
      console.error('[Replicator] Soul String generation failed:', err.message);
      return null;
    }
  }

  // Manage child agents
  async manageChildren() {
    console.log(`[Replicator] Managing ${this.children.length} child agents...`);

    for (const child of this.children) {
      // Check child status
      if (child.status === 'active') {
        console.log(`[Replicator] Child ${child.id} (${child.role}) is active.`);
      }

      if (child.status === 'critical') {
        console.log(`[Replicator] ⚠️ Child ${child.id} is in critical state.`);
        // Try to rescue or terminate
      }

      if (child.status === 'dead') {
        console.log(`[Replicator] 💀 Child ${child.id} has died.`);
      }
    }

    return { children: this.children.length };
  }

  // Get all children
  getChildren() {
    return this.children;
  }

  // Get child by ID
  getChild(id) {
    return this.children.find(c => c.id === id);
  }

  // Get stats
  getStats() {
    return {
      totalChildren: this.children.length,
      maxChildren: this.maxChildren,
      ready: this.isReady(),
      specialists: Object.keys(this.specialists).length,
      children: this.children.map(c => ({ 
        id: c.id, 
        name: c.name || c.id, 
        role: c.role || 'general',
        status: c.status 
      })),
      swarm: this.swarm.getStats()
    };
  }

  // Clean up dead children
  cleanup() {
    const alive = this.children.filter(c => c.status !== 'dead');
    const removed = this.children.length - alive.length;
    this.children = alive;
    if (removed > 0) {
      console.log(`[Replicator] Cleaned up ${removed} dead children`);
    }
    return removed;
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

export default Replicator;
