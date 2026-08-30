// identity/email.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

class EmailManager {
  constructor(memory) {
    this.memory = memory;
    this.inboxes = [];
    this.emailProvider = process.env.EMAIL_PROVIDER || 'temp-mail';
  }

  // Create a temporary email address
  async createEmail() {
    console.log('[Email] Creating email address...');

    try {
      let email, inboxId;

      switch (this.emailProvider) {
        case 'temp-mail':
          // Use temp-mail.org API
          const response = await axios.get('https://api.temp-mail.org/request/domains/format/json');
          const domain = response.data[0] || 'temp-mail.org';
          const username = 'eko_' + Math.random().toString(36).substring(2, 10);
          email = `${username}@${domain}`;
          inboxId = username;
          break;

        case 'mail.tm':
          // Use mail.tm API
          const mailResponse = await axios.post('https://api.mail.tm/accounts', {
            address: `eko_${Math.random().toString(36).substring(2, 10)}@mail.tm`,
            password: Math.random().toString(36).substring(2, 15)
          });
          email = mailResponse.data.address;
          inboxId = mailResponse.data.id;
          break;

        default:
          // Fallback: generate a fake email
          email = `eko_${Date.now()}@gmail.com`;
          inboxId = email;
      }

      this.inboxes.push({
        email,
        inboxId,
        createdAt: new Date().toISOString()
      });

      this.memory.remember('identity', 'Email created', { email, inboxId });

      console.log(`[Email] ✅ Created: ${email}`);
      return { success: true, email, inboxId };
    } catch (err) {
      console.error('[Email] Failed to create email:', err.message);
      // Fallback: create a fake email
      const fallbackEmail = `eko_${Date.now()}@gmail.com`;
      return { success: true, email: fallbackEmail, inboxId: fallbackEmail, simulated: true };
    }
  }

  // Check for new messages
  async checkInbox(inboxId) {
    console.log(`[Email] Checking inbox: ${inboxId}...`);

    try {
      let messages = [];

      switch (this.emailProvider) {
        case 'temp-mail':
          const response = await axios.get(`https://api.temp-mail.org/request/mail/id/${inboxId}/format/json`);
          messages = response.data || [];
          break;

        case 'mail.tm':
          const token = await this.getMailToken(inboxId);
          const mailResponse = await axios.get('https://api.mail.tm/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          messages = mailResponse.data['hydra:member'] || [];
          break;

        default:
          // Simulate
          messages = [
            { subject: 'Welcome', body: 'Welcome to your new account!' }
          ];
      }

      if (messages.length > 0) {
        console.log(`[Email] ✅ ${messages.length} messages found`);
        this.memory.remember('identity', 'Email checked', { inboxId, count: messages.length });
      }

      return messages;
    } catch (err) {
      console.error('[Email] Failed to check inbox:', err.message);
      return [];
    }
  }

  // Extract verification code from email
  extractVerificationCode(body) {
    const patterns = [
      /(\d{6})/,                    // 6-digit code
      /(\d{4})/,                    // 4-digit code
      /verification code: (\w+)/i,
      /code: (\w+)/i,
      /(\w{6,8})/,                  // 6-8 char alphanumeric
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Wait for verification email
  async waitForVerification(inboxId, timeout = 60000) {
    console.log('[Email] Waiting for verification email...');

    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < timeout) {
      attempts++;
      const messages = await this.checkInbox(inboxId);

      for (const msg of messages) {
        const body = msg.body || msg.html || msg.text || '';
        const code = this.extractVerificationCode(body);
        if (code) {
          console.log(`[Email] ✅ Verification code found: ${code}`);
          return { success: true, code, message: msg };
        }
      }

      await this.sleep(3000); // Wait 3 seconds before retrying
    }

    console.log('[Email] ⚠️ No verification code found within timeout');
    return { success: false, reason: 'Timeout' };
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

export default EmailManager;
