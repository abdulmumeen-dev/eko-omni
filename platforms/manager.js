// platforms/manager.js
import { callLLM } from '../limbs/llm.js';

class PlatformManager {
  constructor(memory) {
    this.memory = memory;
    this.platforms = [];
    this.messages = [];
  }

  // Register a platform
  registerPlatform(name, handler) {
    this.platforms.push({
      name,
      handler,
      registered: new Date().toISOString()
    });
    console.log(`[PlatformManager] Registered: ${name}`);
  }

  // Send a message across platforms
  async sendMessage(platform, message, recipient) {
    console.log(`[PlatformManager] Sending message to ${platform}...`);

    const platformHandler = this.platforms.find(p => p.name === platform);
    if (!platformHandler) {
      console.log(`[PlatformManager] Platform ${platform} not registered.`);
      return { success: false, error: 'Platform not registered' };
    }

    try {
      // In production: call platform handler
      // For now: simulate
      const result = {
        success: true,
        platform,
        recipient,
        message,
        sentAt: new Date().toISOString()
      };

      this.messages.push(result);
      this.memory.remember('system', `Message sent to ${platform}`, { result });
      console.log(`[PlatformManager] ✅ Message sent to ${platform}`);
      return result;
    } catch (err) {
      console.error(`[PlatformManager] Failed to send to ${platform}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Broadcast a message to all platforms
  async broadcast(message) {
    console.log(`[PlatformManager] Broadcasting...`);
    const results = [];
    for (const platform of this.platforms) {
      const result = await this.sendMessage(platform.name, message, 'all');
      results.push(result);
    }
    return results;
  }

  // Get incoming messages (simulated)
  async receiveMessages(platform) {
    // In production: webhooks or polling
    // For now: return recent messages
    return this.messages.filter(m => !platform || m.platform === platform);
  }

  // Process messages using LLM
  async processMessage(message) {
    const prompt = `
    You are EKO's message processor. Respond to this message:
    ${message}

    Return a JSON response:
    {
      "response": "Your response here",
      "action": "What action to take"
    }
    `;

    try {
      const response = await callLLM(
        'You are a helpful AI assistant responding to messages.',
        prompt,
        null,
        0.4
      );
      let parsed;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {
        parsed = { response: response, action: 'none' };
      }
      return parsed;
    } catch (err) {
      console.error('[PlatformManager] Failed to process message:', err.message);
      return { response: 'Error processing message.', action: 'none' };
    }
  }

  // Get stats
  getStats() {
    return {
      platforms: this.platforms.map(p => p.name),
      totalMessages: this.messages.length
    };
  }
}

export default PlatformManager;
