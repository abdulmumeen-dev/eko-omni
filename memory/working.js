// memory/working.js
class WorkingMemory {
  constructor(memory) {
    this.memory = memory;
    this.context = [];
    this.maxContext = 20;
  }

  // Add to working memory
  add(role, content, metadata = {}) {
    const entry = {
      role,
      content,
      metadata,
      timestamp: new Date().toISOString()
    };
    this.context.push(entry);
    if (this.context.length > this.maxContext) {
      this.context.shift();
    }
    // Also store in eternal memory
    this.memory.remember(role, content, metadata);
    return entry;
  }

  // Get current context
  getContext(limit = 10) {
    return this.context.slice(-limit);
  }

  // Clear working memory (keep eternal)
  clear() {
    this.context = [];
  }

  // Get stats
  getStats() {
    return {
      size: this.context.length,
      max: this.maxContext
    };
  }
}

export default WorkingMemory;
