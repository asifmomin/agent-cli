import { Command } from 'commander';
import {getLocation, getCurrentWeather} from "../tools";
import {agentBasic} from "../llm/agentBasic";
import {agentMid} from "../llm/agentMid";
import {agentWithLoop} from "../llm/agentWithLoop";
import {agentWithOpenAiFunctionCall} from "../llm/agentWithOpenAiFunctionCall";


export const agent6Command = new Command('agent6')
    .description('Agent With Open AI Function call')
    .action(async (prompt: string) => {
        await agentWithOpenAiFunctionCall("what is the current weather in melbourne?");
        // await agentWithOpenAiFunctionCall("what is the current weather in melbourne and tokyo?");
        // await agentWithLoop("what activity should I do in my location?");
        // await agentWithLoop("what are some activities idea I can do this afternoon?");
    });
