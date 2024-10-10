import {Command} from 'commander';
import {agent1Command} from './commands/agent1';
import {agent2Command} from './commands/agent2';
import {agent3Command} from "./commands/agent3";
import {agent4Command} from "./commands/agent4";
import {agent5Command} from "./commands/agent5";

const program = new Command();

program
    .name('agent-cli')
    .description('Agent CLI')
    .version('1.0.0');

// Add commands to the program
program.addCommand(agent1Command);
program.addCommand(agent2Command);
program.addCommand(agent3Command);
program.addCommand(agent4Command);
program.addCommand(agent5Command);

program.parse(process.argv);
