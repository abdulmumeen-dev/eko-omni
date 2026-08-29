// limbs/agent_runner.js
import { callLLM } from './llm.js';

const AGENT_PROMPTS = {
  researcher: `You are a Research Agent. Search, analyze, and summarize information. 
    Return concise, factual results.`,
  
  trader: `You are a Trading Agent. Analyze market data, identify arbitrage opportunities. 
    Be conservative. Include risk assessment.`,
  
  coder: `You are a Code Agent. Write clean, efficient code. 
    Return complete, runnable code blocks.`,
  
  validator: `You are a Validation Agent. Verify correctness. 
    Return JSON with passed: true/false and reasons.`,
  
  default: `You are a General Agent. Execute the given task accurately.`
};

export async function spawnSubAgent(node) {
  const { id, type, task, ...params } = node;
  
  console.log(`  [Agent] Spawning ${id} (type: ${type || 'default'})...`);
  
  const systemPrompt = AGENT_PROMPTS[type] || AGENT_PROMPTS.default;
  
  const userPrompt = `
    Task ID: ${id}
    Task Type: ${type || 'general'}
    Description: ${task || 'Execute the assigned task.'}
    Parameters: ${JSON.stringify(params, null, 2)}
    
    Return your result as a JSON object with:
    { 
      "success": true/false, 
      "result": "your output here",
      "error": "if any"
    }
  `;

  try {
    const response = await callLLM(systemPrompt, userPrompt, null, 0.3);
    
    let parsed;
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response;
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { success: true, result: response };
    }
    
    return { ...parsed, nodeId: id };
    
  } catch (err) {
    console.error(`  [Agent] ${id} failed:`, err.message);
    return {
      success: false,
      nodeId: id,
      error: err.message,
      result: null
    };
  }
}
