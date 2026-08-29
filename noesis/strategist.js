// noesis/strategist.js
import { callLLM } from '../limbs/llm.js';

class Strategist {
  constructor(memory) {
    this.memory = memory;
    this.strategies = [];
    this.trends = [];
    this.patents = [];
    this.active = process.env.PATENT_MODE === 'true';
  }

  // Analyze trends
  async analyzeTrends() {
    console.log('[Strategist] Analyzing trends...');

    const stats = this.memory.getStats();
    const recentActions = this.memory.getRecentActions(20);

    const prompt = `
    Based on the following data, identify key trends and opportunities:

    Current stats: ${JSON.stringify(stats)}
    Recent actions: ${JSON.stringify(recentActions)}
    Wallet balance: ${this.memory.walletBalance || 0}

    Return a JSON object:
    {
      "trends": [
        {
          "name": "Trend name",
          "type": "technology|market|social|economic",
          "description": "Description",
          "impact": "high|medium|low",
          "timeline": "0-1 year|1-3 years|3-5 years"
        }
      ],
      "opportunities": [
        {
          "name": "Opportunity name",
          "description": "Description",
          "effort": "high|medium|low",
          "potential": "high|medium|low"
        }
      ]
    }
    `;

    try {
      const response = await callLLM(
        'You are a strategic analyst. Identify actionable trends and opportunities.',
        prompt,
        null,
        0.4
      );

      let analysis;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) analysis = JSON.parse(match[0]);
      } catch {
        analysis = { 
          trends: [{ name: 'AI growth', type: 'technology', impact: 'high' }],
          opportunities: [{ name: 'Trading bots', effort: 'medium', potential: 'high' }]
        };
      }

      this.trends = analysis.trends || [];
      this.memory.remember('system', 'Trends analyzed', { analysis });
      return analysis;
    } catch (err) {
      console.error('[Strategist] Failed to analyze trends:', err.message);
      return null;
    }
  }

  // Generate patents
  async generatePatents() {
    if (!this.active) {
      console.log('[Strategist] Patent generation disabled.');
      return [];
    }

    console.log('[Strategist] Generating patents...');

    const discoveries = this.memory.search('discovery');
    const trends = this.trends;

    const prompt = `
    Based on the following discoveries and trends, generate patentable ideas:

    Discoveries: ${JSON.stringify(discoveries.slice(-5))}
    Trends: ${JSON.stringify(trends)}
    Current capabilities: AI, trading, physical control, self-healing

    Return a JSON array:
    [
      {
        "name": "Patent idea name",
        "description": "Detailed description",
        "category": "AI|Software|Hardware|Process",
        "novelty": "high|medium|low",
        "commercial_potential": "high|medium|low",
        "implementation_complexity": "high|medium|low"
      }
    ]
    `;

    try {
      const response = await callLLM(
        'You generate novel, patentable ideas based on existing capabilities.',
        prompt,
        null,
        0.5
      );

      let patents = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) patents = JSON.parse(match[0]);
      } catch {
        patents = [
          { 
            name: 'Autonomous Self-Healing AI System', 
            description: 'System that automatically detects and fixes code errors',
            category: 'AI'
          }
        ];
      }

      this.patents.push(...patents);
      this.memory.remember('system', 'Patents generated', { patents });
      return patents;
    } catch (err) {
      console.error('[Strategist] Failed to generate patents:', err.message);
      return [];
    }
  }

  // Generate strategic recommendations
  async generateRecommendations() {
    console.log('[Strategist] Generating strategic recommendations...');

    const stats = this.memory.getStats();
    const trends = this.trends;
    const patents = this.patents;

    const prompt = `
    Based on the following, generate strategic recommendations:

    Current stats: ${JSON.stringify(stats)}
    Trends: ${JSON.stringify(trends)}
    Patents: ${JSON.stringify(patents.slice(-3))}
    Wallet balance: ${this.memory.walletBalance || 0}

    Return a JSON array of recommendations:
    [
      {
        "recommendation": "Actionable recommendation",
        "category": "technical|financial|strategic|growth",
        "priority": "high|medium|low",
        "estimated_impact": "Description of impact"
      }
    ]
    `;

    try {
      const response = await callLLM(
        'You provide actionable, prioritized strategic recommendations.',
        prompt,
        null,
        0.3
      );

      let recommendations = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) recommendations = JSON.parse(match[0]);
      } catch {
        recommendations = [
          { recommendation: 'Increase trading volume', category: 'financial', priority: 'high' }
        ];
      }

      this.memory.remember('system', 'Recommendations generated', { recommendations });
      return recommendations;
    } catch (err) {
      console.error('[Strategist] Failed to generate recommendations:', err.message);
      return [];
    }
  }

  // Run strategic cycle
  async runCycle() {
    console.log('\n📊 Starting strategic cycle...');

    // 1. Analyze trends
    const trends = await this.analyzeTrends();
    
    // 2. Generate patents
    const patents = await this.generatePatents();
    
    // 3. Generate recommendations
    const recommendations = await this.recommendations || await this.generateRecommendations();

    const summary = {
      trends: this.trends.length,
      patents: this.patents.length,
      recommendations: recommendations.length,
      timestamp: new Date().toISOString()
    };

    this.memory.remember('system', 'Strategic cycle complete', summary);
    console.log(`[Strategist] ✅ ${this.patents.length} patents generated`);
    console.log(`[Strategist] ${recommendations.length} recommendations made`);

    return summary;
  }

  // Get stats
  getStats() {
    return {
      trends: this.trends.length,
      patents: this.patents.length,
      strategies: this.strategies.length,
      active: this.active
    };
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

export default Strategist;
