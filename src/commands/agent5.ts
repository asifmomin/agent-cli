import { Command } from 'commander';
import {getLocation, getCurrentWeather} from "../tools";
import {agentBasic} from "../llm/agentBasic";
import {agentMid} from "../llm/agentMid";
import {agentWithLoop} from "../llm/agentWithLoop";


export const agent5Command = new Command('agent5')
    .description('Agent5')
    .action(async (prompt: string) => {
        await agentWithLoop("what is the current weather in melbourne?");
        // await agentWithLoop("what activity should I do in my location?");
        // await agentWithLoop("what are some activities idea I can do this afternoon?");
    });
