import { Command } from 'commander';
import { runReactAgent } from '../llm/reactAgent';

export const reactCommand = new Command('react')
    .description('Demonstrate ReAct (Reasoning + Acting) pattern with enhanced logging')
    .argument('<query>', 'The query to process using ReAct pattern')
    .action(async (query: string) => {
        console.log('\n🧠 ReAct Agent Demo - Reasoning + Acting Pattern');
        console.log('📖 Based on: https://arxiv.org/pdf/2210.03629\n');
        
        try {
            const { result, steps } = await runReactAgent(query);
            
            console.log('\n' + '='.repeat(60));
            console.log('📊 EXECUTION SUMMARY');
            console.log('='.repeat(60));
            console.log(`Total iterations: ${steps.length}`);
            console.log(`Actions taken: ${steps.filter(s => s.action).length}`);
            console.log(`Final result: ${result}`);
            
        } catch (error) {
            console.error('❌ Error running ReAct agent:', error);
        }
    });