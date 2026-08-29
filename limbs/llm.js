// limbs/llm.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PROVIDER = process.env.LLM_PROVIDER || 'openai';
const BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.LLM_API_KEY || '';
const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

export async function callLLM(systemPrompt, userPrompt, modelOverride = null, temperature = 0.7) {
  const model = modelOverride || MODEL;

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
      case 'ollama':
        return await callOllama(messages, model, temperature);
      case 'generic':
      default:
        return await callGeneric(messages, model, temperature);
    }
  } catch (err) {
    console.error('[LLM] Provider error:', err.message);
    throw err;
  }
}

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

async function callOllama(messages, model, temperature) {
  const response = await axios.post(
    `${BASE_URL}/api/chat`,
    { model, messages, temperature, stream: false },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.message.content;
}

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
