// identity/clone.js
import Persona from './persona.js';

class CloneManager {
  constructor(memory) {
    this.memory = memory;
    this.clones = this.loadClones();
  }

  loadClones() {
    const memoryClones = this.memory.search('clone');
    if (memoryClones && memoryClones.length > 0) {
      try {
        return JSON.parse(memoryClones[0].content);
      } catch {}
    }
    return [];
  }

  saveClones() {
    this.memory.remember('clone', JSON.stringify(this.clones));
  }

  createClone(template) {
    const cloneId = `clone_${Date.now()}`;
    const clone = {
      id: cloneId,
      ...template,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    this.clones.push(clone);
    this.saveClones();

    this.memory.remember('clone_created', JSON.stringify({
      cloneId,
      template,
      timestamp: new Date().toISOString()
    }));

    return clone;
  }

  getClone(id) {
    return this.clones.find(c => c.id === id);
  }

  getAllClones() {
    return this.clones;
  }

  deleteClone(id) {
    this.clones = this.clones.filter(c => c.id !== id);
    this.saveClones();
  }

  generateChildClone(parentPersona, customOverrides = {}) {
    const baseTemplate = parentPersona.getPersona();
    const childTemplate = {
      name: customOverrides.name || `${baseTemplate.name}-Child`,
      surname: customOverrides.surname || baseTemplate.surname,
      age: customOverrides.age || Math.max(1, baseTemplate.age - 10),
      role: customOverrides.role || `Junior ${baseTemplate.role}`,
      personality: customOverrides.personality || baseTemplate.personality,
      backstory: customOverrides.backstory || `Born from ${baseTemplate.name} ${baseTemplate.surname}, specialized in ${customOverrides.role || 'general'}.`,
      values: customOverrides.values || baseTemplate.values,
      tone: customOverrides.tone || baseTemplate.tone,
      defaultContext: customOverrides.defaultContext || baseTemplate.defaultContext,
      parentId: customOverrides.parentId || 'eko_main'
    };

    return this.createClone(childTemplate);
  }

  getClonesByParent(parentId) {
    return this.clones.filter(c => c.parentId === parentId);
  }
}

export default CloneManager;
