// swarm/specialist.js
import { callLLM } from '../limbs/llm.js';

export class Specialist {
    constructor(child, memory) {
        this.child = child;
        this.memory = memory;
        this.specializations = {
            trader: 'Analyze market opportunities and execute trades.',
            researcher: 'Research topics and summarize findings.',
            coder: 'Write and optimize code.',
            marketer: 'Create marketing content and strategies.',
            analyst: 'Analyze data and generate insights.'
        };
    }

    async executeTask(task, data) {
        const systemPrompt = `You are ${this.child.name}, a specialized AI agent.
Role: ${this.child.role}
Description: ${this.specializations[this.child.role] || 'General purpose agent'}
Your task: ${task}
Data: ${JSON.stringify(data, null, 2)}
Provide a clear, actionable response.`;

        try {
            const response = await callLLM(
                systemPrompt,
                'Execute the task and return results.',
                null,
                0.4
            );

            this.memory.remember('specialist', `Task complete: ${task}`, {
                childId: this.child.id,
                task,
                response
            });

            return { success: true, response };
        } catch (error) {
            console.error(`[Specialist] Error executing task:`, error.message);
            return { success: false, error: error.message };
        }
    }
}
