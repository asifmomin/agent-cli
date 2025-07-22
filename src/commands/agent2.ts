import { Command } from 'commander';
import {callLLM} from "../llm";
import {getLocation, getCurrentWeather} from "../tools";

/*
Goal : Build a agent that provides me activities I can do at my current location based on weather
 */
export const agent2Command = new Command('agent2')
    .description('Agent2')
    .argument('<location>', 'Location to get activities for')
    .action(async (location: string) => {
        const myPrompt = `Give me list of activity based on my current location: ${location} and weather : ${await getCurrentWeather()}`
        await callLLM(myPrompt);
    });
