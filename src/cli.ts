import { Command } from 'commander';
import { agent1Command } from './commands/agent1';
import { agent2Command } from './commands/agent2';

const program = new Command();

program
    .name('agent-cli')
    .description('Agent CLI')
    .version('1.0.0');

// Add commands to the program
program.addCommand(agent1Command);
program.addCommand(agent2Command);

program.parse(process.argv);
