// knowledge/knowledge_base.js
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

  // Learn about a new topic
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

  // Find market gaps
  async findMarketGaps() {
    console.log('[Knowledge] Analyzing market gaps...');

    const prompt = `
    You are a market analyst. Identify 3-5 market gaps or opportunities:

    Current domains: ${this.domains.join(', ')}

    Return a JSON array:
    [
      {
        "opportunity": "Description of opportunity",
        "domain": "Which domain",
        "gap": "What's missing",
        "solution": "What EKO could build",
        "potential": "High/Medium/Low",
        "effort": "High/Medium/Low"
      }
    ]
    `;

    try {
      const response = await callLLM(
        'You are a market analyst finding opportunities for an autonomous AI.',
        prompt,
        null,
        0.5
      );

      let gaps = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) gaps = JSON.parse(match[0]);
      } catch {
        gaps = [
          {
            opportunity: 'AI Trading Bot',
            domain: 'Crypto',
            gap: 'Inefficient arbitrage',
            solution: 'Build automated arbitrage',
            potential: 'High',
            effort: 'Medium'
          }
        ];
      }

      this.memory.remember('system', 'Market gaps analyzed', { gaps });
      return gaps;
    } catch (err) {
      console.error('[Knowledge] Market analysis failed:', err.message);
      return [];
    }
  }

  // Get all knowledge
  getKnowledge() {
    const memories = this.memory.search('knowledge');
    return memories.map(m => ({
      topic: m.content,
      details: m.metadata,
      learnedAt: m.timestamp
    }));
  }

  // Get stats
  getStats() {
    return {
      domains: this.domains.length,
      knowledgeEntries: this.getKnowledge().length,
      lastUpdate: this.lastUpdate
    };
  }
}

export default KnowledgeBase;
