#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = "https://app.linklyhq.com";

// Get credentials from environment
const API_KEY = process.env.LINKLY_API_KEY;
const WORKSPACE_ID = process.env.LINKLY_WORKSPACE_ID;

if (!API_KEY || !WORKSPACE_ID) {
  console.error(
    "Error: LINKLY_API_KEY and LINKLY_WORKSPACE_ID environment variables are required"
  );
  process.exit(1);
}

// Helper to make API requests
async function apiRequest(method, path, body = null) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-WORKSPACE-ID": WORKSPACE_ID,
      "X-API-KEY": API_KEY,
    },
  };

  if (body) {
    options.body = JSON.stringify({
      ...body,
      workspace_id: WORKSPACE_ID,
      api_key: API_KEY,
    });
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Define available tools
const tools = [
  {
    name: "create_link",
    description:
      "Create a new Linkly short link. Returns the created link with its short URL.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The destination URL for the link (required)",
        },
        name: {
          type: "string",
          description: "A nickname for the link to identify it later",
        },
        note: {
          type: "string",
          description: "A private note about this link",
        },
        domain: {
          type: "string",
          description: "Custom domain for the short link (without trailing /)",
        },
        slug: {
          type: "string",
          description: "Custom slug/suffix for the link (must start with /)",
        },
        enabled: {
          type: "boolean",
          description: "Whether the link is active (default: true)",
        },
        utm_source: {
          type: "string",
          description: "UTM source parameter",
        },
        utm_medium: {
          type: "string",
          description: "UTM medium parameter",
        },
        utm_campaign: {
          type: "string",
          description: "UTM campaign parameter",
        },
        utm_term: {
          type: "string",
          description: "UTM term parameter",
        },
        utm_content: {
          type: "string",
          description: "UTM content parameter",
        },
        og_title: {
          type: "string",
          description: "Open Graph title for social media previews",
        },
        og_description: {
          type: "string",
          description: "Open Graph description for social media previews",
        },
        og_image: {
          type: "string",
          description: "Open Graph image URL for social media previews",
        },
        fb_pixel_id: {
          type: "string",
          description: "Meta/Facebook Pixel ID for tracking",
        },
        ga4_tag_id: {
          type: "string",
          description: "Google Analytics 4 tag ID",
        },
        gtm_id: {
          type: "string",
          description: "Google Tag Manager container ID",
        },
        cloaking: {
          type: "boolean",
          description: "Hide destination URL by opening in an iframe",
        },
        forward_params: {
          type: "boolean",
          description: "Forward URL parameters to the destination",
        },
        block_bots: {
          type: "boolean",
          description: "Block known bots and spiders from following the link",
        },
        hide_referrer: {
          type: "boolean",
          description: "Hide referrer information when users click",
        },
        expiry_datetime: {
          type: "string",
          description: "ISO 8601 datetime when the link should expire",
        },
        expiry_destination: {
          type: "string",
          description: "Fallback URL after expiry (404 if blank)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "update_link",
    description: "Update an existing Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to update (required)",
        },
        url: {
          type: "string",
          description: "New destination URL",
        },
        name: {
          type: "string",
          description: "New nickname for the link",
        },
        note: {
          type: "string",
          description: "New private note",
        },
        enabled: {
          type: "boolean",
          description: "Whether the link is active",
        },
        utm_source: { type: "string", description: "UTM source parameter" },
        utm_medium: { type: "string", description: "UTM medium parameter" },
        utm_campaign: { type: "string", description: "UTM campaign parameter" },
        utm_term: { type: "string", description: "UTM term parameter" },
        utm_content: { type: "string", description: "UTM content parameter" },
        og_title: { type: "string", description: "Open Graph title" },
        og_description: { type: "string", description: "Open Graph description" },
        og_image: { type: "string", description: "Open Graph image URL" },
        fb_pixel_id: { type: "string", description: "Meta Pixel ID" },
        ga4_tag_id: { type: "string", description: "Google Analytics 4 tag ID" },
        gtm_id: { type: "string", description: "Google Tag Manager ID" },
        cloaking: { type: "boolean", description: "Enable URL cloaking" },
        forward_params: { type: "boolean", description: "Forward URL parameters" },
        block_bots: { type: "boolean", description: "Block bots" },
        hide_referrer: { type: "boolean", description: "Hide referrer" },
        expiry_datetime: { type: "string", description: "Expiry datetime (ISO 8601)" },
        expiry_destination: { type: "string", description: "Fallback URL after expiry" },
      },
      required: ["link_id"],
    },
  },
  {
    name: "delete_link",
    description: "Delete a Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to delete",
        },
      },
      required: ["link_id"],
    },
  },
  {
    name: "get_link",
    description: "Get details of a specific Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to retrieve",
        },
      },
      required: ["link_id"],
    },
  },
  {
    name: "list_links",
    description:
      "List all links in the workspace. Returns links with click statistics.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_clicks",
    description: "Get recent click data for the workspace",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "Optional: filter clicks by link ID",
        },
      },
      required: [],
    },
  },
  {
    name: "get_analytics",
    description:
      "Get time-series click analytics data for charting. Returns click counts over time.",
    inputSchema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)",
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: today)",
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID",
        },
        frequency: {
          type: "string",
          enum: ["day", "hour"],
          description: "Time granularity: 'day' (default) or 'hour'",
        },
        country: {
          type: "string",
          description: "Filter by country code (e.g., 'US', 'GB')",
        },
        platform: {
          type: "string",
          description: "Filter by platform (e.g., 'desktop', 'mobile', 'tablet')",
        },
        browser: {
          type: "string",
          description: "Filter by browser name",
        },
        unique: {
          type: "boolean",
          description: "Count unique clicks only (by IP)",
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering: include (default), exclude, or only",
        },
      },
      required: [],
    },
  },
  {
    name: "get_analytics_by",
    description:
      "Get click counts grouped by a dimension (country, platform, browser, etc.). Useful for breakdowns and top-N reports.",
    inputSchema: {
      type: "object",
      properties: {
        counter: {
          type: "string",
          enum: [
            "country",
            "platform",
            "browser_name",
            "referer",
            "isp",
            "link_id",
            "destination",
            "bot_name",
          ],
          description: "Dimension to group by (required)",
        },
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)",
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: today)",
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID",
        },
        country: {
          type: "string",
          description: "Filter by country code",
        },
        platform: {
          type: "string",
          description: "Filter by platform",
        },
        unique: {
          type: "boolean",
          description: "Count unique clicks only",
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering",
        },
      },
      required: ["counter"],
    },
  },
  {
    name: "export_clicks",
    description:
      "Export detailed click records with full information (timestamp, browser, country, URL, platform, referer, bot, ISP, params).",
    inputSchema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)",
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: yesterday)",
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID",
        },
        country: {
          type: "string",
          description: "Filter by country code",
        },
        platform: {
          type: "string",
          description: "Filter by platform",
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering",
        },
      },
      required: [],
    },
  },
  // Domain Management
  {
    name: "list_domains",
    description: "List all custom domains in the workspace.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "create_domain",
    description:
      "Add a custom domain to the workspace. The domain must be configured to point to Linkly's servers.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The domain name (e.g., 'links.example.com')",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "delete_domain",
    description: "Remove a custom domain from the workspace.",
    inputSchema: {
      type: "object",
      properties: {
        domain_id: {
          type: "integer",
          description: "The ID of the domain to delete",
        },
      },
      required: ["domain_id"],
    },
  },
  // Link Search
  {
    name: "search_links",
    description:
      "Search for links by name, URL, or note. Returns matching links with click statistics.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to match against link names, URLs, and notes",
        },
      },
      required: ["query"],
    },
  },
  // Workspace Webhooks
  {
    name: "list_webhooks",
    description:
      "List all webhook URLs subscribed to the workspace. These receive click events for all links.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "subscribe_webhook",
    description:
      "Subscribe a webhook URL to receive click events for all links in the workspace.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The webhook URL to receive click event notifications",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "unsubscribe_webhook",
    description: "Unsubscribe a webhook URL from workspace click events.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The webhook URL to unsubscribe",
        },
      },
      required: ["url"],
    },
  },
  // Link Webhooks
  {
    name: "list_link_webhooks",
    description: "List all webhook URLs subscribed to a specific link.",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link",
        },
      },
      required: ["link_id"],
    },
  },
  {
    name: "subscribe_link_webhook",
    description: "Subscribe a webhook URL to receive click events for a specific link.",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link",
        },
        url: {
          type: "string",
          description: "The webhook URL to receive click event notifications",
        },
      },
      required: ["link_id", "url"],
    },
  },
  {
    name: "unsubscribe_link_webhook",
    description: "Unsubscribe a webhook URL from a specific link's click events.",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link",
        },
        url: {
          type: "string",
          description: "The webhook URL to unsubscribe",
        },
      },
      required: ["link_id", "url"],
    },
  },
];

