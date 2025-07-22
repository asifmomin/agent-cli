import { Command } from 'commander';
import {getLocation, getCurrentWeather} from "../tools";
import {agentBasic} from "../llm/agentBasic";
import {agentMid} from "../llm/agentMid";
import {agentWithLoop} from "../llm/agentWithLoop";
import { ConsoleFormatter } from '../utils/consoleFormatter';


export const agent5Command = new Command('agent5')
    .description('Agent5 - ReAct Pattern with Loop')
    .action(async (prompt: string) => {
        ConsoleFormatter.displayStatus('Agent5 Demo - ReAct Pattern with Loop', 'cyan', '🤖');
        ConsoleFormatter.displayStatus('Implementation: agentWithLoop', 'blue', '📄');
        ConsoleFormatter.displayStatus('Query: "what activity should I do in my location?"', 'yellow', '🎯');
        
        try {
            const startTime = Date.now();
            
            const result = await agentWithLoop("what activity should I do in my location?");
            
            const duration = Date.now() - startTime;
            
            // Display execution summary with colors
            const colors = {
                reset: '\x1b[0m',
                bold: '\x1b[1m',
                cyan: '\x1b[96m',
                green: '\x1b[92m',
                yellow: '\x1b[93m'
            };
            
            console.log('\n' + colors.cyan + colors.bold + '═'.repeat(60) + colors.reset);
            console.log(colors.cyan + colors.bold + '📊 EXECUTION SUMMARY' + colors.reset);
            console.log(colors.cyan + colors.bold + '═'.repeat(60) + colors.reset);
            console.log(colors.yellow + '⏱️  Duration: ' + colors.bold + duration + 'ms' + colors.reset);
            console.log(colors.green + '✅ Final result: ' + colors.bold + (result || 'Task completed') + colors.reset);
            console.log(colors.cyan + colors.bold + '═'.repeat(60) + colors.reset);
            
        } catch (error) {
            ConsoleFormatter.displayError(`Error running Agent5: ${error}`);
        }
    });
