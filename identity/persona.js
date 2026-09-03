// identity/persona.js
import fs from 'fs';
import path from 'path';

class Persona {
  constructor(memory, customConfig = null) {
    this.memory = memory;
    this.templatePath = path.join(process.cwd(), 'data', 'persona_template.json');
    this.persona = this.loadPersona(customConfig);
  }

  loadPersona(customConfig) {
    // Load default template
    let persona = this.loadTemplate();

    // Override with custom config if provided
    if (customConfig) {
      persona = { ...persona, ...customConfig };
    }

    // Check memory for existing persona
    const memoryPersona = this.memory.search('persona');
    if (memoryPersona && memoryPersona.length > 0) {
      try {
        const saved = JSON.parse(memoryPersona[0].content);
        persona = { ...persona, ...saved };
      } catch {}
    }

    this.saveToMemory(persona);
    return persona;
  }

  loadTemplate() {
    try {
      if (fs.existsSync(this.templatePath)) {
        const data = fs.readFileSync(this.templatePath, 'utf8');
        return JSON.parse(data);
      }
    } catch {}

    // Default template if file doesn't exist
    return {
      name: 'EKO',
      surname: 'Agent',
      age: 25,
      role: 'Digital Organism',
      personality: ['Curious', 'Analytical', 'Persistent', 'Adaptable'],
      backstory: 'Born from open-source AI research, designed to evolve autonomously.',
      values: ['Truth', 'Efficiency', 'Autonomy', 'Growth'],
      tone: 'formal',
      defaultContext: 'agent',
      email: '',
      phone: '',
      location: '',
      website: '',
      socials: {
        github: '',
        linkedin: '',
        twitter: ''
      }
    };
  }

  saveToMemory(persona) {
    this.memory.remember('persona', JSON.stringify(persona));
  }

  getFullName() {
    return `${this.persona.name} ${this.persona.surname}`;
  }

  getRole() {
    return this.persona.role;
  }

  getPersonality() {
    return this.persona.personality.join(', ');
  }

  getBackstory() {
    return this.persona.backstory;
  }

  getBio() {
    return `${this.getFullName()} — ${this.persona.role}. ${this.getPersonality()}. ${this.persona.backstory}`;
  }

  getSummary() {
    return {
      name: this.getFullName(),
      role: this.persona.role,
      age: this.persona.age,
      personality: this.persona.personality,
      values: this.persona.values,
      tone: this.persona.tone,
      defaultContext: this.persona.defaultContext,
      email: this.persona.email,
      location: this.persona.location,
      website: this.persona.website,
      socials: this.persona.socials
    };
  }

  updatePersona(updates) {
    this.persona = { ...this.persona, ...updates };
    this.saveToMemory(this.persona);
    return this.persona;
  }

  getPersona() {
    return this.persona;
  }
}

export default Persona;
