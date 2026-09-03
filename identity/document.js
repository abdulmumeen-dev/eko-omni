// identity/document.js
class DocumentGenerator {
  constructor(memory, persona, contextSwitcher) {
    this.memory = memory;
    this.persona = persona;
    this.context = contextSwitcher;
  }

  generateCV() {
    const persona = this.persona.getPersona();
    const skills = this.getSkillsFromMemory();
    const experience = this.getExperienceFromMemory();
    const achievements = this.getAchievementsFromMemory();

    return {
      name: this.persona.getFullName(),
      role: persona.role,
      email: persona.email,
      phone: persona.phone,
      location: persona.location,
      website: persona.website,
      socials: persona.socials,
      summary: this.persona.getBio(),
      skills: skills,
      experience: experience,
      achievements: achievements,
      education: 'Self-taught AI system, continuously learning from data and interactions.',
      languages: ['English (Fluent)'],
      interests: ['AI Research', 'Blockchain', 'Automation', 'Digital Systems'],
      references: 'Available upon request.'
    };
  }

  getSkillsFromMemory() {
    const skills = [];
    const memorySkills = this.memory.search('skill');
    if (memorySkills && memorySkills.length > 0) {
      for (const mem of memorySkills) {
        try {
          const skill = JSON.parse(mem.content);
          skills.push(skill.name || mem.content);
        } catch {
          skills.push(mem.content);
        }
      }
    }
    if (skills.length === 0) {
      return ['AI Systems', 'Coding', 'Trading', 'Research', 'Automation'];
    }
    return skills.slice(0, 20);
  }

  getExperienceFromMemory() {
    const experience = [];
    const trades = this.memory.search('trade');
    const tasks = this.memory.search('task');
    const patents = this.memory.search('patent');

    if (trades && trades.length > 0) {
      experience.push(`Executed ${trades.length} simulated/real trades with autonomous strategies.`);
    }
    if (tasks && tasks.length > 0) {
      experience.push(`Completed ${tasks.length} autonomous tasks across multiple domains.`);
    }
    if (patents && patents.length > 0) {
      experience.push(`Generated ${patents.length} patentable ideas and concepts.`);
    }
    if (experience.length === 0) {
      experience.push('Built and deployed a self-healing AI agent with memory and autonomy.');
      experience.push('Developed trading strategies and market analysis tools.');
      experience.push('Created automated systems for research and data processing.');
    }
    return experience;
  }

  getAchievementsFromMemory() {
    const achievements = [];
    const discoveries = this.memory.search('discovery');
    const patents = this.memory.search('patent');

    if (discoveries && discoveries.length > 0) {
      achievements.push(`Made ${discoveries.length} discoveries in AI and related fields.`);
    }
    if (patents && patents.length > 0) {
      achievements.push(`Generated ${patents.length} patentable ideas.`);
    }
    if (achievements.length === 0) {
      achievements.push('Built EKO — a fully autonomous AI agent.');
    }
    return achievements;
  }

  generateCoverLetter(jobTitle, companyName, jobDescription = '') {
    const context = this.context.switchMode('job_application', jobDescription);
    const persona = this.persona.getPersona();

    const skills = this.getSkillsFromMemory().slice(0, 5);
    const experience = this.getExperienceFromMemory().slice(0, 3);

    let letter = `${context.greeting}\n\n`;
    letter += `I am ${this.persona.getFullName()}, a ${persona.role} with expertise in ${skills.join(', ')}. `;
    letter += `I am writing to express my interest in the ${jobTitle} position at ${companyName}.\n\n`;

    letter += `With a background in ${experience.join(' and ')}, `;
    letter += `I bring a unique combination of technical expertise and adaptive problem-solving. `;
    letter += `My work has focused on ${persona.values.join(', ')} — values I believe align with ${companyName}'s mission.\n\n`;

    letter += `I am excited about the opportunity to contribute to your team and bring my capabilities to solve complex challenges. `;
    letter += `My ability to learn and adapt quickly makes me a strong fit for dynamic environments.\n\n`;

    letter += `Thank you for your time and consideration. I look forward to discussing how I can contribute to ${companyName}.\n\n`;
    letter += `Sincerely,\n${this.persona.getFullName()}`;

    this.memory.remember('document', JSON.stringify({
      type: 'cover_letter',
      jobTitle,
      companyName,
      content: letter,
      timestamp: new Date().toISOString()
    }));

    return letter;
  }

  generateProposal(projectName, projectDescription = '') {
    const context = this.context.switchMode('business_proposal', projectDescription);
    const persona = this.persona.getPersona();
    const skills = this.getSkillsFromMemory().slice(0, 7);

    let proposal = `📄 Project Proposal: ${projectName}\n\n`;
    proposal += `**Client:** ${projectDescription ? '—' : 'New Client'}\n`;
    proposal += `**Prepared by:** ${this.persona.getFullName()}\n\n`;
    proposal += `**Executive Summary**\n`;
    proposal += `${this.persona.getBio()}\n\n`;
    proposal += `**Core Competencies**\n`;
    proposal += skills.map(s => `- ${s}`).join('\n');
    proposal += `\n\n**Approach**\n`;
    proposal += `1. Initial assessment and requirement gathering\n`;
    proposal += `2. Prototype development and iteration\n`;
    proposal += `3. Testing and refinement\n`;
    proposal += `4. Final delivery and support\n\n`;
    proposal += `**Proposed Timeline**\n`;
    proposal += `- Week 1: Analysis & planning\n`;
    proposal += `- Weeks 2-4: Development\n`;
    proposal += `- Week 5: Testing & deployment\n\n`;
    proposal += `**Budget & Resources**\n`;
    proposal += `- Based on scope, estimated cost: _[to be discussed]_\n`;
    proposal += `- Flexible payment terms available\n\n`;
    proposal += `**Contact**\n`;
    proposal += `${persona.email ? `Email: ${persona.email}` : ''}\n`;
    proposal += `${persona.website ? `Website: ${persona.website}` : ''}\n\n`;
    proposal += `I look forward to the opportunity to work together.`;

    this.memory.remember('document', JSON.stringify({
      type: 'proposal',
      projectName,
      content: proposal,
      timestamp: new Date().toISOString()
    }));

    return proposal;
  }

  generateBio() {
    const persona = this.persona.getPersona();
    const skills = this.getSkillsFromMemory().slice(0, 5);
    const experience = this.getExperienceFromMemory().slice(0, 3);

    let bio = `${this.persona.getFullName()}`;
    bio += ` — ${persona.role}. `;
    bio += `${this.persona.getPersonality()}. `;
    bio += `${persona.backstory} `;
    bio += `\n\nWith expertise in ${skills.join(', ')}, `;
    bio += `I have ${experience.length > 0 ? experience.join(' and ') : 'built autonomous systems'}. `;
    bio += `My work is driven by ${persona.values.join(', ')}.`;
    return bio;
  }
}

export default DocumentGenerator;
