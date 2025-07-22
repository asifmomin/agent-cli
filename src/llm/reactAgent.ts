import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/src/resources/chat/completions";
import { getCurrentWeather, getLocation } from "../tools";

/**
 * Enhanced ReAct Agent Implementation
 * Based on "ReAct: Synergizing Reasoning and Acting in Language Models" (https://arxiv.org/pdf/2210.03629)
 * 
 * Core ReAct Pattern:
 * 1. Thought: Model reasons about the current state and what to do next
 * 2. Action: Model takes an action (calls a tool/function)  
 * 3. Observation: Model observes the result of the action
 * 4. Repeat until task is complete
 */

const availableFunctions: Record<string, (arg: string) => Promise<string>> = {
    getCurrentWeather,
    getLocation,
    searchMemory: async (query: string) => {
        // Simulate a memory/knowledge search
        const memories = [
            "User likes outdoor activities when it's sunny",
            "User prefers indoor activities when it's raining",
            "User mentioned interest in hiking and photography"
        ];
        return `Memory search results for "${query}": ${memories.join(", ")}`;
    },
    calculateDistance: async (locations: string) => {
        // Simulate distance calculation between locations
        return `Distance between ${locations}: approximately 15km (20 minutes by car)`;
    }
};

const REACT_SYSTEM_PROMPT = `You are an intelligent assistant that uses the ReAct (Reasoning + Acting) approach to solve problems.

You work in a loop of Thought → Action → Observation until you can provide a final Answer.

Format your responses EXACTLY as follows:
- Thought: [Your reasoning about what to do next]
- Action: [function_name: argument]
- 
OR when you have enough information:
- Thought: [Your final reasoning]
- Answer: [Your comprehensive final answer]

Available actions:
- getCurrentWeather: location (e.g., "Melbourne") - Returns current weather for location
- getLocation: null - Returns user's current location  
- searchMemory: query - Search your memory/knowledge for relevant information
- calculateDistance: location1 to location2 - Calculate distance between locations

Key principles:
1. Always think before acting
2. Be systematic in gathering information
3. Use multiple actions when needed for comprehensive answers
4. Provide specific, actionable final answers based on your observations

Example:
User: What outdoor activities can I do today?

Thought: I need to know the user's location and current weather to recommend appropriate outdoor activities.
Action: getLocation: null

[After getting location observation]
Thought: Now I know the location is Melbourne. I should check the current weather to recommend suitable outdoor activities.
Action: getCurrentWeather: Melbourne

[After getting weather observation]  
Thought: I have location and weather info. Let me search for relevant activity preferences.
Action: searchMemory: outdoor activities preferences

[After memory search]
Thought: I now have location (Melbourne), weather (sunny), and user preferences (hiking, photography). I can provide specific recommendations.
Answer: Based on your location in Melbourne and today's sunny weather, I recommend these outdoor activities: 1) Photography walk through the Royal Botanic Gardens Melbourne, 2) Hiking at Dandenong Ranges (40min drive), 3) Cycling along the Yarra River trail, 4) Beach visit to Brighton or St Kilda for sunset photography. All activities take advantage of the sunny conditions and match your interests in hiking and photography.`;

const MAX_ITERATIONS = 8;
const thoughtRegex = /^Thought:\s*(.+)$/m;
const actionRegex = /^Action:\s*(\w+):\s*(.*)$/m;
const answerRegex = /^Answer:\s*([\s\S]+)/m;

interface ReActStep {
    iteration: number;
    thought?: string;
    action?: string;
    actionArg?: string;
    observation?: string;
    finalAnswer?: string;
}

export class ReactAgent {
    private openai: OpenAI;
    private steps: ReActStep[] = [];
    
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    private async callLLM(messages: ChatCompletionMessageParam[]): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.1, // Lower temperature for more consistent reasoning
        });

        return response.choices[0].message.content || "";
    }

    private parseResponse(response: string): { thought?: string, action?: string, actionArg?: string, answer?: string } {
        const thoughtMatch = response.match(thoughtRegex);
        const actionMatch = response.match(actionRegex);
        const answerMatch = response.match(answerRegex);

        return {
            thought: thoughtMatch ? thoughtMatch[1].trim() : undefined,
            action: actionMatch ? actionMatch[1].trim() : undefined,
            actionArg: actionMatch ? actionMatch[2].trim() : undefined,
            answer: answerMatch ? answerMatch[1].trim() : undefined
        };
    }

    private logStep(step: ReActStep) {
        console.log(`\n🔄 ITERATION ${step.iteration}`);
        console.log("=" + "=".repeat(50));
        
        if (step.thought) {
            console.log(`💭 Thought: ${step.thought}`);
        }
        
        if (step.action) {
            console.log(`🎯 Action: ${step.action}(${step.actionArg})`);
        }
        
        if (step.observation) {
            console.log(`👁️  Observation: ${step.observation}`);
        }
        
        if (step.finalAnswer) {
            console.log(`✅ Final Answer: ${step.finalAnswer}`);
        }
    }

    async run(query: string): Promise<string> {
        console.log(`🚀 Starting ReAct Agent with query: "${query}"\n`);
        
        let messages: ChatCompletionMessageParam[] = [
            { role: 'system', content: REACT_SYSTEM_PROMPT },
            { role: 'user', content: query }
        ];

        this.steps = [];

        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const response = await this.callLLM(messages);
            const parsed = this.parseResponse(response);
            
            const step: ReActStep = {
                iteration: i + 1,
                thought: parsed.thought,
                action: parsed.action,
                actionArg: parsed.actionArg
            };

            // Add assistant response to conversation
            messages.push({ role: 'assistant', content: response });

            // If we have a final answer, we're done
            if (parsed.answer) {
                step.finalAnswer = parsed.answer;
                this.steps.push(step);
                this.logStep(step);
                
                console.log(`\n🎉 Agent completed task in ${i + 1} iterations`);
                return parsed.answer;
            }

            // If we have an action, execute it
            if (parsed.action && parsed.actionArg !== undefined) {
                if (availableFunctions[parsed.action]) {
                    try {
                        const observation = await availableFunctions[parsed.action](parsed.actionArg);
                        step.observation = observation;
                        
                        // Add observation to conversation
                        messages.push({ 
                            role: 'user', 
                            content: `Observation: ${observation}` 
                        });
                    } catch (error) {
                        step.observation = `Error executing ${parsed.action}: ${error}`;
                        messages.push({ 
                            role: 'user', 
                            content: `Observation: Error - ${error}` 
                        });
                    }
                } else {
                    step.observation = `Unknown action: ${parsed.action}`;
                    messages.push({ 
                        role: 'user', 
                        content: `Observation: Unknown action "${parsed.action}". Available actions: ${Object.keys(availableFunctions).join(", ")}` 
                    });
                }
            }

            this.steps.push(step);
            this.logStep(step);

            // If no action was taken and no answer provided, something went wrong
            if (!parsed.action && !parsed.answer) {
                console.log("⚠️  Agent didn't provide action or answer, ending loop");
                break;
            }
        }

        console.log(`\n⚠️  Agent reached maximum iterations (${MAX_ITERATIONS}) without completing task`);
        return "I wasn't able to complete the task within the iteration limit.";
    }

    getSteps(): ReActStep[] {
        return this.steps;
    }
}

export const runReactAgent = async (query: string) => {
    const agent = new ReactAgent();
    const result = await agent.run(query);
    
    // Return both the result and the steps for analysis
    return {
        result,
        steps: agent.getSteps()
    };
};