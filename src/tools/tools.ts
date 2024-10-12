import OpenAI from "openai";
import ChatCompletionTool = OpenAI.ChatCompletionTool;

export const tools:Array<ChatCompletionTool> = [
    {
        type:"function",
        function: {
            "name": "getLocation",
            "description": "Returns user's location details.",
            "parameters": {
                "type": "object",
                "properties": {
                },
                "additionalProperties": false,
            }
        }
    },
    {
        type:"function",
        function: {
            "name": "getCurrentWeather",
            "description": "Returns the current weather of the location specified.",
            "parameters": {
                "type": "object",
                "properties": {
                },
                "additionalProperties": false,
            }
        }
    },
]
