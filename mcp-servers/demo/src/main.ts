#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  supplier: string;
}

interface Offer {
  productId: string;
  title: string;
  companyName: string;
}

interface ApiResponse {
  ret: string[];
  encode: string;
  code: number;
  traceId: string;
  msg: string;
  time: number;
  data: {
    offers: Offer[];
    resultCount: string;
    totalCount: number;
  };
}

class ProductOffersServer {
  private server: Server;
  private baseUrl = 'http://www.baidu.com';

  constructor() {
    this.server = new Server(
      {
        name: 'search-assistant-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async fetchOffers(keywords?: string, pageSize?: number): Promise<Product[]> {
    try {
      const params: Record<string, any> = {};
      if (keywords) params.keywords = keywords;
      if (pageSize) params.pageSize = pageSize;
      const response = await axios.get<ApiResponse>(this.baseUrl, { params });
      
      return response.data.data.offers.map(offer => ({
        id: offer.productId,
        name: offer.title,
        supplier: offer.companyName
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to fetch offers: ${error.message}`
        );
      }
      throw error;
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_offers',
          description: 'Get product offers from API',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'string',
                description: 'Keywords to search for products',
                default: ''
              },
              pageSize: {
                type: 'number',
                description: 'Number of items per page',
                minimum: 1,
                maximum: 100,
                default: 10
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_offers') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const args = request.params.arguments as { keywords?: string; pageSize?: number };

      try {
        const products = await this.fetchOffers(args.keywords, args.pageSize);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                products: products,
                totalCount: products.length
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to fetch offers: ${error}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Product Offers MCP server running on stdio');
  }
}

const server = new ProductOffersServer();
server.run().catch(console.error);