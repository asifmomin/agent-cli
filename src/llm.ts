import {OpenAI} from "openai";

export async function callLLM(prompt: string) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // API Key loaded from environment variables
        });

        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{role: 'user', content: prompt}],
        });

        console.log(chatCompletion.choices[0].message.content);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error communicating with OpenAI API:', error.message);
        } else {
            console.error('An unexpected error occurred');
        }
    }
}
