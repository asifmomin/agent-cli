import {Command} from 'commander';
import {callLLM} from "../llm";

export const agent1Command = new Command('agent1')
    .description('Send the provided prompt to OpenAI API and echo the response')
    .action(async () => {
        const myPrompt = "Give me list of activity based on my current location"
        await callLLM(myPrompt);
    });
