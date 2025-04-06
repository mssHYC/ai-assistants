import { API_KEY } from '../constants';
import OpenAI from "openai";

export interface Message {
    role: 'system' | 'user' | 'assistant',
    content: string
}

class BaseModel {
    url: string = 'https://api.deepseek.com'
    apiKey: string = API_KEY
    AIModel: OpenAI
    constructor(private model: string = "deepseek-reasoner") {
        this.AIModel = new OpenAI({ apiKey: this.apiKey, baseURL: this.url })
    }
    send(messages: Message[]) {
        return this.AIModel.chat.completions.create({
            messages: messages,
            model: this.model,
            stream: true,
        })
    }
}

export default BaseModel