#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

class McpAssistantServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'Father-MCP',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_mcp_docs',
          description: 'Get documentation about MCP concepts and implementation',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                enum: ['overview', 'tools', 'resources', 'server_setup'],
                description: 'The MCP topic to get documentation for',
              },
            },
            required: ['topic'],
          },
        },
        {
          name: 'validate_config',
          description: 'Validate an MCP server configuration',
          inputSchema: {
            type: 'object',
            properties: {
              config: {
                type: 'object',
                description: 'The MCP server configuration to validate',
              },
            },
            required: ['config'],
          },
        },
        {
          name: 'generate_server_code',
          description: 'Generate MCP server code template',
          inputSchema: {
            type: 'object',
            properties: {
              serverType: {
                type: 'string',
                enum: ['tool', 'resource', 'hybrid'],
                description: 'Type of MCP server to generate',
              },
              name: {
                type: 'string',
                description: 'Name of the MCP server',
              },
              description: {
                type: 'string',
                description: 'Description of the server functionality',
              },
            },
            required: ['serverType', 'name', 'description'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_mcp_docs':
          return this.handleGetDocs(request.params.arguments);
        case 'validate_config':
          return this.handleValidateConfig(request.params.arguments);
        case 'generate_server_code':
          return this.handleGenerateServer(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private handleGetDocs(args: any) {
    const docs = {
      overview: `Model Context Protocol (MCP) enables AI models to interact with external tools and resources through a standardized interface.
Key concepts:
- Tools: Executable functions with defined input/output schemas
- Resources: Data sources accessed via URIs
- Server Types: Local (Stdio) or Remote (SSE)
- Communication: Structured messages using XML-style tags`,

      tools: `MCP Tools expose executable functionality:
1. Define tool schemas with input/output parameters
2. Handle tool calls with validated arguments
3. Return structured responses with content
Example tool definition:
{
  name: 'my_tool',
  description: 'Tool description',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string' }
    },
    required: ['param1']
  }
}`,

      resources: `MCP Resources provide data access:
1. Static resources with fixed URIs
2. Dynamic resources with URI templates
3. Support for various MIME types
Example resource:
{
  uri: 'protocol://host/path',
  name: 'Resource name',
  mimeType: 'application/json',
  description: 'Resource description'
}`,

      server_setup: `Setting up an MCP server:
1. Create project: npx @modelcontextprotocol/create-server my-server
2. Install dependencies: npm install
3. Implement server in src/index.ts:
   - Define capabilities (tools/resources)
   - Set up request handlers
   - Add error handling
4. Build: npm run build
5. Configure in MCP settings:
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["path/to/server/build/index.js"]
    }
  }
}`
    };

    const topic = args.topic as keyof typeof docs;
    return {
      content: [
        {
          type: 'text',
          text: docs[topic] || 'Topic not found',
        },
      ],
    };
  }

  private handleValidateConfig(args: any) {
    const config = args.config;
    const errors: string[] = [];

    // Validate basic structure
    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
      errors.push('Missing or invalid mcpServers object');
      return {
        content: [{ type: 'text', text: errors.join('\n') }],
        isError: true,
      };
    }

    // Validate each server configuration
    Object.entries(config.mcpServers).forEach(([name, server]: [string, any]) => {
      if (server.url) {
        // Remote server
        if (typeof server.url !== 'string') {
          errors.push(`${name}: Invalid url`);
        }
      } else {
        // Local server
        if (!server.command || typeof server.command !== 'string') {
          errors.push(`${name}: Missing or invalid command`);
        }
        if (!Array.isArray(server.args)) {
          errors.push(`${name}: Missing or invalid args array`);
        }
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: errors.length
            ? `Validation failed:\n${errors.join('\n')}`
            : 'Configuration is valid',
        },
      ],
      isError: errors.length > 0,
    };
  }

  private handleGenerateServer(args: any) {
    const { serverType, name, description } = args;
    
    const code = `#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

class ${name}Server {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: '${name}',
        version: '0.1.0',
      },
      {
        capabilities: {
          ${serverType === 'resource' || serverType === 'hybrid' ? 'resources: {},' : ''}
          ${serverType === 'tool' || serverType === 'hybrid' ? 'tools: {},' : ''}
        },
      }
    );

    ${serverType === 'tool' || serverType === 'hybrid' ? 'this.setupToolHandlers();' : ''}
    ${serverType === 'resource' || serverType === 'hybrid' ? 'this.setupResourceHandlers();' : ''}
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  ${serverType === 'tool' || serverType === 'hybrid' ? `
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Define your tools here
        {
          name: 'example_tool',
          description: 'Example tool description',
          inputSchema: {
            type: 'object',
            properties: {
              param1: { type: 'string' }
            },
            required: ['param1']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Handle tool calls here
      throw new McpError(ErrorCode.MethodNotFound, 'Tool not implemented');
    });
  }` : ''}

  ${serverType === 'resource' || serverType === 'hybrid' ? `
  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        // Define your resources here
        {
          uri: 'example://resource',
          name: 'Example Resource',
          mimeType: 'text/plain',
          description: 'Example resource description'
        }
      ]
    }));
  }` : ''}

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('${name} MCP server running on stdio');
  }
}

const server = new ${name}Server();
server.run().catch(console.error);`;

    return {
      content: [
        {
          type: 'text',
          text: `Generated ${serverType} server template for ${name}:\n\n${code}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Assistant server running on stdio');
  }
}

const server = new McpAssistantServer();
server.run().catch(console.error);
