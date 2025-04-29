import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

class MCPClient {
  private client: Client;
  private openai: OpenAI;
  private messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a versatile assistant capable of answering questions, completing tasks, and intelligently invoking specialized tools to deliver optimal results.",
    },
  ];
  private availableTools: any[] = [];
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
    this.client = new Client({
      name: "MCPClient",
      version: "1.0.0",
    });
  }

  // 连接mcp服务器
  async connectToMCPServer(serverScriptPath: string) {
    const isPython = serverScriptPath.endsWith(".py");
    const isJs = serverScriptPath.endsWith(".js");
    if (!isPython && !isJs) {
      throw new Error("Invalid server script path");
    }
    const command = isPython ? "python" : "node";
    const transport = new StdioClientTransport({
      command,
      args: [serverScriptPath],
    });
    this.client.connect(transport);
    // 获取并转换可用工具列表
    const tools = (await this.client.listTools()).tools as unknown as Tool[];
    this.availableTools = tools.map((tool) => {
      return {
        type: "function" as const,
        function: {
          name: tool.name as string,
          description: tool.description as string,
          parameters: {
            type: "object",
            properties: tool.inputSchema.properties as Record<string, unknown>,
            required: tool.inputSchema.required as string[],
          },
        },
      };
    });

    console.log(
      "\n已连接到服务器，可用工具:",
      tools.map((tool) => tool.name)
    );
  }

  // 处理工具链调用
  private async toolCalls(
    response: OpenAI.Chat.Completions.ChatCompletion,
    messages: ChatCompletionMessageParam[]
  ) {
    let currentResponse = response;
    while (currentResponse.choices[0].message.tool_calls) {
      if (currentResponse.choices[0].message.content) {
        console.log(
          "\n🤖 AI: tool_calls",
          JSON.stringify(currentResponse.choices[0].message)
        );
      }
      for (const toolCall of currentResponse.choices[0].message.tool_calls) {
        const toolName = toolCall.function.name;
        const rawArgs = toolCall.function.arguments;
        let toolArgs;
        try {
          console.log(`rawArgs is ===== ${rawArgs}`);
          toolArgs = "{}" == JSON.parse(rawArgs) ? {} : JSON.parse(rawArgs);
          if (typeof toolArgs === "string") {
            toolArgs = JSON.parse(toolArgs);
          }
        } catch (error) {
          console.error("⚠️ 参数解析失败，使用空对象替代");
          toolArgs = {};
        }
        console.log(`\n🔧 调用工具 ${toolName}`);
        console.log(`📝 参数:`, toolArgs);

        // 获取工具调用结果
        const result = await this.client.callTool({
          name: toolName,
          args: toolArgs,
        });
        console.log(`\n result is ${JSON.stringify(result)}`);
        messages.push(currentResponse.choices[0].message);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result.content),
        } as ChatCompletionMessageParam);
      }

      // 获取下一个响应
      currentResponse = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL as string,
        messages: messages,
        tools: this.availableTools,
      });
    }
    return currentResponse;
  }

  // 处理用户查询
  async processQuery(query: string): Promise<string> {
    this.messages.push({ role: "user", content: query });
    // 初始OpenAI API调用
    let response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL as string,
      messages: this.messages,
      tools: this.availableTools,
    });

    // 打印初始响应
    if (response.choices[0].message.content) {
      console.log("\n🤖 AI:", response.choices[0].message);
    }

    // 处理工具调用
    if (response.choices[0].message.tool_calls) {
      response = await this.toolCalls(response, this.messages);
    }

    // 更新消息历史
    this.messages.push(response.choices[0].message);
    return response.choices[0].message.content || "";
  }

  // 启动交互式聊天循环
  async chatLoop() {
    console.log("\nMCP Client Started!");
    console.log("Type your queries or 'quit' to exit.");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    while (true) {
      const query = await new Promise<string>((resolve) => {
        rl.question("\nQuery: ", resolve);
      });
      if (query.toLowerCase() === "quit") {
        break;
      }
      try {
        const response = await this.processQuery(query);
        console.log("\n" + response);
      } catch (e) {
        console.error("\nError:", e instanceof Error ? e.message : String(e));
      }
    }
    rl.close();
  }

  // 清理资源
  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: node dist/index.js <path_to_server_script>");
    process.exit(1);
  }
  const client = new MCPClient();
  try {
    await client.connectToMCPServer(process.argv[2]);
    await client.chatLoop();
  } finally {
    await client.cleanup();
  }
}
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
