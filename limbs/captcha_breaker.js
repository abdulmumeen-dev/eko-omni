// limbs/captcha_breaker.js
import { solveCaptchaFile, solveCaptchaURL, solveCaptchaOnPage } from '../bridge/captcha_bridge.js';

export class CaptchaBreaker {
  constructor(memory) {
    this.memory = memory;
    this.solvedCount = 0;
    this.fallbackKey = process.env.CAPTCHA_API_KEY;
    this.useFreeSolver = true;
  }

  async solve(siteKey, pageUrl, imagePath = null) {
    console.log(`[CaptchaBreaker] Solving CAPTCHA...`);

    // Strategy 1: Free local solver
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

    // Strategy 2: Free page solver
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
    if (!this.fallbackKey) {
      throw new Error('No 2captcha API key');
    }

    const submitResponse = await fetch('https://2captcha.com/in.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: this.fallbackKey,
        method: 'userrecaptcha',
        googlekey: siteKey,
        pageurl: pageUrl,
        json: 1
      })
    });
    const submitData = await submitResponse.json();

    if (submitData.status !== 1) {
      throw new Error(submitData.request || '2captcha submission failed');
    }

    const requestId = submitData.request;

    for (let i = 0; i < 30; i++) {
      await this.sleep(5000);
      const resultResponse = await fetch(`https://2captcha.com/res.php?key=${this.fallbackKey}&action=get&id=${requestId}&json=1`);
      const resultData = await resultResponse.json();

      if (resultData.status === 1) {
        return resultData.request;
      }

      if (resultData.request !== 'CAPCHA_NOT_READY') {
        throw new Error(resultData.request || '2captcha solving failed');
      }
    }

    throw new Error('2captcha timeout');
  }

  getStats() {
    return {
      solved: this.solvedCount,
      method: this.useFreeSolver ? 'free + fallback' : 'fallback only',
      hasFallback: !!this.fallbackKey
    };
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}
