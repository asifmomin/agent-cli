import {systemPrompt} from "./systemPrompt";
import {getCurrentWeather, getLocation} from "../tools";
import {OpenAI} from "openai";
import {ChatCompletionMessageParam} from "openai/src/resources/chat/completions";
import { ConsoleFormatter } from '../utils/consoleFormatter';

/**
 * PLAN:
 * 1. Design a well written ReAct  prompt
 * 2. Build a loop for my agent to run in.
 * 3. Parse any actions that LLM determines are necessary
 * 4. End Condition - Final answer is provided to users.
 * Sample implementation : https://til.simonwillison.net/llms/python-react-pattern
 */

const availableFunctions: Record<string, (_: string) => Promise<string>> = {
    getCurrentWeather,
    getLocation
}

const MAX_ITERATION = 5
const actionRegex = /^Action: (\w+): (.*)$/

async function callLLM(openai: OpenAI, messages: Array<ChatCompletionMessageParam>) {
    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
    });

    const colors = {
        reset: '\x1b[0m',
        bold: '\x1b[1m',
        green: '\x1b[92m',
        blue: '\x1b[94m'
    };

    console.log(colors.blue + colors.bold + "🧠 LLM Response:" + colors.reset);
    console.log(colors.green + chatCompletion.choices[0].message.content + colors.reset);

    return chatCompletion.choices[0].message.content as string;
}

function getActionString(response: string) {
    const responseLines = response.split("\n")
    return responseLines.find(str => actionRegex.test(str));
}

export const agentWithLoop = async (query: string) => {
    const colors = {
        reset: '\x1b[0m',
        bold: '\x1b[1m',
        blue: '\x1b[94m',
        green: '\x1b[92m',
        yellow: '\x1b[93m',
        magenta: '\x1b[95m',
        cyan: '\x1b[96m',
        orange: '\x1b[38;5;208m'
    };

    // Display the prompts being sent to LLM
    console.log('\n' + colors.cyan + colors.bold + '═'.repeat(80) + colors.reset);
    console.log(colors.cyan + colors.bold + '🤖 LLM AGENT INTERACTION' + colors.reset);
    console.log(colors.cyan + colors.bold + '═'.repeat(80) + colors.reset);

    console.log('\n' + colors.orange + colors.bold + '📋 SYSTEM PROMPT' + colors.reset);
    console.log(colors.orange + '┌─ System Instructions' + colors.reset);
    const systemLines = systemPrompt.split('\n');
    systemLines.forEach(line => {
        console.log(colors.orange + '│  ' + line + colors.reset);
    });
    console.log(colors.orange + '└─' + colors.reset);

    console.log('\n' + colors.blue + colors.bold + '💬 USER QUERY' + colors.reset);
    console.log(colors.blue + '┌─ User Input' + colors.reset);
    console.log(colors.blue + '│  ' + query + colors.reset);
    console.log(colors.blue + '└─' + colors.reset);
    
    let messages: Array<ChatCompletionMessageParam> = [
        {role: 'system', content: systemPrompt},
        {role: 'user', content: query}
    ];

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // API Key loaded from environment variables
    });

    for (let i = 0; i < MAX_ITERATION; i++) {
        console.log('\n' + colors.cyan + colors.bold + '═'.repeat(50) + colors.reset);
        console.log(colors.cyan + colors.bold + `🔄 ITERATION ${i + 1}` + colors.reset);
        console.log(colors.cyan + colors.bold + '═'.repeat(50) + colors.reset);

        const response = await callLLM(openai, messages);
        messages.push({role: 'assistant', content: response})
        const foundActionStr = getActionString(response);
        if (foundActionStr) {
            const actions = actionRegex.exec(foundActionStr) as Array<string>
            const [_, action, actionArg] = actions

            console.log(colors.orange + colors.bold + `🎯 Agent Action:` + colors.reset)
            console.log(colors.yellow + `   Function: ${action}` + colors.reset)
            console.log(colors.yellow + `   Argument: ${actionArg}` + colors.reset)

            const observation = await availableFunctions[action](actionArg)
            console.log(colors.magenta + colors.bold + `👁️  Observation: ` + colors.reset + colors.green + observation + colors.reset)
            messages.push(({role: 'assistant', content: `Observation: ${observation}`}))
        } else {
            ConsoleFormatter.displaySuccess("Agent finished with Task")
            return response
        }
    }
}

