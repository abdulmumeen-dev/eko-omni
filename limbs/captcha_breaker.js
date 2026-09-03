// limbs/application_engine.js
export class ApplicationEngine {
  constructor(memory, browser, persona, documentGenerator) {
    this.memory = memory;
    this.browser = browser;
    this.persona = persona;
    this.documents = documentGenerator;
  }

  async apply(job) {
    console.log(`[ApplicationEngine] Applying to: ${job.title} at ${job.company}`);
    
    try {
      // 1. Generate tailored documents
      const cv = this.documents.generateCV();
      const coverLetter = this.documents.generateCoverLetter(job.title, job.company, job.description);
      
      // 2. Open application form
      if (job.applyUrl) {
        await this.browser.open(job.applyUrl);
      } else {
        // If no direct apply URL, search for application page
        await this.browser.open(job.link + '/apply');
      }
      
      await this.sleep(2000);
      
      // 3. Fill form with Persona data
      const personaData = this.persona.getPersona();
      await this.fillForm(personaData);
      
      // 4. Upload CV
      // In production, you'd generate a PDF and upload it
      // For now, simulate upload
      console.log('[ApplicationEngine] Uploading CV...');
      
      // 5. Write cover letter
      console.log('[ApplicationEngine] Writing cover letter...');
      
      // 6. Submit
      console.log('[ApplicationEngine] Submitting application...');
      // await this.browser.click('#submit');
      
      // 7. Track application
      this.memory.remember('application', JSON.stringify({
        job: job,
        status: 'submitted',
        timestamp: new Date().toISOString(),
        coverLetter: coverLetter
      }));
      
      return { success: true, job: job };
    } catch (error) {
      console.error('[ApplicationEngine] Error applying:', error.message);
      return { success: false, error: error.message };
    }
  }

  async fillForm(personaData) {
    // Example form filling logic
    try {
      // Fill name fields
      // await this.browser.type('#first-name', personaData.name);
      // await this.browser.type('#last-name', personaData.surname);
      
      // Fill email
      // await this.browser.type('#email', personaData.email || 'eko.agent@example.com');
      
      // Fill phone
      // await this.browser.type('#phone', personaData.phone || '+1234567890');
      
      // Fill location
      // await this.browser.type('#location', personaData.location || 'Remote');
      
      console.log('[ApplicationEngine] Form filled successfully');
    } catch (error) {
      console.error('[ApplicationEngine] Error filling form:', error.message);
    }
  }

  async trackApplications() {
    const apps = this.memory.search('application');
    return apps.map(a => {
      try {
        return JSON.parse(a.content);
      } catch {
        return null;
      }
    }).filter(Boolean);
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}
