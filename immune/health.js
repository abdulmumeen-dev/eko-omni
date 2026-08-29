// immune/health.js
import os from 'os';
import fs from 'fs';

class HealthMonitor {
  constructor(memory) {
    this.memory = memory;
    this.isHealthy = true;
    this.lastCheck = Date.now();
  }

  check() {
    const now = Date.now();
    const uptime = os.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(1);
    const cpuLoad = os.loadavg()[0].toFixed(2);

    const status = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 60 / 60) + 'h',
      cpuLoad: cpuLoad,
      memoryUsage: memUsage + '%',
      isHealthy: parseFloat(cpuLoad) < 5 && parseFloat(memUsage) < 90
    };

    this.isHealthy = status.isHealthy;
    this.lastCheck = now;

    // Log to memory every 10 checks
    if (Math.floor(now / 10000) % 10 === 0) {
      this.memory.remember('system', 'Health check', { status });
    }

    return status;
  }

  getStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheck: new Date(this.lastCheck).toISOString()
    };
  }
}

export default HealthMonitor;
