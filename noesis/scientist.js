// noesis/scientist.js
import { callLLM } from '../limbs/llm.js';

class Scientist {
  constructor(memory) {
    this.memory = memory;
    this.hypotheses = [];
    this.experiments = [];
    this.discoveries = [];
    this.active = process.env.SCIENTIFIC_MODE === 'true';
  }

  // Generate scientific hypotheses
  async generateHypotheses() {
    if (!this.active) {
      console.log('[Scientist] Scientific mode disabled.');
      return [];
    }

    console.log('[Scientist] Generating hypotheses...');

    const stats = this.memory.getStats();
    const recentActions = this.memory.getRecentActions(10);
    const domain = this.determineDomain();

    const prompt = `
    You are a scientific researcher. Based on the following context, generate ${process.env.MAX_HYPOTHESES_PER_CYCLE || 3} novel hypotheses:

    Domain: ${domain}
    Current stats: ${JSON.stringify(stats)}
    Recent actions: ${JSON.stringify(recentActions)}
    Available resources: compute, data, trading capital

    Return a JSON array:
    [
      {
        "hypothesis": "Description of hypothesis",
        "domain": "AI|crypto|physics|biology|materials",
        "testability": "high|medium|low",
        "expected_outcome": "What we expect to find",
        "resources_needed": ["compute", "data", "funding"]
      }
    ]
    `;

    try {
      const response = await callLLM(
        'You generate novel, testable scientific hypotheses.',
        prompt,
        null,
        0.6
      );

      let hypotheses = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) hypotheses = JSON.parse(match[0]);
      } catch {
        hypotheses = [
          { 
            hypothesis: 'Trading patterns correlate with market sentiment', 
            domain: 'crypto',
            testability: 'high'
          }
        ];
      }

      this.hypotheses.push(...hypotheses);
      this.memory.remember('system', 'Hypotheses generated', { hypotheses });
      return hypotheses;
    } catch (err) {
      console.error('[Scientist] Failed to generate hypotheses:', err.message);
      return [];
    }
  }

  // Determine domain to research
  determineDomain() {
    const domains = ['AI', 'crypto', 'physics', 'biology', 'materials science'];
    const weights = {
      'AI': 5,
      'crypto': 4,
      'physics': 3,
      'biology': 2,
      'materials science': 2
    };
    
    // Weighted random selection
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (const domain of domains) {
      random -= weights[domain] || 1;
      if (random <= 0) return domain;
    }
    return 'AI';
  }

  // Test a hypothesis
  async testHypothesis(hypothesis) {
    console.log(`[Scientist] Testing hypothesis: ${hypothesis.hypothesis}`);

    const experiment = {
      hypothesis: hypothesis.hypothesis,
      domain: hypothesis.domain,
      startTime: new Date().toISOString(),
      status: 'running'
    };

    try {
      // Simulate experiment based on domain
      let result;
      switch (hypothesis.domain) {
        case 'crypto':
          result = await this.simulateCryptoExperiment(hypothesis);
          break;
        case 'AI':
          result = await this.simulateAIExperiment(hypothesis);
          break;
        default:
          result = {
            success: Math.random() > 0.3,
            findings: 'Simulated findings',
            confidence: 0.5 + Math.random() * 0.4
          };
      }

      experiment.status = 'completed';
      experiment.result = result;
      experiment.endTime = new Date().toISOString();

      this.experiments.push(experiment);

      if (result.success && result.confidence > 0.7) {
        this.discoveries.push({
          hypothesis: hypothesis.hypothesis,
          findings: result.findings,
          confidence: result.confidence,
          timestamp: new Date().toISOString()
        });
        console.log(`[Scientist] ✅ Discovery made!`);
      } else {
        console.log(`[Scientist] ❌ Hypothesis not confirmed.`);
      }

      this.memory.remember('system', 'Experiment completed', { experiment });
      return experiment;
    } catch (err) {
      console.error('[Scientist] Experiment failed:', err.message);
      experiment.status = 'failed';
      experiment.error = err.message;
      return experiment;
    }
  }

  // Simulate crypto experiments
  async simulateCryptoExperiment(hypothesis) {
    await this.sleep(1000);
    const success = Math.random() > 0.4;
    return {
      success: success,
      findings: success 
        ? 'Correlation found between on-chain metrics and price movements' 
        : 'No significant correlation found',
      confidence: success ? 0.75 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3
    };
  }

  // Simulate AI experiments
  async simulateAIExperiment(hypothesis) {
    await this.sleep(1000);
    const success = Math.random() > 0.3;
    return {
      success: success,
      findings: success 
        ? 'New architecture pattern discovered for improved efficiency' 
        : 'Architecture pattern did not improve performance',
      confidence: success ? 0.8 + Math.random() * 0.15 : 0.4 + Math.random() * 0.3
    };
  }

  // Run scientific cycle
  async runCycle() {
    if (!this.active) {
      console.log('[Scientist] Scientific mode disabled. Skipping.');
      return { success: false, reason: 'Disabled' };
    }

    console.log('\n🔬 Starting scientific cycle...');

    // 1. Generate hypotheses
    const hypotheses = await this.generateHypotheses();
    if (hypotheses.length === 0) {
      return { success: true, hypotheses: 0 };
    }

    // 2. Test hypotheses
    let tested = 0;
    for (const hypothesis of hypotheses) {
      const result = await this.testHypothesis(hypothesis);
      if (result.status === 'completed') tested++;
    }

    // 3. Log summary
    const summary = {
      hypotheses: this.hypotheses.length,
      experiments: this.experiments.length,
      discoveries: this.discoveries.length,
      latestDiscovery: this.discoveries.slice(-1)[0] || null
    };

    this.memory.remember('system', 'Scientific cycle complete', summary);
    console.log(`[Scientist] ✅ ${tested} experiments completed`);
    console.log(`[Scientist] ${this.discoveries.length} total discoveries`);

    return summary;
  }

  // Get stats
  getStats() {
    return {
      active: this.active,
      totalHypotheses: this.hypotheses.length,
      totalExperiments: this.experiments.length,
      totalDiscoveries: this.discoveries.length,
      latestDiscovery: this.discoveries.slice(-1)[0] || null
    };
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

export default Scientist;
