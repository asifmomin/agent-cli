import { Command } from 'commander';
import {callLLM} from "../llm";
import {getLocation, getWeather} from "../tools";

/*
Goal : Build a agent that provides me activities I can do at my current location based on weather
 */
export const agent2Command = new Command('agent2')
    .description('Agent2')
    .action(async (prompt: string) => {
        const myPrompt = `Give me list of activity based on my current location: ${await getLocation()} and weather : ${await getWeather()}`
        await callLLM(myPrompt);
    });
