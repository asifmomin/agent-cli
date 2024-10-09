import {OpenAI} from "openai";

export async function callLLM(prompt: string, systemPrompt: string = "") {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // API Key loaded from environment variables
    });

    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: prompt}
        ],
    });

    console.log(chatCompletion.choices[0].message.content);
    return chatCompletion.choices[0].message.content
}
