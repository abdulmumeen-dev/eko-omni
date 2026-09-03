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

// limbs/captcha_breaker.js
import { solveCaptchaFile, solveCaptchaURL, solveCaptchaOnPage } from '../bridge/captcha_bridge.js';

export class CaptchaBreaker {
  constructor(memory) {
    this.memory = memory;
    this.solvedCount = 0;
    this.fallbackKey = process.env.CAPTCHA_API_KEY;
    this.useFreeSolver = true; // Try free solver first
  }

  async solve(siteKey, pageUrl, imagePath = null) {
    console.log(`[CaptchaBreaker] Solving CAPTCHA...`);

    // Strategy 1: Free local solver (if we have an image)
    if (this.useFreeSolver && imagePath) {
      try {
        console.log('[CaptchaBreaker] Trying free local solver...');
        const result = await solveCaptchaFile(imagePath);
        if (result && result.success) {
          this.solvedCount++;
          this.memory.remember('captcha', JSON.stringify({
            method: 'free_local',
            solved: true,
            timestamp: new Date().toISOString()
          }));
          console.log('[CaptchaBreaker] ✅ Free solver worked!');
          return result.text;
        }
      } catch (error) {
        console.log('[CaptchaBreaker] Free solver failed:', error.message);
      }
    }

    // Strategy 2: Free solver on page (Playwright)
    if (this.useFreeSolver && pageUrl) {
      try {
        console.log('[CaptchaBreaker] Trying free page solver...');
        const result = await solveCaptchaOnPage(pageUrl);
        if (result && result.success && result.solved) {
          this.solvedCount++;
          this.memory.remember('captcha', JSON.stringify({
            method: 'free_page',
            solved: true,
            timestamp: new Date().toISOString()
          }));
          console.log('[CaptchaBreaker] ✅ Free page solver worked!');
          return 'solved';
        }
      } catch (error) {
        console.log('[CaptchaBreaker] Free page solver failed:', error.message);
      }
    }

    // Strategy 3: Fallback to 2captcha
    if (this.fallbackKey) {
      try {
        console.log('[CaptchaBreaker] Falling back to 2captcha...');
        const token = await this.solveWith2Captcha(siteKey, pageUrl);
        if (token) {
          this.solvedCount++;
          this.memory.remember('captcha', JSON.stringify({
            method: '2captcha',
            solved: true,
            timestamp: new Date().toISOString()
          }));
          console.log('[CaptchaBreaker] ✅ 2captcha worked!');
          return token;
        }
      } catch (error) {
        console.error('[CaptchaBreaker] 2captcha failed:', error.message);
      }
    }

    console.error('[CaptchaBreaker] ❌ All CAPTCHA methods failed');
    return null;
  }

  async solveWith2Captcha(siteKey, pageUrl) {
    // ... existing 2captcha code ...
    // (keeping the existing implementation)
  }

  getStats() {
    return {
      solved: this.solvedCount,
      method: this.useFreeSolver ? 'free + fallback' : 'fallback only',
      hasFallback: !!this.fallbackKey
    };
  }
}
