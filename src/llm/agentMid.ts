import {callLLM} from "../llm";
import {systemPrompt} from "./systemPrompt";
import {getCurrentWeather, getLocation} from "../tools";
/**
 * PLAN:
 * 1. Design a well written ReAct  prompt
 * 2. Build a loop for my agent to run in.
 * 3. Parse any actions that LLM determines are necessary
 * 4. End Condition - Final answer is provided to users.
 * Sample implementation : https://til.simonwillison.net/llms/python-react-pattern
 */

const availableFunctions:Record<string, (_:string) => Promise<string>> = {
    getCurrentWeather,
    getLocation
}

export const agentMid = async (query:string)=>{
    const response = await callLLM(query,systemPrompt) as string;
    const responseLines = response.split("\n")
    const actionRegex = /^Action: (\w+): (.*)$/
    const foundActionStr = responseLines.find(str=>actionRegex.test(str))
    if(foundActionStr) {
        const actions = actionRegex.exec(foundActionStr) as Array<string>
        const [_,action,actionArg] = actions
        const observation = await availableFunctions[action](actionArg)
        console.log(`observation is ${observation}`)
    }
}

