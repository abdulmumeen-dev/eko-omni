// identity/captcha.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class CaptchaSolver {
  constructor(memory) {
    this.memory = memory;
    this.apiKey = process.env.CAPTCHA_API_KEY;
    this.provider = process.env.CAPTCHA_PROVIDER || '2captcha';
    this.solvedCount = 0;
  }

  // Solve a CAPTCHA
  async solve(siteKey, pageUrl) {
    console.log('[Captcha] Solving CAPTCHA...');

    if (!this.apiKey) {
      console.log('[Captcha] ⚠️ No API key set. Using simulation mode.');
      return { success: true, token: 'simulated_captcha_token', simulated: true };
    }

    try {
      let result;

      switch (this.provider) {
        case '2captcha':
          result = await this.solve2Captcha(siteKey, pageUrl);
          break;

        case 'capsolver':
          result = await this.solveCapSolver(siteKey, pageUrl);
          break;

        default:
          result = await this.solve2Captcha(siteKey, pageUrl);
      }

      if (result.success) {
        this.solvedCount++;
        this.memory.remember('identity', 'CAPTCHA solved', { provider: this.provider });
        console.log('[Captcha] ✅ Solved successfully');
      }

      return result;
    } catch (err) {
      console.error('[Captcha] Failed to solve:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2Captcha API
  async solve2Captcha(siteKey, pageUrl) {
    // Step 1: Submit CAPTCHA
    const submitResponse = await axios.post('https://2captcha.com/in.php', {
      key: this.apiKey,
      method: 'userrecaptcha',
      googlekey: siteKey,
      pageurl: pageUrl,
      json: 1
    });

    if (submitResponse.data.status !== 1) {
      throw new Error(submitResponse.data.request || 'Submission failed');
    }

    const requestId = submitResponse.data.request;

    // Step 2: Poll for result
    for (let i = 0; i < 30; i++) {
      const resultResponse = await axios.get('https://2captcha.com/res.php', {
        params: {
          key: this.apiKey,
          action: 'get',
          id: requestId,
          json: 1
        }
      });

      if (resultResponse.data.status === 1) {
        return { success: true, token: resultResponse.data.request };
      }

      if (resultResponse.data.request === 'CAPCHA_NOT_READY') {
        await this.sleep(5000);
        continue;
      }

      throw new Error(resultResponse.data.request || 'Solving failed');
    }

    throw new Error('Timeout: CAPTCHA not solved');
  }

  // CapSolver API
  async solveCapSolver(siteKey, pageUrl) {
    const submitResponse = await axios.post('https://api.capsolver.com/createTask', {
      clientKey: this.apiKey,
      task: {
        type: 'ReCaptchaV2TaskProxyless',
        websiteURL: pageUrl,
        websiteKey: siteKey
      }
    });

    if (!submitResponse.data.taskId) {
      throw new Error('Submission failed');
    }

    const taskId = submitResponse.data.taskId;

    for (let i = 0; i < 30; i++) {
      const resultResponse = await axios.post('https://api.capsolver.com/getTaskResult', {
        clientKey: this.apiKey,
        taskId: taskId
      });

      if (resultResponse.data.status === 'ready') {
        return { success: true, token: resultResponse.data.solution.gRecaptchaResponse };
      }

      await this.sleep(3000);
    }

    throw new Error('Timeout: CAPTCHA not solved');
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

export default CaptchaSolver;
