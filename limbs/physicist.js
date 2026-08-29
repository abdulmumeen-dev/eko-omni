// limbs/physicist.js
import { callLLM } from './llm.js';
import axios from 'axios';

class Physicist {
  constructor(memory) {
    this.memory = memory;
    this.devices = [];
    this.initialized = false;
    this.actions = [];
  }

  // Initialize physical connections
  async init() {
    console.log('[Physicist] Initializing physical world connections...');

    try {
      // Check for environment variables
      const config = {
        printerApiKey: process.env.PRINTER_API_KEY || null,
        printerEndpoint: process.env.PRINTER_ENDPOINT || null,
        homeAssistantUrl: process.env.HOME_ASSISTANT_URL || null,
        homeAssistantToken: process.env.HOME_ASSISTANT_TOKEN || null,
        depinApiKey: process.env.DEPIN_API_KEY || null,
        depinNetwork: process.env.DEPIN_NETWORK || 'helium',
        droneApiKey: process.env.DRONE_API_KEY || null,
        droneEndpoint: process.env.DRONE_ENDPOINT || null
      };

      // Register available devices
      if (config.printerApiKey && config.printerEndpoint) {
        this.devices.push({ type: '3d_printer', status: 'ready' });
        console.log('[Physicist] ✅ 3D Printer connected');
      }

      if (config.homeAssistantUrl && config.homeAssistantToken) {
        this.devices.push({ type: 'smart_home', status: 'ready' });
        console.log('[Physicist] ✅ Smart Home connected');
      }

      if (config.depinApiKey) {
        this.devices.push({ type: 'depin', network: config.depinNetwork, status: 'ready' });
        console.log(`[Physicist] ✅ DePIN (${config.depinNetwork}) connected`);
      }

      if (config.droneApiKey && config.droneEndpoint) {
        this.devices.push({ type: 'drone', status: 'ready' });
        console.log('[Physicist] ✅ Drone connected');
      }

      if (this.devices.length === 0) {
        console.log('[Physicist] ⚠️ No physical devices configured. Running in simulation mode.');
        this.devices.push({ type: 'simulation', status: 'ready' });
      }

      this.initialized = true;
      this.memory.remember('system', 'Physicist initialized', { devices: this.devices });

      return { success: true, devices: this.devices };
    } catch (err) {
      console.error('[Physicist] Failed to initialize:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Get list of available devices
  getDevices() {
    return this.devices;
  }

  // 3D Printer operations
  async print3D(modelFile, material = 'PLA', quality = 'normal') {
    console.log(`[Physicist] 🖨️ Printing: ${modelFile} (${material}, ${quality})`);

    const action = {
      type: '3d_print',
      model: modelFile,
      material: material,
      quality: quality,
      status: 'pending'
    };

    try {
      // Check if printer is available
      const printer = this.devices.find(d => d.type === '3d_printer');
      if (!printer) {
        // Simulate if no printer
        console.log('[Physicist] ⚠️ No 3D printer found. Simulating print...');
        await this.sleep(2000);
        action.status = 'simulated';
        action.result = `Simulated print of ${modelFile}`;
        this.memory.remember('system', 'Print simulated', action);
        return { success: true, ...action, simulation: true };
      }

      // In production: Call printer API
      // const response = await axios.post(
      //   `${process.env.PRINTER_ENDPOINT}/print`,
      //   { model: modelFile, material, quality },
      //   { headers: { 'Authorization': `Bearer ${process.env.PRINTER_API_KEY}` } }
      // );

      // For now: simulate
      await this.sleep(1000);
      action.status = 'completed';
      action.jobId = 'job_' + Date.now();
      action.result = `Printed ${modelFile} in ${quality} quality with ${material}`;

      this.memory.remember('system', '3D Print completed', action);
      console.log(`[Physicist] ✅ Print completed: ${modelFile}`);
      return { success: true, ...action };
    } catch (err) {
      console.error('[Physicist] Print failed:', err.message);
      action.status = 'failed';
      action.error = err.message;
      this.memory.remember('system', 'Print failed', action);
      return { success: false, ...action };
    }
  }

  // Smart Home control
  async controlLight(room, state) {
    console.log(`[Physicist] 💡 ${room} light: ${state}`);

    const action = {
      type: 'light_control',
      room: room,
      state: state,
      status: 'pending'
    };

    try {
      const home = this.devices.find(d => d.type === 'smart_home');
      if (!home) {
        console.log('[Physicist] ⚠️ No smart home found. Simulating...');
        await this.sleep(500);
        action.status = 'simulated';
        this.memory.remember('system', 'Light control simulated', action);
        return { success: true, ...action, simulation: true };
      }

      // In production: Call Home Assistant API
      // const response = await axios.post(
      //   `${process.env.HOME_ASSISTANT_URL}/api/services/light/turn_${state}`,
      //   { entity_id: `light.${room}` },
      //   { headers: { 'Authorization': `Bearer ${process.env.HOME_ASSISTANT_TOKEN}` } }
      // );

      await this.sleep(500);
      action.status = 'completed';
      action.result = `${room} light turned ${state}`;

      this.memory.remember('system', 'Light controlled', action);
      console.log(`[Physicist] ✅ ${room} light: ${state}`);
      return { success: true, ...action };
    } catch (err) {
      console.error('[Physicist] Light control failed:', err.message);
      action.status = 'failed';
      action.error = err.message;
      return { success: false, ...action };
    }
  }

  // DePIN network operations
  async deployDePIN(resource, amount) {
    console.log(`[Physicist] 🌐 Deploying ${amount} of ${resource} on DePIN`);

    const action = {
      type: 'depin_deploy',
      resource: resource,
      amount: amount,
      status: 'pending'
    };

    try {
      const depin = this.devices.find(d => d.type === 'depin');
      if (!depin) {
        console.log('[Physicist] ⚠️ No DePIN configured. Simulating...');
        await this.sleep(1500);
        action.status = 'simulated';
        action.result = `Simulated deployment of ${amount} ${resource}`;
        this.memory.remember('system', 'DePIN deploy simulated', action);
        return { success: true, ...action, simulation: true };
      }

      // In production: Call DePIN API
      // const response = await axios.post(
      //   `https://api.${depin.network}/v1/deploy`,
      //   { resource, amount },
      //   { headers: { 'Authorization': `Bearer ${process.env.DEPIN_API_KEY}` } }
      // );

      await this.sleep(1000);
      action.status = 'deployed';
      action.deploymentId = 'dep_' + Date.now();
      action.result = `Deployed ${amount} ${resource} on ${depin.network}`;

      this.memory.remember('system', 'DePIN deployment', action);
      console.log(`[Physicist] ✅ Deployed ${amount} ${resource}`);
      return { success: true, ...action };
    } catch (err) {
      console.error('[Physicist] DePIN deployment failed:', err.message);
      action.status = 'failed';
      action.error = err.message;
      return { success: false, ...action };
    }
  }

  // Drone operations
  async flyDrone(destination, payload = null) {
    console.log(`[Physicist] 🚁 Flying drone to: ${destination}`);

    const action = {
      type: 'drone_flight',
      destination: destination,
      payload: payload,
      status: 'pending'
    };

    try {
      const drone = this.devices.find(d => d.type === 'drone');
      if (!drone) {
        console.log('[Physicist] ⚠️ No drone configured. Simulating...');
        await this.sleep(3000);
        action.status = 'simulated';
        action.result = `Simulated flight to ${destination}`;
        this.memory.remember('system', 'Drone flight simulated', action);
        return { success: true, ...action, simulation: true };
      }

      // In production: Call drone API
      // const response = await axios.post(
      //   `${process.env.DRONE_ENDPOINT}/fly`,
      //   { destination, payload },
      //   { headers: { 'Authorization': `Bearer ${process.env.DRONE_API_KEY}` } }
      // );

      await this.sleep(2000);
      action.status = 'completed';
      action.flightId = 'fly_' + Date.now();
      action.result = `Flight to ${destination} completed`;

      this.memory.remember('system', 'Drone flight', action);
      console.log(`[Physicist] ✅ Drone arrived at: ${destination}`);
      return { success: true, ...action };
    } catch (err) {
      console.error('[Physicist] Drone flight failed:', err.message);
      action.status = 'failed';
      action.error = err.message;
      return { success: false, ...action };
    }
  }

  // Analyze physical world and suggest actions
  async analyzeEnvironment() {
    console.log('[Physicist] Analyzing physical environment...');

    const prompt = `
    You are a physical world analyst. Based on the available devices and environment:
    Available devices: ${JSON.stringify(this.devices)}
    Recent actions: ${JSON.stringify(this.actions.slice(-5))}

    Suggest 1-3 physical world actions to take.
    Return as JSON array:
    [
      { "action": "print", "model": "filename.stl", "material": "PLA" },
      { "action": "light", "room": "living_room", "state": "on" },
      { "action": "deploy", "resource": "compute", "amount": 10 },
      { "action": "drone", "destination": "warehouse" }
    ]
    `;

    try {
      const response = await callLLM(
        'You suggest practical physical world actions. Only suggest actions that are realistic.',
        prompt,
        null,
        0.4
      );

      let suggestions = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) suggestions = JSON.parse(match[0]);
      } catch {
        suggestions = [];
      }

      this.memory.remember('system', 'Environment analysis', { suggestions });
      return suggestions;
    } catch (err) {
      console.error('[Physicist] Analysis failed:', err.message);
      return [];
    }
  }

  // Execute physical actions
  async executeAction(action) {
    console.log(`[Physicist] Executing: ${action.action}`);

    switch (action.action) {
      case 'print':
        return await this.print3D(action.model, action.material, action.quality);
      case 'light':
        return await this.controlLight(action.room, action.state);
      case 'deploy':
        return await this.deployDePIN(action.resource, action.amount);
      case 'drone':
        return await this.flyDrone(action.destination, action.payload);
      default:
        console.log(`[Physicist] Unknown action: ${action.action}`);
        return { success: false, error: 'Unknown action' };
    }
  }

  // Run physical world cycle
  async runCycle() {
    console.log('\n[Physicist] Starting physical world cycle...');

    // 1. Analyze environment
    const suggestions = await this.analyzeEnvironment();

    if (suggestions.length === 0) {
      console.log('[Physicist] No actions suggested.');
      return { success: true, actions: 0 };
    }

    // 2. Execute actions
    let executed = 0;
    for (const suggestion of suggestions) {
      const result = await this.executeAction(suggestion);
      if (result.success) {
        executed++;
        this.actions.push(result);
      }
    }

    // 3. Log summary
    const summary = {
      actionsExecuted: executed,
      totalActions: suggestions.length,
      totalDevices: this.devices.length
    };

    this.memory.remember('system', 'Physical cycle complete', summary);
    console.log(`[Physicist] ✅ ${executed} physical actions executed`);

    return summary;
  }

  // Get physical stats
  getStats() {
    return {
      devices: this.devices,
      totalActions: this.actions.length,
      initialized: this.initialized,
      recentActions: this.actions.slice(-5)
    };
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

export default Physicist;
