// skills/skill_extractor.js
import { callLLM } from '../limbs/llm.js';

class SkillExtractor {
  constructor(memory, proceduralMemory) {
    this.memory = memory;
    this.procedural = proceduralMemory;
  }

  // Extract a skill from a successful task
  async extractSkill(task, result, context = '') {
    console.log('[SkillExtractor] Extracting skill from task...');

    const prompt = `
    You are a skill extraction AI. Analyze this task and result to extract a reusable skill.

    Task: ${task}
    Result: ${JSON.stringify(result)}
    Context: ${context}

    Extract the key steps and patterns. Return a JSON object:
    {
      "name": "Short, descriptive skill name",
      "description": "What this skill does",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "optimal_conditions": ["condition1", "condition2"],
      "performance_score": 0-100
    }
    `;

    try {
      const response = await callLLM(
        'You extract reusable skills from successful tasks.',
        prompt,
        null,
        0.3
      );

      let skill;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) skill = JSON.parse(match[0]);
      } catch {
        skill = {
          name: 'Skill from task',
          description: 'Extracted skill',
          steps: ['Analyze', 'Execute', 'Verify'],
          optimal_conditions: ['Stable environment'],
          performance_score: 50
        };
      }

      // Save to procedural memory
      const saved = this.procedural.addSkill(
        skill.name,
        skill.description,
        skill.steps,
        skill.performance_score || 50
      );

      this.memory.remember('system', `Skill extracted: ${skill.name}`, { skill });
      console.log(`[SkillExtractor] ✅ Extracted: ${skill.name}`);
      return saved;
    } catch (err) {
      console.error('[SkillExtractor] Failed to extract skill:', err.message);
      return null;
    }
  }

  // Auto-extract from recent memory
  async autoExtract() {
    console.log('[SkillExtractor] Auto-extracting skills from memory...');

    const recentSuccesses = this.memory.search('success');
    if (recentSuccesses.length === 0) {
      console.log('[SkillExtractor] No successes found.');
      return [];
    }

    const extracted = [];
    for (const success of recentSuccesses.slice(-3)) {
      try {
        const skill = await this.extractSkill(
          success.content || 'Task',
          success.metadata || {},
          'Auto-extraction'
        );
        if (skill) extracted.push(skill);
      } catch (err) {
        console.error('[SkillExtractor] Auto-extract failed:', err.message);
      }
    }

    return extracted;
  }
}

export default SkillExtractor;
