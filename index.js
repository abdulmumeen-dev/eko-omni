// index.js
import dotenv from 'dotenv';
dotenv.config();

// ADD THIS DEBUG LINE:
console.log('🔍 DEBUG: OPENAI_MODEL =', process.env.OPENAI_MODEL);
console.log('🔍 DEBUG: LLM_MODEL =', process.env.LLM_MODEL);
console.log('🔍 DEBUG: LLM_PROVIDER =', process.env.LLM_PROVIDER);

import Orchestrator from './brain/orchestrator.js';
import { initializeAPI } from './api/server.js';

console.log(`
╔═══════════════════════════════════════╗
║     🧠 PROJECT EKO BOOTING...        ║
║  Self-healing · Graph-based · Eternal ║
╚═══════════════════════════════════════╝
`);

const provider = process.env.LLM_PROVIDER || 'openai';
const needsKey = ['openai', 'anthropic', 'generic'].includes(provider);

if (needsKey && !process.env.LLM_API_KEY) {
  console.error(`❌ LLM_API_KEY not found in .env file for provider: ${provider}`);
  console.log('Please create a .env file with your API key.');
  console.log('If using Ollama locally, set LLM_PROVIDER=ollama');
  process.exit(1);
}

console.log(`✅ Using LLM provider: ${provider}`);
console.log(`✅ Model: ${process.env.LLM_MODEL || 'default'}`);
console.log('Starting Orchestrator...\n');

// Create EKO instance
const eko = new Orchestrator();

// Initialize API server (wait a moment for EKO to be ready)
setTimeout(() => {
  console.log('🌐 Initializing API server...');
  initializeAPI(eko);
}, 2000);

// Start EKO
eko.run().catch(err => {
  console.error('🔥 Fatal error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down EKO gracefully...');
  await eko.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down EKO gracefully...');
  await eko.shutdown();
  process.exit(0);
});

export { eko };
