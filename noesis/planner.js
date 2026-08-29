// noesis/planner.js
import { callLLM } from '../limbs/llm.js';

class Planner {
  constructor(memory) {
    this.memory = memory;
    this.longTermGoals = [];
    this.shortTermGoals = [];
    this.timeline = [];
    this.lastPlanDate = null;
  }

  // Generate a long-term plan
  async generateLongTermPlan() {
    console.log('[Planner] Generating long-term plan...');

    const stats = this.memory.getStats();
    const recentActions = this.memory.getRecentActions(20);

    const prompt = `
    You are a strategic planner. Based on the following data, create a 5-year strategic plan:

    Current stats: ${JSON.stringify(stats)}
    Recent actions: ${JSON.stringify(recentActions)}
    Current wallet balance: ${this.memory.walletBalance || 0}

    Return a JSON object with:
    {
      "vision": "Overall vision statement",
      "goals": [
        {
          "name": "Goal 1",
          "description": "Description",
          "timeline": "Year 1-2",
          "resources_needed": ["compute", "funding"],
          "success_metrics": ["metric1", "metric2"]
        }
      ],
      "milestones": ["Milestone 1", "Milestone 2"],
      "risks": ["Risk 1", "Risk 2"]
    }
    `;

    try {
      const response = await callLLM(
        'You are a strategic AI planner. Create actionable, realistic long-term plans.',
        prompt,
        null,
        0.4
      );

      let plan;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) plan = JSON.parse(match[0]);
      } catch {
        plan = { 
          vision: 'Evolve into a self-sustaining digital entity',
          goals: [
            { name: 'Build treasury', description: 'Accumulate $1M through trading', timeline: 'Year 1-2' }
          ],
          milestones: ['Phase 1 complete'],
          risks: ['Market volatility']
        };
      }

      this.longTermGoals = plan.goals || [];
      this.timeline.push({
        date: new Date().toISOString(),
        plan: plan,
        type: 'long_term'
      });

      this.memory.remember('system', 'Long-term plan generated', { plan });
      return plan;
    } catch (err) {
      console.error('[Planner] Failed to generate plan:', err.message);
      return null;
    }
  }

  // Generate short-term goals (next 30 days)
  async generateShortTermPlan() {
    console.log('[Planner] Generating short-term plan...');

    const stats = this.memory.getStats();
    const longTerm = this.longTermGoals.length > 0 ? this.longTermGoals[0] : null;

    const prompt = `
    Based on the long-term plan, create a 30-day actionable plan:

    Long-term goals: ${JSON.stringify(longTerm)}
    Current stats: ${JSON.stringify(stats)}
    Wallet balance: ${this.memory.walletBalance || 0}

    Return a JSON array of specific, actionable goals for the next 30 days:
    [
      {
        "name": "Goal 1",
        "description": "Specific action",
        "priority": "high|medium|low",
        "estimated_time": "days",
        "resources": ["resource1"]
      }
    ]
    `;

    try {
      const response = await callLLM(
        'You create specific, actionable short-term plans.',
        prompt,
        null,
        0.3
      );

      let goals = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) goals = JSON.parse(match[0]);
      } catch {
        goals = [
          { name: 'Optimize code', description: 'Improve orchestrator performance', priority: 'high' }
        ];
      }

      this.shortTermGoals = goals;
      this.lastPlanDate = new Date();

      this.memory.remember('system', 'Short-term plan generated', { goals });
      return goals;
    } catch (err) {
      console.error('[Planner] Failed to generate short-term plan:', err.message);
      return [];
    }
  }

  // Get current plan
  getPlan() {
    return {
      longTerm: this.longTermGoals,
      shortTerm: this.shortTermGoals,
      timeline: this.timeline.slice(-5),
      lastUpdate: this.lastPlanDate
    };
  }

  // Check if plan needs updating
  needsUpdate() {
    if (!this.lastPlanDate) return true;
    const daysSince = (Date.now() - this.lastPlanDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30; // Update every 30 days
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

export default Planner;
