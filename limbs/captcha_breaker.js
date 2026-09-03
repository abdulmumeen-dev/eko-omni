// limbs/captcha_breaker.js
import axios from 'axios';

export class CaptchaBreaker {
  constructor(memory) {
    this.memory = memory;
    this.fallbackKey = process.env.CAPTCHA_API_KEY;
    this.solvedCount = 0;
  }

  async solve(siteKey, pageUrl) {
    console.log(`[CaptchaBreaker] Solving CAPTCHA for ${pageUrl}`);

    // Try local solver first (simplified)
    try {
      const localSolution = await this.tryLocalSolver(siteKey, pageUrl);
      if (localSolution) {
        this.solvedCount++;
        this.memory.remember('captcha', JSON.stringify({
          type: 'local',
          siteKey,
          pageUrl,
          solved: true,
          timestamp: new Date().toISOString()
        }));
        return localSolution;
      }
    } catch (error) {
      console.log('[CaptchaBreaker] Local solver failed, using fallback');
    }

    // Fallback to 2captcha
    if (this.fallbackKey) {
      try {
        const token = await this.solveWith2Captcha(siteKey, pageUrl);
        if (token) {
          this.solvedCount++;
          this.memory.remember('captcha', JSON.stringify({
            type: '2captcha',
            siteKey,
            pageUrl,
            solved: true,
            timestamp: new Date().toISOString()
          }));
          return token;
        }
      } catch (error) {
        console.error('[CaptchaBreaker] 2captcha failed:', error.message);
      }
    }

    console.error('[CaptchaBreaker] All CAPTCHA methods failed');
    return null;
  }

  async tryLocalSolver(siteKey, pageUrl) {
    // Simplified local solver
    // In production, you'd use a real local solver like AICaptcha
    return null;
  }

  async solveWith2Captcha(siteKey, pageUrl) {
    if (!this.fallbackKey) {
      throw new Error('No 2captcha API key');
    }

    // Submit CAPTCHA to 2captcha
    const submitResponse = await axios.post('https://2captcha.com/in.php', {
      key: this.fallbackKey,
      method: 'userrecaptcha',
      googlekey: siteKey,
      pageurl: pageUrl,
      json: 1
    });

    if (submitResponse.data.status !== 1) {
      throw new Error(submitResponse.data.request || '2captcha submission failed');
    }

    const requestId = submitResponse.data.request;

    // Poll for solution
    for (let i = 0; i < 30; i++) {
      await this.sleep(5000);
      const resultResponse = await axios.get('https://2captcha.com/res.php', {
        params: {
          key: this.fallbackKey,
          action: 'get',
          id: requestId,
          json: 1
        }
      });

      if (resultResponse.data.status === 1) {
        return resultResponse.data.request;
      }

      if (resultResponse.data.request !== 'CAPCHA_NOT_READY') {
        throw new Error(resultResponse.data.request || '2captcha solving failed');
      }
    }

    throw new Error('2captcha timeout');
  }

  getStats() {
    return {
      solved: this.solvedCount,
      provider: this.fallbackKey ? '2captcha' : 'none'
    };
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}
