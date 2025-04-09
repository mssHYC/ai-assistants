import OpenAI from "openai";

const API_KEY = process.env.API_KEY;

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export enum ModelType {
  R1 = "deepseek-reasoner",
  V3 = "deepseek-chat",
}

class DeepSeekService {
  url: string = "https://api.deepseek.com";
  apiKey: string = API_KEY!;
  AIModel: OpenAI;
  constructor() {
    this.AIModel = new OpenAI({ apiKey: this.apiKey, baseURL: this.url });
  }
  send(messages: Message[], model: ModelType = ModelType.V3) {
    return this.AIModel.chat.completions.create({
      messages: messages,
      model,
      stream: true,
    });
  }
}

export default DeepSeekService;
