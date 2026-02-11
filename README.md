# Agentic Design System Database

A lightweight contextual database for design system components with a React control panel UI and MCP server for AI agent integration.

## Quick Start

```bash
pnpm install
pnpm build
pnpm dev
```

- **UI**: http://localhost:5173
- **API**: http://localhost:3001

## Packages

| Package | Description |
|---------|-------------|
| `packages/server` | Express API + SQLite database |
| `packages/ui` | React TypeScript control panel |
| `packages/mcp-server` | MCP server (stdio) for AI agents |
| `packages/shared` | Shared TypeScript types |

## MCP Server

Add to your Cursor/Claude Desktop config:

```json
{
  "mcpServers": {
    "design-system": {
      "command": "node",
      "args": ["/path/to/agentic-design-system/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Tools

- `search_components` - Full-text search across components
- `get_component` - Get full component code, usage, and tokens
- `list_components` - List all components by category
- `get_usage_rules` - Get usage and layout guidelines
- `get_tokens` - Get design tokens

## Import Sources

- **Figma** - Import published components via Figma REST API
- **Storybook** - Import components from a running Storybook instance
