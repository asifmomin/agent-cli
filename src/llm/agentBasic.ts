import {callLLM} from "../llm";
import {systemPrompt} from "./systemPrompt";
/**
 * PLAN:
 * 1. Design a well written ReAct  prompt
 * 2. Build a loop for my agent to run in.
 * 3. Parse any actions that LLM determines are necessary
 * 4. End Condition - Final answer is provided to users.
 * Sample implementation : https://til.simonwillison.net/llms/python-react-pattern
 */



export const agentBasic = async (query:string)=>{
    await callLLM(query,systemPrompt)
}

