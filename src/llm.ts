import {OpenAI} from "openai";
import { ConsoleFormatter, ConsoleSection } from "./utils/consoleFormatter";

export async function callLLM(prompt: string, systemPrompt: string = "") {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, 
    });

    ConsoleFormatter.displayStatus("Processing request...");

    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: prompt}
        ],
    });

    const response = chatCompletion.choices[0].message.content || '';
    
    // Prepare all sections for display
    const sections: ConsoleSection[] = [];
    
    if (systemPrompt) {
        sections.push({
            title: "SYSTEM INSTRUCTIONS",
            content: systemPrompt,
            color: "orange",
            icon: "📋"
        });
    }

    sections.push({
        title: "USER QUERY",
        content: prompt,
        color: "blue",
        icon: "💬"
    });

    sections.push({
        title: "AI RESPONSE",
        content: response,
        color: "green",
        icon: "🎯"
    });

    // Display all sections in one interaction
    ConsoleFormatter.displayInteraction("🤖 LLM AGENT INTERACTION", sections);

    return response;
}
