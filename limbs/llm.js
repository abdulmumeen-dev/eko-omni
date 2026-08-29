// limbs/llm.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// ============================================================
// CONFIGURATION
// ============================================================

const PROVIDER = process.env.LLM_PROVIDER || 'openai';
const BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.LLM_API_KEY || '';
const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

// NVIDIA NIM specific
const NIM_BASE_URL = process.env.NIM_BASE_URL || 'http://localhost:8000/v1';
const NIM_API_KEY = process.env.NIM_API_KEY || '';
const NIM_MODEL = process.env.NIM_MODEL || 'meta/llama3-70b-instruct';

// ============================================================
// MAIN EXPORT
// ============================================================

export async function callLLM(systemPrompt, userPrompt, modelOverride = null, temperature = 0.7) {
  const model = modelOverride || MODEL;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  console.log(`[LLM] Calling ${PROVIDER} with model: ${model}`);

  try {
    switch (PROVIDER) {
      // --- Cloud Providers ---
      case 'openai':
        return await callOpenAI(messages, model, temperature);
      case 'anthropic':
        return await callAnthropic(messages, model, temperature);
      
      // --- NVIDIA NIM (Local or Cloud) ---
      case 'nim':
      case 'nvidia':
        return await callNIM(messages, model, temperature);
      
      // --- Local/Open Source ---
      case 'ollama':
        return await callOllama(messages, model, temperature);
      case 'lmstudio':
        return await callLMStudio(messages, model, temperature);
      
      // --- Generic / Custom ---
      case 'generic':
      default:
        return await callGeneric(messages, model, temperature);
    }
  } catch (err) {
    console.error('[LLM] Provider error:', err.message);
    throw err;
  }
}

// ============================================================
// NVIDIA NIM
// ============================================================

async function callNIM(messages, model, temperature) {
  const url = `${NIM_BASE_URL}/chat/completions`;
  
  const response = await axios.post(
    url,
    {
      model: model || NIM_MODEL,
      messages,
      temperature,
      stream: false,
      max_tokens: 4096,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(NIM_API_KEY ? { 'Authorization': `Bearer ${NIM_API_KEY}` } : {}),
      },
      timeout: 60000, // 60 seconds for large models
    }
  );
  
  return response.data.choices[0].message.content;
}

// ============================================================
// OPENAI
// ============================================================

async function callOpenAI(messages, model, temperature) {
  const response = await axios.post(
    `${BASE_URL}/chat/completions`,
    { model, messages, temperature, stream: false },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    }
  );
  return response.data.choices[0].message.content;
}

// ============================================================
// ANTHROPIC (Claude)
// ============================================================

async function callAnthropic(messages, model, temperature) {
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await axios.post(
    `${BASE_URL}/messages`,
    {
      model,
      system: systemMsg,
      messages: userMessages,
      temperature,
      max_tokens: 4096,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
    }
  );
  return response.data.content[0].text;
}

// ============================================================
// OLLAMA (Local)
// ============================================================

async function callOllama(messages, model, temperature) {
  const response = await axios.post(
    `${BASE_URL}/api/chat`,
    { model, messages, temperature, stream: false },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.message.content;
}

// ============================================================
// LM STUDIO (Local)
// ============================================================

async function callLMStudio(messages, model, temperature) {
  const response = await axios.post(
    `${BASE_URL}/v1/chat/completions`,
    { model, messages, temperature, stream: false },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.choices[0].message.content;
}

// ============================================================
// GENERIC (Custom Endpoint)
// ============================================================

async function callGeneric(messages, model, temperature) {
  const response = await axios.post(
    BASE_URL,
    { model, messages, temperature },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
      },
    }
  );
  if (response.data.choices) return response.data.choices[0].message.content;
  if (response.data.content) return response.data.content;
  if (response.data.response) return response.data.response;
  return JSON.stringify(response.data);
}

// ============================================================
// NVIDIA NIM CONFIGURATION HELPERS
// ============================================================

// Check if NVIDIA NIM is available
export async function checkNIMStatus() {
  try {
    const response = await axios.get(`${NIM_BASE_URL}/health`, {
      timeout: 5000,
    });
    return { available: true, status: response.status };
  } catch (err) {
    return { available: false, error: err.message };
  }
}

// List available models from NVIDIA NIM
export async function listNIMModels() {
  try {
    const response = await axios.get(`${NIM_BASE_URL}/models`, {
      headers: {
        ...(NIM_API_KEY ? { 'Authorization': `Bearer ${NIM_API_KEY}` } : {}),
      },
    });
    return response.data.data || [];
  } catch (err) {
    console.error('[NIM] Failed to list models:', err.message);
    return [];
  }
}
