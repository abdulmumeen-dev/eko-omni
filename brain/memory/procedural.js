// memory/procedural.js
class ProceduralMemory {
  constructor(memory) {
    this.memory = memory;
    this.skills = [];
    this.maxSkills = 50;
  }

  // Add a skill (learned procedure)
  addSkill(name, description, steps, performance = 0) {
    const skill = {
      id: 'skill_' + Date.now(),
      name,
      description,
      steps,
      performance,
      uses: 0,
      createdAt: new Date().toISOString(),
      lastUsed: null
    };
    this.skills.push(skill);
    if (this.skills.length > this.maxSkills) {
      this.skills.shift();
    }
    this.memory.remember('skill', `Learned: ${name}`, { skill });
    return skill;
  }

  // Find a skill by name
  findSkill(name) {
    return this.skills.find(s => 
      s.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Get all skills
  getAll() {
    return this.skills;
  }

  // Get best performing skills
  getBest(limit = 5) {
    return this.skills
      .sort((a, b) => b.performance - a.performance)
      .slice(0, limit);
  }

  // Use a skill (track performance)
  useSkill(name) {
    const skill = this.findSkill(name);
    if (skill) {
      skill.uses++;
      skill.lastUsed = new Date().toISOString();
      // Performance improves with use (capped at 100)
      skill.performance = Math.min(100, skill.performance + 1);
      this.memory.remember('system', `Used skill: ${name}`, { skill });
      return skill;
    }
    return null;
  }

  // Get stats
  getStats() {
    return {
      totalSkills: this.skills.length,
      maxSkills: this.maxSkills,
      avgPerformance: this.skills.length > 0 
        ? this.skills.reduce((a, b) => a + b.performance, 0) / this.skills.length
        : 0
    };
  }
}

export default ProceduralMemory;
