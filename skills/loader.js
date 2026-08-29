// skills/loader.js
import fs from 'fs';
import path from 'path';
import { callLLM } from '../limbs/llm.js';

class SkillLoader {
  constructor(memory, proceduralMemory) {
    this.memory = memory;
    this.procedural = proceduralMemory;
    this.skillDir = './skills/built-in/';
    this.skills = [];
  }

  // Load all skills from markdown files
  loadSkills() {
    console.log('[Skills] Loading built-in skills...');

    if (!fs.existsSync(this.skillDir)) {
      console.log('[Skills] No skill directory found. Creating...');
      fs.mkdirSync(this.skillDir, { recursive: true });
      this.createDefaultSkills();
    }

    const files = fs.readdirSync(this.skillDir).filter(f => f.endsWith('.md'));
    let loaded = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.skillDir, file), 'utf8');
        const skill = this.parseSkill(content, file);
        if (skill) {
          // Add to procedural memory
          const existing = this.procedural.findSkill(skill.name);
          if (!existing) {
            this.procedural.addSkill(
              skill.name,
              skill.description,
              skill.steps || ['Analyze', 'Execute', 'Verify'],
              skill.performance || 50
            );
            loaded++;
            console.log(`[Skills] ✅ Loaded: ${skill.name}`);
          }
        }
      } catch (err) {
        console.error(`[Skills] Failed to load ${file}:`, err.message);
      }
    }

    console.log(`[Skills] Loaded ${loaded} skills`);
    return loaded;
  }

  // Parse markdown to skill object
  parseSkill(content, filename) {
    const skill = {
      name: filename.replace('.md', ''),
      description: '',
      steps: [],
      optimalConditions: [],
      example: null,
      performance: 50
    };

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('# ')) {
        skill.name = trimmed.replace('# ', '');
      } else if (trimmed.startsWith('## Description')) {
        currentSection = 'description';
      } else if (trimmed.startsWith('## Steps')) {
        currentSection = 'steps';
      } else if (trimmed.startsWith('## Use When')) {
        currentSection = 'conditions';
      } else if (trimmed.startsWith('## Example')) {
        currentSection = 'example';
      } else if (trimmed.startsWith('- ') && currentSection === 'steps') {
        skill.steps.push(trimmed.replace('- ', ''));
      } else if (trimmed.startsWith('- ') && currentSection === 'conditions') {
        skill.optimalConditions.push(trimmed.replace('- ', ''));
      } else if (currentSection === 'description' && trimmed && !trimmed.startsWith('##')) {
        skill.description += trimmed + ' ';
      }
    }

    skill.description = skill.description.trim();
    return skill;
  }

  // Create default skills if none exist
  createDefaultSkills() {
    const defaults = [
      {
        name: 'research.md',
        content: `# Research

## Description
Research topics on the web and summarize findings.

## Steps
- Identify research topic
- Search web for sources
- Extract key information
- Summarize findings

## Use When
- Learning new topics
- Market analysis
- Competitor research

## Example
\`\`\`json
{
  "action": "research",
  "topic": "AI trends 2026"
}
\`\`\`
`
      },
      {
        name: 'trading.md',
        content: `# Trading

## Description
Execute crypto trades and arbitrage opportunities.

## Steps
- Analyze market
- Identify opportunity
- Execute trade
- Log profit/loss

## Use When
- Market gaps exist
- Profitable opportunities available

## Example
\`\`\`json
{
  "action": "trade",
  "asset": "BTC",
  "amount": 100
}
\`\`\`
`
      },
      {
        name: 'market_analysis.md',
        content: `# Market Analysis

## Description
Identify market gaps and opportunities.

## Steps
- Scan markets
- Analyze trends
- Identify gaps
- Plan solution

## Use When
- Looking for revenue streams
- Finding new opportunities

## Example
\`\`\`json
{
  "action": "analyze",
  "market": "crypto"
}
\`\`\`
`
      }
    ];

    for (const skill of defaults) {
      const filePath = path.join(this.skillDir, skill.name);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, skill.content, 'utf8');
      }
    }
  }
}

export default SkillLoader;
