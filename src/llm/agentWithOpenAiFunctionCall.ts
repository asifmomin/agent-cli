import {systemPrompt} from "./systemPrompt";
import {getCurrentWeather, getLocation} from "../tools";
import {OpenAI} from "openai";
import {ChatCompletionMessageParam} from "openai/src/resources/chat/completions";
import {tools} from "../tools/tools";

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
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        tools
    });

    console.log("Response from llm is");
    console.log(JSON.stringify(response.choices[0],null,2));

    return response.choices[0];
}

function getActionString(response: string) {
    const responseLines = response.split("\n")
    return responseLines.find(str => actionRegex.test(str));
}
const simpleSystemPrompt = "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers.";

export const agentWithOpenAiFunctionCall = async (query: string) => {
    console.log(`user query is ${query}`)
    let messages: Array<ChatCompletionMessageParam> = [
        {role: 'system', content: simpleSystemPrompt },
        {role: 'user', content: query}
    ];

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // API Key loaded from environment variables
    });

    for (let i = 0; i < MAX_ITERATION; i++) {
        console.log("***********************************")
        console.log(`Iteration # ${i + 1}`)

        const response = await callLLM(openai, messages);
        const {finish_reason:finishReason,message} = response
        const {tool_calls:toolCalls}=message

        messages.push(message)

        if(finishReason==="stop"){
            console.log(message.content)
            console.log("*************************")
            console.log("AGENT ENDING")
            return
        }

        if(finishReason==="tool_calls"){
            for (const toolCall of toolCalls!){
                const functionName = toolCall.function.name
                const functionResponse = await availableFunctions[functionName]("test");
                messages.push({
                    tool_call_id:toolCall.id,
                    role:"tool",
                    content: functionResponse
                })
                console.log(functionResponse)
            }
        }
    }
}

