// knowledge/loop.js
import { callLLM } from '../limbs/llm.js';
import KnowledgeBase from './base.js';

class KnowledgeLoop {
  constructor(memory, proceduralMemory) {
    this.memory = memory;
    this.procedural = proceduralMemory;
    this.knowledgeBase = new KnowledgeBase(memory);
    this.iterations = 0;
    this.topicsExplored = [];
    this.lastInsight = null;
  }

  // Run one knowledge loop iteration
  async runIteration() {
    this.iterations++;
    console.log(`[KnowledgeLoop] Iteration ${this.iterations}`);

    try {
      // 1. Identify what to learn
      const topic = await this.identifyKnowledgeGap();
      if (!topic) {
        console.log('[KnowledgeLoop] No new topics to learn');
        return { learned: false };
      }

      // 2. Learn the topic
      const knowledge = await this.knowledgeBase.learn(topic);
      if (!knowledge) {
        console.log('[KnowledgeLoop] Failed to learn');
        return { learned: false };
      }

      // 3. Extract skills from knowledge
      const skills = await this.extractSkills(knowledge);
      if (skills) {
        console.log(`[KnowledgeLoop] Extracted ${skills.length} skills`);
      }

      // 4. Apply knowledge to opportunities
      const opportunities = await this.findOpportunities();
      if (opportunities) {
        console.log(`[KnowledgeLoop] Found ${opportunities.length} opportunities`);
      }

      // 5. Remember the iteration
      this.memory.remember('knowledge_loop', `Iteration ${this.iterations}`, {
        topic,
        learned: true,
        opportunities: opportunities?.length || 0
      });

      this.topicsExplored.push(topic);
      this.lastInsight = knowledge;

      return { learned: true, topic, knowledge, opportunities };
    } catch (err) {
      console.error('[KnowledgeLoop] Iteration failed:', err.message);
      return { learned: false, error: err.message };
    }
  }

  // Identify what to learn next
  async identifyKnowledgeGap() {
    console.log('[KnowledgeLoop] Identifying knowledge gap...');

    const existing = this.memory.search('knowledge');
    const topics = existing.map(m => m.content).slice(-5);

    const prompt = `
    Based on what I already know and my goals, what should I learn next?

    Recent topics: ${topics.join(', ') || 'None yet'}

    Return a single, specific topic to research.
    Example: "Decentralized Finance 2026 trends"
    `;

    try {
      const response = await callLLM(
        'You are an AI deciding what to learn next.',
        prompt,
        null,
        0.3
      );
      return response.trim();
    } catch (err) {
      console.error('[KnowledgeLoop] Failed to identify gap:', err.message);
      return null;
    }
  }

  // Extract skills from knowledge
  async extractSkills(knowledge) {
    console.log('[KnowledgeLoop] Extracting skills...');

    const prompt = `
    From this knowledge, extract 1-3 skills I should develop:

    Knowledge: ${JSON.stringify(knowledge)}

    Return a JSON array:
    [
      {
        "name": "Skill name",
        "description": "What it does",
        "steps": ["Step 1", "Step 2"]
      }
    ]
    `;

    try {
      const response = await callLLM(
        'You extract actionable skills from knowledge.',
        prompt,
        null,
        0.3
      );
      let skills = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) skills = JSON.parse(match[0]);
      } catch {
        skills = [];
      }

      // Add to procedural memory
      for (const skill of skills) {
        const existing = this.procedural.findSkill(skill.name);
        if (!existing) {
          this.procedural.addSkill(
            skill.name,
            skill.description,
            skill.steps || ['Analyze', 'Execute'],
            50
          );
          console.log(`[KnowledgeLoop] Added skill: ${skill.name}`);
        }
      }

      return skills;
    } catch (err) {
      console.error('[KnowledgeLoop] Failed to extract skills:', err.message);
      return [];
    }
  }

  // Find opportunities from knowledge
  async findOpportunities() {
    console.log('[KnowledgeLoop] Finding opportunities...');

    const knowledge = this.knowledgeBase.getKnowledge();

    const prompt = `
    Based on this knowledge, what opportunities exist?

    Knowledge: ${JSON.stringify(knowledge.slice(-3))}

    Return a JSON array:
    [
      {
        "opportunity": "Description",
        "type": "market|tech|skill",
        "potential": "High|Medium|Low"
      }
    ]
    `;

    try {
      const response = await callLLM(
        'You identify opportunities from knowledge.',
        prompt,
        null,
        0.4
      );
      let opportunities = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) opportunities = JSON.parse(match[0]);
      } catch {
        opportunities = [];
      }

      // Store opportunities in memory
      for (const opp of opportunities) {
        this.memory.remember('opportunity', opp.opportunity, {
          type: opp.type,
          potential: opp.potential
        });
      }

      return opportunities;
    } catch (err) {
      console.error('[KnowledgeLoop] Failed to find opportunities:', err.message);
      return [];
    }
  }

  getStats() {
    return {
      iterations: this.iterations,
      topicsExplored: this.topicsExplored.length,
      lastInsight: this.lastInsight
    };
  }
}

export default KnowledgeLoop;
