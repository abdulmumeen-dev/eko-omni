// index.js
import dotenv from 'dotenv';
dotenv.config();

import Orchestrator from './brain/orchestrator.js';

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

const eko = new Orchestrator();
eko.run().catch(err => {
  console.error('🔥 Fatal error:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down EKO gracefully...');
  eko.running = false;
  if (eko.memory) eko.memory.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down EKO gracefully...');
  eko.running = false;
  if (eko.memory) eko.memory.close();
  process.exit(0);
});
