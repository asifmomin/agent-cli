import {Command} from 'commander';
import {agentBasic} from "../llm/agentBasic";

/*
Goal : Build an agent that can answer any question that might require current location
and current weather at my location
 */

export const agent3Command = new Command('agent3')
    .description('Agent3')
    .action(async (prompt: string) => {
        await agentBasic("what should I do today");
    });
