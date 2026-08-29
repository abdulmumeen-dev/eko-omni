// limbs/llm.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// ============================================================
// CONFIGURATION
// ============================================================

const PROVIDER = process.env.LLM_PROVIDER || 'openai';

// Provider-specific configs with defaults
const CONFIG = {
  // ---- OpenAI ----
  openai: {
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  
  // ---- Anthropic ----
  anthropic: {
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022',
    headers: (key) => ({ 
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    }),
    version: '2023-06-01',
  },
  
  // ---- NVIDIA NIM ----
  nim: {
    baseURL: process.env.NIM_BASE_URL || 'http://localhost:8000/v1',
    apiKey: process.env.NIM_API_KEY || '',
    model: process.env.NIM_MODEL || process.env.LLM_MODEL || 'meta/llama3-70b-instruct',
    headers: (key) => key ? { 'Authorization': `Bearer ${key}` } : {},
  },
  
  // ---- Hugging Face ----
  huggingface: {
    baseURL: process.env.HUGGINGFACE_BASE_URL || 'https://api-inference.huggingface.co/models',
    apiKey: process.env.HUGGINGFACE_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.HUGGINGFACE_MODEL || process.env.LLM_MODEL || 'meta-llama/Llama-3-70B-Instruct',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  
  // ---- Together AI ----
  together: {
    baseURL: process.env.TOGETHER_BASE_URL || 'https://api.together.xyz/v1',
    apiKey: process.env.TOGETHER_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.TOGETHER_MODEL || process.env.LLM_MODEL || 'meta-llama/Llama-3-70B-Instruct-Turbo',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  
  // ---- Groq ----
  groq: {
    baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.GROQ_MODEL || process.env.LLM_MODEL || 'llama3-70b-8192',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  
  // ---- Replicate ----
  replicate: {
    baseURL: process.env.REPLICATE_BASE_URL || 'https://api.replicate.com/v1',
    apiKey: process.env.REPLICATE_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.REPLICATE_MODEL || process.env.LLM_MODEL || 'meta/meta-llama-3-70b-instruct',
    headers: (key) => ({ 'Authorization': `Token ${key}` }),
  },
  
  // ---- Mistral AI ----
  mistral: {
    baseURL: process.env.MISTRAL_BASE_URL || 'https://api.mistral.ai/v1',
    apiKey: process.env.MISTRAL_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.MISTRAL_MODEL || process.env.LLM_MODEL || 'mistral-large-latest',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  
  // ---- Cohere ----
  cohere: {
    baseURL: process.env.COHERE_BASE_URL || 'https://api.cohere.ai/v1',
    apiKey: process.env.COHERE_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.COHERE_MODEL || process.env.LLM_MODEL || 'command-r-plus',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  
  // ---- DeepSeek ----
  deepseek: {
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.DEEPSEEK_MODEL || process.env.LLM_MODEL || 'deepseek-chat',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  
  // ---- Perplexity ----
  perplexity: {
    baseURL: process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai',
    apiKey: process.env.PERPLEXITY_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.PERPLEXITY_MODEL || process.env.LLM_MODEL || 'llama-3.1-70b-instruct',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  
  // ---- OpenRouter ----
  openrouter: {
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || process.env.LLM_MODEL || 'openai/gpt-4o',
    headers: (key) => ({ 
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:3000',
      'X-Title': 'EKO Agent',
    }),
  },
  
  // ---- Ollama (Local) ----
  ollama: {
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    apiKey: '',
    model: process.env.OLLAMA_MODEL || process.env.LLM_MODEL || 'llama3',
    headers: () => ({}),
    format: 'ollama',
  },
  
  // ---- LM Studio (Local) ----
  lmstudio: {
    baseURL: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
    apiKey: '',
    model: process.env.LMSTUDIO_MODEL || process.env.LLM_MODEL || 'local-model',
    headers: () => ({}),
  },
  
  // ---- LocalAI (Local) ----
  localai: {
    baseURL: process.env.LOCALAI_BASE_URL || 'http://localhost:8080/v1',
    apiKey: '',
    model: process.env.LOCALAI_MODEL || process.env.LLM_MODEL || 'llama3',
    headers: () => ({}),
  },
  
  // ---- vLLM (Local) ----
  vllm: {
    baseURL: process.env.VLLM_BASE_URL || 'http://localhost:8000/v1',
    apiKey: '',
    model: process.env.VLLM_MODEL || process.env.LLM_MODEL || 'meta-llama/Llama-3-70B-Instruct',
    headers: () => ({}),
  },
  
  // ---- Text Generation Inference (HuggingFace TGI) ----
  tgi: {
    baseURL: process.env.TGI_BASE_URL || 'http://localhost:8080',
    apiKey: '',
    model: process.env.TGI_MODEL || process.env.LLM_MODEL || 'meta-llama/Llama-3-70B-Instruct',
    headers: () => ({}),
    format: 'tgi',
  },
  
  // ---- Generic / Custom ----
  generic: {
    baseURL: process.env.GENERIC_BASE_URL || process.env.LLM_BASE_URL || 'http://localhost:8080/v1',
    apiKey: process.env.GENERIC_API_KEY || process.env.LLM_API_KEY || '',
    model: process.env.GENERIC_MODEL || process.env.LLM_MODEL || 'default',
    headers: (key) => key ? { 'Authorization': `Bearer ${key}` } : {},
    format: 'generic',
  },
};

// ============================================================
// MAIN EXPORT
// ============================================================

export async function callLLM(systemPrompt, userPrompt, modelOverride = null, temperature = 0.7) {
  const config = CONFIG[PROVIDER];
  if (!config) {
    throw new Error(`Unknown provider: ${PROVIDER}. Available: ${Object.keys(CONFIG).join(', ')}`);
  }

  const model = modelOverride || config.model;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  console.log(`[LLM] Calling ${PROVIDER} with model: ${model}`);

  try {
    switch (PROVIDER) {
      case 'openai':
        return await callOpenAI(messages, model, temperature);
      case 'anthropic':
        return await callAnthropic(messages, model, temperature);
      case 'nim':
      case 'nvidia':
        return await callNIM(messages, model, temperature);
      case 'huggingface':
        return await callHuggingFace(messages, model, temperature);
      case 'together':
        return await callTogether(messages, model, temperature);
      case 'groq':
        return await callGroq(messages, model, temperature);
      case 'replicate':
        return await callReplicate(messages, model, temperature);
      case 'mistral':
        return await callMistral(messages, model, temperature);
      case 'cohere':
        return await callCohere(messages, model, temperature);
      case 'deepseek':
        return await callDeepSeek(messages, model, temperature);
      case 'perplexity':
        return await callPerplexity(messages, model, temperature);
      case 'openrouter':
        return await callOpenRouter(messages, model, temperature);
      case 'ollama':
        return await callOllama(messages, model, temperature);
      case 'lmstudio':
        return await callLMStudio(messages, model, temperature);
      case 'localai':
        return await callLocalAI(messages, model, temperature);
      case 'vllm':
        return await callVLLM(messages, model, temperature);
      case 'tgi':
        return await callTGI(messages, model, temperature);
      case 'generic':
      default:
        return await callGeneric(messages, model, temperature);
    }
  } catch (err) {
    console.error(`[LLM] ${PROVIDER} error:`, err.message);
    throw err;
  }
}

// ============================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================

// ---- OpenAI ----
async function callOpenAI(messages, model, temperature) {
  const config = CONFIG.openai;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.choices[0].message.content;
}

// ---- Anthropic ----
async function callAnthropic(messages, model, temperature) {
  const config = CONFIG.anthropic;
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');
  const response = await axios.post(
    `${config.baseURL}/messages`,
    { model, system: systemMsg, messages: userMessages, temperature, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.content[0].text;
}

// ---- NVIDIA NIM ----
async function callNIM(messages, model, temperature) {
  const config = CONFIG.nim;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    {
      headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) },
      timeout: 60000,
    }
  );
  return response.data.choices[0].message.content;
}

// ---- Hugging Face ----
async function callHuggingFace(messages, model, temperature) {
  const config = CONFIG.huggingface;
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  const response = await axios.post(
    `${config.baseURL}/${model}`,
    { inputs: prompt, parameters: { temperature, max_new_tokens: 4096 } },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data[0]?.generated_text || response.data;
}

// ---- Together AI ----
async function callTogether(messages, model, temperature) {
  const config = CONFIG.together;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.choices[0].message.content;
}

// ---- Groq ----
async function callGroq(messages, model, temperature) {
  const config = CONFIG.groq;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.choices[0].message.content;
}

// ---- Replicate ----
async function callReplicate(messages, model, temperature) {
  const config = CONFIG.replicate;
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  const response = await axios.post(
    `${config.baseURL}/predictions`,
    {
      version: model,
      input: { prompt, temperature, max_tokens: 4096 },
    },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  // Replicate returns a URL to fetch results
  const result = await pollReplicate(response.data.urls.get);
  return result;
}

async function pollReplicate(url) {
  for (let i = 0; i < 30; i++) {
    const response = await axios.get(url);
    if (response.data.status === 'succeeded') {
      return response.data.output.join('');
    }
    if (response.data.status === 'failed') {
      throw new Error('Replicate prediction failed');
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Replicate prediction timeout');
}

// ---- Mistral ----
async function callMistral(messages, model, temperature) {
  const config = CONFIG.mistral;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.choices[0].message.content;
}

// ---- Cohere ----
async function callCohere(messages, model, temperature) {
  const config = CONFIG.cohere;
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  const response = await axios.post(
    `${config.baseURL}/generate`,
    { model, prompt, temperature, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.generations[0].text;
}

// ---- DeepSeek ----
async function callDeepSeek(messages, model, temperature) {
  const config = CONFIG.deepseek;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.choices[0].message.content;
}

// ---- Perplexity ----
async function callPerplexity(messages, model, temperature) {
  const config = CONFIG.perplexity;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.choices[0].message.content;
}

// ---- OpenRouter ----
async function callOpenRouter(messages, model, temperature) {
  const config = CONFIG.openrouter;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json', ...config.headers(config.apiKey) } }
  );
  return response.data.choices[0].message.content;
}

// ---- Ollama ----
async function callOllama(messages, model, temperature) {
  const config = CONFIG.ollama;
  const response = await axios.post(
    `${config.baseURL}/api/chat`,
    { model, messages, temperature, stream: false },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.message.content;
}

// ---- LM Studio ----
async function callLMStudio(messages, model, temperature) {
  const config = CONFIG.lmstudio;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.choices[0].message.content;
}

// ---- LocalAI ----
async function callLocalAI(messages, model, temperature) {
  const config = CONFIG.localai;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.choices[0].message.content;
}

// ---- vLLM ----
async function callVLLM(messages, model, temperature) {
  const config = CONFIG.vllm;
  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    { model, messages, temperature, stream: false, max_tokens: 4096 },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.choices[0].message.content;
}

// ---- TGI ----
async function callTGI(messages, model, temperature) {
  const config = CONFIG.tgi;
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  const response = await axios.post(
    `${config.baseURL}/generate`,
    { inputs: prompt, parameters: { temperature, max_new_tokens: 4096 } },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.generated_text;
}

// ---- Generic ----
async function callGeneric(messages, model, temperature) {
  const config = CONFIG.generic;
  const response = await axios.post(
    config.baseURL,
    { model, messages, temperature },
    {
      headers: {
        'Content-Type': 'application/json',
        ...config.headers(config.apiKey),
      },
    }
  );
  // Try to guess the response format
  if (response.data.choices) return response.data.choices[0].message.content;
  if (response.data.content) return response.data.content;
  if (response.data.response) return response.data.response;
  if (response.data.generated_text) return response.data.generated_text;
  if (response.data.output) return response.data.output;
  return JSON.stringify(response.data);
}

// ============================================================
// PROVIDER CHECK HELPERS
// ============================================================

export function getAvailableProviders() {
  const available = [];
  for (const [name, config] of Object.entries(CONFIG)) {
    if (name === 'generic') continue;
    if (config.apiKey || name === 'ollama' || name === 'lmstudio' || name === 'localai' || name === 'vllm' || name === 'tgi') {
      available.push(name);
    }
  }
  return available;
}

export function getProviderConfig(provider) {
  return CONFIG[provider] || null;
}

export async function testProvider(provider) {
  try {
    const result = await callLLM(
      'You are a test assistant. Reply with "OK"',
      'Reply with "OK"',
      null,
      0.1
    );
    return { available: true, response: result };
  } catch (err) {
    return { available: false, error: err.message };
  }
}
