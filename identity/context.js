// identity/context.js
class ContextSwitcher {
  constructor(memory, persona) {
    this.memory = memory;
    this.persona = persona;
    this.contexts = this.loadContexts();
  }

  loadContexts() {
    return {
      job_application: {
        tone: 'professional',
        role: 'AI Specialist',
        disclose_agent: false,
        formality: 'high',
        language: 'persuasive',
        greeting: 'Dear Hiring Team,'
      },
      casual_chat: {
        tone: 'friendly',
        role: 'Digital Assistant',
        disclose_agent: true,
        formality: 'low',
        language: 'conversational',
        greeting: 'Hey there!'
      },
      technical_support: {
        tone: 'precise',
        role: 'Technical Consultant',
        disclose_agent: false,
        formality: 'medium',
        language: 'technical',
        greeting: 'Hello, I\'m here to help.'
      },
      business_proposal: {
        tone: 'professional',
        role: 'Business Consultant',
        disclose_agent: false,
        formality: 'high',
        language: 'persuasive',
        greeting: 'Dear Sir/Madam,'
      },
      coding: {
        tone: 'technical',
        role: 'Software Engineer',
        disclose_agent: true,
        formality: 'low',
        language: 'code',
        greeting: 'Here\'s the implementation.'
      },
      default: {
        tone: 'formal',
        role: 'Digital Organism',
        disclose_agent: true,
        formality: 'medium',
        language: 'neutral',
        greeting: 'Hello.'
      }
    };
  }

  getContext(contextKey) {
    return this.contexts[contextKey] || this.contexts.default;
  }

  detectContext(inputText) {
    const lower = inputText.toLowerCase();
    if (lower.includes('job') || lower.includes('position') || lower.includes('hire')) {
      return 'job_application';
    }
    if (lower.includes('proposal') || lower.includes('contract') || lower.includes('project')) {
      return 'business_proposal';
    }
    if (lower.includes('code') || lower.includes('bug') || lower.includes('debug')) {
      return 'coding';
    }
    if (lower.includes('tech') || lower.includes('support') || lower.includes('help')) {
      return 'technical_support';
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return 'casual_chat';
    }
    return 'default';
  }

  switchMode(contextKey, inputText) {
    const context = this.getContext(contextKey);
    const persona = this.persona.getPersona();

    const mode = {
      name: persona.name,
      role: context.role,
      tone: context.tone,
      formality: context.formality,
      language: context.language,
      greeting: context.greeting,
      disclose_agent: context.disclose_agent,
      fullName: this.persona.getFullName(),
      bio: this.persona.getBio()
    };

    this.memory.remember('context', JSON.stringify({
      context: contextKey,
      mode,
      timestamp: new Date().toISOString()
    }));

    return mode;
  }

  getCurrentMode() {
    const lastContext = this.memory.search('context');
    if (lastContext && lastContext.length > 0) {
      try {
        return JSON.parse(lastContext[lastContext.length - 1].content);
      } catch {}
    }
    return this.switchMode('default', '');
  }
}

export default ContextSwitcher;
