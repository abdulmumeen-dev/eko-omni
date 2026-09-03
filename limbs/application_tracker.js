// limbs/application_tracker.js
export class ApplicationTracker {
  constructor(memory) {
    this.memory = memory;
  }

  addApplication(job, status = 'submitted') {
    const application = {
      id: `app_${Date.now()}`,
      job: job,
      status: status,
      timestamp: new Date().toISOString(),
      updates: [
        {
          status: status,
          timestamp: new Date().toISOString()
        }
      ]
    };
    this.memory.remember('application', JSON.stringify(application));
    console.log(`[ApplicationTracker] Added application: ${job.title} at ${job.company}`);
    return application;
  }

  getApplications(status = null) {
    const apps = this.memory.search('application');
    const parsed = apps.map(a => {
      try {
        return JSON.parse(a.content);
      } catch {
        return null;
      }
    }).filter(Boolean);

    if (status) {
      return parsed.filter(a => a.status === status);
    }
    return parsed;
  }

  getApplicationById(id) {
    const apps = this.getApplications();
    return apps.find(a => a.id === id) || null;
  }

  updateStatus(id, newStatus, notes = '') {
    const apps = this.memory.search('application');
    for (const app of apps) {
      try {
        const parsed = JSON.parse(app.content);
        if (parsed.id === id) {
          parsed.status = newStatus;
          parsed.updates.push({
            status: newStatus,
            notes: notes,
            timestamp: new Date().toISOString()
          });
          // Update in memory (remove old, add new)
          // In a real implementation, you'd have a proper update method
          console.log(`[ApplicationTracker] Updated ${id} to ${newStatus}`);
          return parsed;
        }
      } catch {}
    }
    return null;
  }

  getStats() {
    const apps = this.getApplications();
    const byStatus = {};
    for (const app of apps) {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    }
    return {
      total: apps.length,
      byStatus: byStatus
    };
  }
}
