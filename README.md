# Father-MCP

A Model Context Protocol (MCP) server designed to help AI models understand and create their own MCP implementations. This server provides tools and documentation to facilitate the development of MCP-enabled applications.

## 🌟 Features

- **Documentation Tools**: Access comprehensive MCP documentation and examples
- **Configuration Validation**: Validate MCP server configurations
- **Code Generation**: Generate template code for new MCP servers
- **Built with TypeScript**: Type-safe implementation with modern JavaScript features

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/deepsuthar496/father-mcp
cd father-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Configure the MCP server in your MCP settings file:
```json
{
  "mcpServers": {
    "father-mcp": {
      "command": "node",
      "args": ["path/to/father-mcp/build/index.js"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## 🛠️ Available Tools

### 1. get_mcp_docs
Get detailed documentation about MCP concepts and implementation.

```typescript
// Example usage
{
  "topic": "overview" // or "tools", "resources", "server_setup"
}
```

### 2. validate_config
Validate MCP server configurations to ensure they follow the correct format.

```typescript
// Example usage
{
  "config": {
    "mcpServers": {
      "my-server": {
        "command": "node",
        "args": ["path/to/server.js"]
      }
    }
  }
}
```

### 3. generate_server_code
Generate template code for new MCP servers.

```typescript
// Example usage
{
  "serverType": "tool", // or "resource", "hybrid"
  "name": "my-server",
  "description": "My awesome MCP server"
}
```

## 📁 Project Structure

```
father-mcp/
├── src/
│   └── index.ts      # Main server implementation
├── build/            # Compiled JavaScript files
├── package.json      # Project dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # Project documentation
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Quick Start Example

Here's a complete example of how to use Father-MCP in your AI application:

```typescript
// Example of using get_mcp_docs
await use_mcp_tool({
  server_name: "father-mcp",
  tool_name: "get_mcp_docs",
  arguments: {
    topic: "overview"
  }
});

// Example of generating a new server
await use_mcp_tool({
  server_name: "father-mcp",
  tool_name: "generate_server_code",
  arguments: {
    serverType: "tool",
    name: "weather-server",
    description: "MCP server for weather data"
  }
});
```

## 📚 Additional Resources

- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)

## 🤖 Why Father-MCP?

Father-MCP serves as a foundational tool for AI models to understand and implement the Model Context Protocol. It's designed to be both educational and practical, helping AI systems create their own MCP servers while following best practices and standards.

---
Built with ❤️( Actually, Vibe coded 😁) for the AI community
