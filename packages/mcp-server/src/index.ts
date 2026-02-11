#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import db from "./db.js";

const server = new McpServer({
  name: "design-system",
  version: "0.0.1",
});

server.registerTool(
  "search_components",
  {
    title: "Search Components",
    description: "Full-text search for components by name, description, or usage",
    inputSchema: {
      query: z.string().describe("Search query"),
      category: z.string().optional().describe("Filter by category"),
    },
  },
  async ({ query, category }) => {
    let rows;
    if (category) {
      rows = db
        .prepare(
          `SELECT c.id, c.name, c.category, c.description FROM components c
           JOIN components_fts f ON c.rowid = f.rowid
           WHERE components_fts MATCH ? AND c.category = ?
           ORDER BY rank LIMIT 20`
        )
        .all(query, category);
    } else {
      rows = db
        .prepare(
          `SELECT c.id, c.name, c.category, c.description FROM components c
           JOIN components_fts f ON c.rowid = f.rowid
           WHERE components_fts MATCH ?
           ORDER BY rank LIMIT 20`
        )
        .all(query);
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }] };
  }
);

server.registerTool(
  "get_component",
  {
    title: "Get Component",
    description: "Get full component details including code, usage, layout, tokens, and props",
    inputSchema: {
      name: z.string().describe("Component name"),
    },
  },
  async ({ name }) => {
    const row = db.prepare("SELECT * FROM components WHERE name = ? COLLATE NOCASE").get(name);
    if (!row) {
      return { content: [{ type: "text" as const, text: `Component "${name}" not found` }] };
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(row, null, 2) }] };
  }
);

server.registerTool(
  "list_components",
  {
    title: "List Components",
    description: "List all available components, optionally filtered by category",
    inputSchema: {
      category: z.string().optional().describe("Filter by category"),
    },
  },
  async ({ category }) => {
    const rows = category
      ? db.prepare("SELECT id, name, category, description FROM components WHERE category = ? ORDER BY name").all(category)
      : db.prepare("SELECT id, name, category, description FROM components ORDER BY name").all();
    return { content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }] };
  }
);

server.registerTool(
  "get_usage_rules",
  {
    title: "Get Usage Rules",
    description: "Get usage guidelines and layout rules for a component",
    inputSchema: {
      name: z.string().describe("Component name"),
    },
  },
  async ({ name }) => {
    const row = db.prepare("SELECT name, usage, layout FROM components WHERE name = ? COLLATE NOCASE").get(name) as {
      name: string;
      usage: string | null;
      layout: string | null;
    } | undefined;
    if (!row) {
      return { content: [{ type: "text" as const, text: `Component "${name}" not found` }] };
    }
    return {
      content: [
        { type: "text" as const, text: `# ${row.name} Usage Rules\n\n## Usage\n${row.usage || "No usage guidelines."}\n\n## Layout\n${row.layout || "No layout rules."}` },
      ],
    };
  }
);

server.registerTool(
  "get_tokens",
  {
    title: "Get Design Tokens",
    description: "Get design tokens, optionally filtered to a specific component",
    inputSchema: {
      name: z.string().optional().describe("Component name (omit for all tokens)"),
    },
  },
  async ({ name }) => {
    if (name) {
      const row = db.prepare("SELECT name, tokens FROM components WHERE name = ? COLLATE NOCASE").get(name) as {
        name: string;
        tokens: string | null;
      } | undefined;
      if (!row) {
        return { content: [{ type: "text" as const, text: `Component "${name}" not found` }] };
      }
      return { content: [{ type: "text" as const, text: row.tokens || "No tokens defined." }] };
    }
    const rows = db.prepare("SELECT name, tokens FROM components WHERE tokens IS NOT NULL").all();
    return { content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }] };
  }
);

server.registerResource(
  "components-list",
  "designsystem://components",
  {
    title: "All Components",
    description: "List of all components in the design system database",
    mimeType: "application/json",
  },
  async () => {
    const rows = db.prepare("SELECT id, name, category, description FROM components ORDER BY name").all();
    return { contents: [{ uri: "designsystem://components", text: JSON.stringify(rows, null, 2) }] };
  }
);

server.registerResource(
  "component-by-name",
  new ResourceTemplate("designsystem://component/{name}", { list: undefined }),
  {
    title: "Component by Name",
    description: "Get a specific component by name",
    mimeType: "application/json",
  },
  async (uri, { name }) => {
    const row = db.prepare("SELECT * FROM components WHERE name = ? COLLATE NOCASE").get(String(name));
    if (!row) {
      return { contents: [{ uri: uri.href, text: `Component "${name}" not found` }] };
    }
    return { contents: [{ uri: uri.href, text: JSON.stringify(row, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
