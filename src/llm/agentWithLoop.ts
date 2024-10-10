import {systemPrompt} from "./systemPrompt";
import {getCurrentWeather, getLocation} from "../tools";
import {OpenAI} from "openai";
import {ChatCompletionMessageParam} from "openai/src/resources/chat/completions";

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

    console.log("Response from llm is");
    console.log(chatCompletion.choices[0].message.content);

    return chatCompletion.choices[0].message.content as string;
}

function getActionString(response: string) {
    const responseLines = response.split("\n")
    return responseLines.find(str => actionRegex.test(str));
}

export const agentWithLoop = async (query: string) => {
    console.log(`user query is ${query}`)
    let messages: Array<ChatCompletionMessageParam> = [
        {role: 'system', content: systemPrompt},
        {role: 'user', content: query}
    ];

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // API Key loaded from environment variables
    });

    for (let i = 0; i < MAX_ITERATION; i++) {
        console.log("***********************************")
        console.log(`Iteration # ${i + 1}`)

        const response = await callLLM(openai, messages);
        messages.push({role: 'assistant', content: response})
        const foundActionStr = getActionString(response);
        if (foundActionStr) {
            const actions = actionRegex.exec(foundActionStr) as Array<string>
            const [_, action, actionArg] = actions

            console.log(`*********Agent Action : `)
            console.log(`*********calling function: ${action} with argument ${actionArg}`)

            const observation = await availableFunctions[action](actionArg)
            console.log(`******observation is ${observation}`)
            messages.push(({role: 'assistant', content: `Observation: ${observation}`}))
        } else {
            console.log("Agent finished with Task")
            return response
        }
    }
}

