import { Command } from 'commander';
import {getLocation, getCurrentWeather} from "../tools";
import {agentBasic} from "../llm/agentBasic";
import {agentMid} from "../llm/agentMid";

/*
Goal : Build a agent that can answer any question that might require current location
and current weather ay my location
 */

export const agent4Command = new Command('agent4')
    .description('Agent4')
    .action(async (prompt: string) => {
        await agentMid("what should I do today");
    });
