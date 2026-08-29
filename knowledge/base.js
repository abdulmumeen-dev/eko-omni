// knowledge/base.js
import { callLLM } from '../limbs/llm.js';

class KnowledgeBase {
  constructor(memory) {
    this.memory = memory;
    this.domains = [
      'AI/ML', 'Crypto', 'DeFi', 'Web3', 'Physics',
      'Biology', 'Materials Science', 'Economics', 'Business'
    ];
    this.lastUpdate = null;
  }

  async learn(topic) {
    console.log(`[Knowledge] Learning: ${topic}`);

    const prompt = `
    You are a research AI. Learn about this topic and produce a structured summary:

    Topic: ${topic}

    Return a JSON object:
    {
      "summary": "Key concepts and understanding",
      "applications": ["How this can be used"],
      "opportunities": ["Market/tech gaps"],
      "skills_needed": ["What skills to build"],
      "resources": ["Links, papers, tools"]
    }
    `;

    try {
      const response = await callLLM(
        'You are a deep research AI that learns and finds opportunities.',
        prompt,
        null,
        0.4
      );

      let knowledge;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) knowledge = JSON.parse(match[0]);
      } catch {
        knowledge = {
          summary: 'Learned about ' + topic,
          applications: ['Research', 'Analysis'],
          opportunities: ['Identify gaps'],
          skills_needed: ['Research', 'Analysis'],
          resources: []
        };
      }

      this.memory.remember('knowledge', `Learned: ${topic}`, { knowledge });
      this.lastUpdate = new Date().toISOString();

      console.log(`[Knowledge] ✅ Learned: ${topic}`);
      return knowledge;
    } catch (err) {
      console.error('[Knowledge] Failed to learn:', err.message);
      return null;
    }
  }

  getKnowledge() {
    const memories = this.memory.search('knowledge');
    return memories.map(m => ({
      topic: m.content,
      details: m.metadata,
      learnedAt: m.timestamp
    }));
  }

  getStats() {
    return {
      domains: this.domains.length,
      knowledgeEntries: this.getKnowledge().length,
      lastUpdate: this.lastUpdate
    };
  }
}

export default KnowledgeBase;
