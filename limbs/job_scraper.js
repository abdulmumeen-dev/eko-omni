// limbs/job_scraper.js
export class JobScraper {
  constructor(memory, browser) {
    this.memory = memory;
    this.browser = browser;
    this.sites = [
      'linkedin',
      'indeed',
      'upwork',
      'glassdoor',
      'monster',
      'remoteok',
      'weworkremotely',
      'angellist',
      'ziprecruiter'
    ];
  }

  async search(query, location = 'remote') {
    console.log(`[JobScraper] Searching for: ${query} in ${location}`);
    let allJobs = [];

    // Scrape each site
    for (const site of this.sites) {
      try {
        console.log(`[JobScraper] Scraping ${site}...`);
        let jobs = [];
        switch (site) {
          case 'linkedin':
            jobs = await this.scrapeLinkedIn(query, location);
            break;
          case 'indeed':
            jobs = await this.scrapeIndeed(query, location);
            break;
          case 'upwork':
            jobs = await this.scrapeUpwork(query, location);
            break;
          case 'glassdoor':
            jobs = await this.scrapeGlassdoor(query, location);
            break;
          case 'monster':
            jobs = await this.scrapeMonster(query, location);
            break;
          case 'remoteok':
            jobs = await this.scrapeRemoteOK(query);
            break;
          case 'weworkremotely':
            jobs = await this.scrapeWeWorkRemotely(query);
            break;
          case 'angellist':
            jobs = await this.scrapeAngelList(query, location);
            break;
          case 'ziprecruiter':
            jobs = await this.scrapeZipRecruiter(query, location);
            break;
          default:
            break;
        }
        allJobs = allJobs.concat(jobs);
        console.log(`[JobScraper] ${site}: found ${jobs.length} jobs`);
      } catch (error) {
        console.error(`[JobScraper] ${site} error:`, error.message);
      }
      
      // Small delay between sites
      await this.sleep(2000);
    }

    // Store in memory
    for (const job of allJobs) {
      this.memory.remember('job', JSON.stringify(job));
    }

    return allJobs;
  }

  // ============================================================
  // SITE-SPECIFIC SCRAPERS
  // ============================================================

  async scrapeLinkedIn(query, location) {
    const jobs = [];
    try {
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
      await this.browser.open(url);
      await this.sleep(3000);
      
      // LinkedIn job cards
      const cards = await this.browser.page.$$('.job-card-container');
      for (const card of cards.slice(0, 10)) {
        try {
          const title = await card.$eval('.job-card-list__title', el => el.textContent.trim());
          const company = await card.$eval('.job-card-container__company-name', el => el.textContent.trim());
          const link = await card.$eval('a', el => el.href);
          jobs.push({ title, company, link, source: 'LinkedIn', location });
        } catch {}
      }
    } catch (error) {
      console.error('[JobScraper] LinkedIn error:', error.message);
    }
    return jobs;
  }

  async scrapeIndeed(query, location) {
    const jobs = [];
    try {
      const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
      await this.browser.open(url);
      await this.sleep(3000);
      
      const cards = await this.browser.page.$$('.job_seen_beacon');
      for (const card of cards.slice(0, 10)) {
        try {
          const title = await card.$eval('.jobTitle', el => el.textContent.trim());
          const company = await card.$eval('.companyName', el => el.textContent.trim());
          const link = await card.$eval('a', el => 'https://indeed.com' + el.getAttribute('href'));
          jobs.push({ title, company, link, source: 'Indeed', location });
        } catch {}
      }
    } catch (error) {
      console.error('[JobScraper] Indeed error:', error.message);
    }
    return jobs;
  }

  async scrapeUpwork(query, location) {
    const jobs = [];
    try {
      const url = `https://www.upwork.com/freelance-jobs/${encodeURIComponent(query)}/`;
      await this.browser.open(url);
      await this.sleep(3000);
      
      const cards = await this.browser.page.$$('.job-tile');
      for (const card of cards.slice(0, 10)) {
        try {
          const title = await card.$eval('.job-title', el => el.textContent.trim());
          const company = await card.$eval('.client-name', el => el.textContent.trim());
          const link = await card.$eval('a', el => el.href);
          jobs.push({ title, company, link, source: 'Upwork', location });
        } catch {}
      }
    } catch (error) {
      console.error('[JobScraper] Upwork error:', error.message);
    }
    return jobs;
  }

  async scrapeGlassdoor(query, location) {
    const jobs = [];
    try {
      const url = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(query)}&locT=C&locId=${encodeURIComponent(location)}`;
      await this.browser.open(url);
      await this.sleep(3000);
      // Glassdoor scraping logic
    } catch (error) {
      console.error('[JobScraper] Glassdoor error:', error.message);
    }
    return jobs;
  }

  async scrapeMonster(query, location) {
    const jobs = [];
    try {
      const url = `https://www.monster.com/jobs/search/?q=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}`;
      await this.browser.open(url);
      await this.sleep(3000);
      // Monster scraping logic
    } catch (error) {
      console.error('[JobScraper] Monster error:', error.message);
    }
    return jobs;
  }

  async scrapeRemoteOK(query) {
    const jobs = [];
    try {
      const url = `https://remoteok.com/remote-${encodeURIComponent(query)}-jobs`;
      await this.browser.open(url);
      await this.sleep(3000);
      
      const cards = await this.browser.page.$$('tr.job');
      for (const card of cards.slice(0, 10)) {
        try {
          const title = await card.$eval('.company_and_position h2', el => el.textContent.trim());
          const company = await card.$eval('.company_and_position .company', el => el.textContent.trim());
          const link = await card.$eval('a', el => 'https://remoteok.com' + el.getAttribute('href'));
          jobs.push({ title, company, link, source: 'RemoteOK', location: 'remote' });
        } catch {}
      }
    } catch (error) {
      console.error('[JobScraper] RemoteOK error:', error.message);
    }
    return jobs;
  }

  async scrapeWeWorkRemotely(query) {
    const jobs = [];
    try {
      const url = `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(query)}`;
      await this.browser.open(url);
      await this.sleep(3000);
      // WeWorkRemotely scraping logic
    } catch (error) {
      console.error('[JobScraper] WeWorkRemotely error:', error.message);
    }
    return jobs;
  }

  async scrapeAngelList(query, location) {
    const jobs = [];
    try {
      const url = `https://wellfound.com/jobs?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
      await this.browser.open(url);
      await this.sleep(3000);
      // AngelList/Wellfound scraping logic
    } catch (error) {
      console.error('[JobScraper] AngelList error:', error.message);
    }
    return jobs;
  }

  async scrapeZipRecruiter(query, location) {
    const jobs = [];
    try {
      const url = `https://www.ziprecruiter.com/jobs-search?search=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
      await this.browser.open(url);
      await this.sleep(3000);
      // ZipRecruiter scraping logic
    } catch (error) {
      console.error('[JobScraper] ZipRecruiter error:', error.message);
    }
    return jobs;
  }

  async parseDescription(url) {
    console.log(`[JobScraper] Parsing job: ${url}`);
    try {
      await this.browser.open(url);
      await this.sleep(2000);
      
      const title = await this.browser.page.title();
      const description = await this.browser.page.$eval('body', el => el.textContent.slice(0, 2000));
      
      return {
        title: title || 'Job Title',
        company: 'Company',
        description: description || 'Job description',
        requirements: ['Requirement 1', 'Requirement 2'],
        applyUrl: url
      };
    } catch (error) {
      console.error('[JobScraper] Parse error:', error.message);
      return null;
    }
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}