// Handle tool execution
async function handleToolCall(name, args) {
  switch (name) {
    case "create_link": {
      const result = await apiRequest(
        "POST",
        `/api/v1/workspace/${WORKSPACE_ID}/links`,
        args
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "update_link": {
      const { link_id, ...updateData } = args;
      const result = await apiRequest(
        "POST",
        `/api/v1/workspace/${WORKSPACE_ID}/links`,
        { id: link_id, ...updateData }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "delete_link": {
      const result = await apiRequest(
        "DELETE",
        `/api/v1/workspace/${WORKSPACE_ID}/links/${args.link_id}`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "get_link": {
      const result = await apiRequest("GET", `/api/v1/get_link/${args.link_id}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "list_links": {
      const result = await apiRequest(
        "GET",
        `/api/v1/workspace/${WORKSPACE_ID}/links/export`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "get_clicks": {
      const params = new URLSearchParams();
      params.append("format", "json");
      if (args.link_id) params.append("link_id", args.link_id);

      const url = `/api/v1/workspace/${WORKSPACE_ID}/clicks/export?${params.toString()}`;
      const result = await apiRequest("GET", url);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "get_analytics": {
      const params = new URLSearchParams();
      if (args.start) params.append("start", args.start);
      if (args.end) params.append("end", args.end);
      if (args.link_id) params.append("link_id", args.link_id);
      if (args.frequency) params.append("frequency", args.frequency);
      if (args.country) params.append("country", args.country);
      if (args.platform) params.append("platform", args.platform);
      if (args.browser) params.append("browser", args.browser);
      if (args.unique) params.append("unique", args.unique);
      if (args.bots) params.append("bots", args.bots);

      const queryString = params.toString();
      const url = `/api/v1/workspace/${WORKSPACE_ID}/clicks${queryString ? `?${queryString}` : ""}`;
      const result = await apiRequest("GET", url);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "get_analytics_by": {
      const params = new URLSearchParams();
      params.append("counter", args.counter);
      if (args.start) params.append("start", args.start);
      if (args.end) params.append("end", args.end);
      if (args.link_id) params.append("link_id", args.link_id);
      if (args.country) params.append("country", args.country);
      if (args.platform) params.append("platform", args.platform);
      if (args.unique) params.append("unique", args.unique);
      if (args.bots) params.append("bots", args.bots);

      const url = `/api/v1/workspace/${WORKSPACE_ID}/clicks/counters/${args.counter}?${params.toString()}`;
      const result = await apiRequest("GET", url);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "export_clicks": {
      const params = new URLSearchParams();
      params.append("format", "json");
      if (args.start) params.append("start", args.start);
      if (args.end) params.append("end", args.end);
      if (args.link_id) params.append("link_id", args.link_id);
      if (args.country) params.append("country", args.country);
      if (args.platform) params.append("platform", args.platform);
      if (args.bots) params.append("bots", args.bots);

      const url = `/api/v1/workspace/${WORKSPACE_ID}/clicks/export?${params.toString()}`;
      const result = await apiRequest("GET", url);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Domain Management
    case "list_domains": {
      const result = await apiRequest(
        "GET",
        `/api/v1/workspace/${WORKSPACE_ID}/domains`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "create_domain": {
      const result = await apiRequest(
        "POST",
        `/api/v1/workspace/${WORKSPACE_ID}/domains`,
        { name: args.name }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "delete_domain": {
      const result = await apiRequest(
        "DELETE",
        `/api/v1/workspace/${WORKSPACE_ID}/domains/${args.domain_id}`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, message: result }, null, 2),
          },
        ],
      };
    }

    // Link Search
    case "search_links": {
      const params = new URLSearchParams();
      params.append("search", args.query);
      const result = await apiRequest(
        "GET",
        `/api/v1/workspace/${WORKSPACE_ID}/links/export?${params.toString()}`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Workspace Webhooks
    case "list_webhooks": {
      const result = await apiRequest(
        "GET",
        `/api/v1/workspace/${WORKSPACE_ID}/webhooks`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "subscribe_webhook": {
      const result = await apiRequest(
        "POST",
        `/api/v1/workspace/${WORKSPACE_ID}/webhooks`,
        { url: args.url }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "unsubscribe_webhook": {
      const encodedUrl = encodeURIComponent(args.url);
      await apiRequest(
        "DELETE",
        `/api/v1/workspace/${WORKSPACE_ID}/webhooks/${encodedUrl}`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true }, null, 2),
          },
        ],
      };
    }

    // Link Webhooks
    case "list_link_webhooks": {
      const result = await apiRequest(
        "GET",
        `/api/v1/link/${args.link_id}/webhooks`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "subscribe_link_webhook": {
      const result = await apiRequest(
        "POST",
        `/api/v1/link/${args.link_id}/webhooks`,
        { url: args.url }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "unsubscribe_link_webhook": {
      const encodedUrl = encodeURIComponent(args.url);
      await apiRequest(
        "DELETE",
        `/api/v1/link/${args.link_id}/webhooks/${encodedUrl}`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true }, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Create and run server
const server = new Server(
  {
    name: "linkly-mcp-server",
    version: "1.3.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    return await handleToolCall(name, args || {});
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Linkly MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
