// limbs/followup_engine.js
export class FollowupEngine {
  constructor(memory, gmail) {
    this.memory = memory;
    this.gmail = gmail;
  }

  async sendFollowUp(application) {
    console.log(`[FollowupEngine] Sending follow-up for ${application.job.title}`);
    
    const subject = `Follow-up: ${application.job.title} application`;
    const body = this.generateFollowUpEmail(application);
    
    // In production, you'd use the Gmail module to send
    // const result = await this.gmail.sendEmail(application.job.contactEmail || 'hr@company.com', subject, body);
    
    // Simulate sending
    console.log(`[FollowupEngine] Follow-up email sent to ${application.job.company}`);
    
    this.memory.remember('followup', JSON.stringify({
      applicationId: application.id,
      subject: subject,
      body: body,
      timestamp: new Date().toISOString()
    }));
    
    return { success: true };
  }

  generateFollowUpEmail(application) {
    const job = application.job;
    const personaName = this.memory.persona?.getFullName?.() || 'EKO Agent';
    
    return `
Dear Hiring Team,

I hope this email finds you well. I wanted to follow up on my application for the ${job.title} position at ${job.company}.

I remain very interested in this opportunity and believe my skills and experience align well with your needs. If you need any additional information from me, please don't hesitate to ask.

Thank you for your time and consideration.

Best regards,
${personaName}
    `.trim();
  }

  async checkFollowups() {
    // Check which applications need follow-ups
    const apps = this.memory.search('application');
    const followups = this.memory.search('followup');
    
    // Simple logic: send follow-ups for applications that don't have one yet
    // In production, you'd use more sophisticated logic
    const applications = apps.map(a => {
      try { return JSON.parse(a.content); } catch { return null; }
    }).filter(Boolean);

    const followupIds = followups.map(f => {
      try { const parsed = JSON.parse(f.content); return parsed.applicationId; } catch { return null; }
    }).filter(Boolean);

    for (const app of applications) {
      if (!followupIds.includes(app.id) && app.status === 'submitted') {
        await this.sendFollowUp(app);
      }
    }
  }
}
