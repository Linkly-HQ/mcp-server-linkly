var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
import { DurableObject } from "cloudflare:workers";
var API_BASE = "https://app.linklyhq.com";
async function apiRequest(env, method, path, body = null) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-WORKSPACE-ID": env.WORKSPACE_ID,
      "X-API-KEY": env.API_KEY
    }
  };
  if (body) {
    options.body = JSON.stringify({
      ...body,
      workspace_id: env.WORKSPACE_ID,
      api_key: env.API_KEY
    });
  }
  const resp = await fetch(url, options);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Linkly API ${resp.status}: ${text}`);
  }
  const contentType = resp.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return resp.json();
  } else {
    return resp.text();
  }
}
__name(apiRequest, "apiRequest");
var tools = [
  {
    name: "create_link",
    description: "Create a new Linkly short link. Returns the created link with its short URL.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The destination URL for the link (required)"
        },
        name: {
          type: "string",
          description: "A nickname for the link to identify it later"
        },
        note: {
          type: "string",
          description: "A private note about this link"
        },
        domain: {
          type: "string",
          description: "Custom domain for the short link (without trailing /)"
        },
        slug: {
          type: "string",
          description: "Custom slug/suffix for the link (must start with /)"
        },
        enabled: {
          type: "boolean",
          description: "Whether the link is active (default: true)"
        },
        utm_source: {
          type: "string",
          description: "UTM source parameter"
        },
        utm_medium: {
          type: "string",
          description: "UTM medium parameter"
        },
        utm_campaign: {
          type: "string",
          description: "UTM campaign parameter"
        },
        utm_term: {
          type: "string",
          description: "UTM term parameter"
        },
        utm_content: {
          type: "string",
          description: "UTM content parameter"
        },
        og_title: {
          type: "string",
          description: "Open Graph title for social media previews"
        },
        og_description: {
          type: "string",
          description: "Open Graph description for social media previews"
        },
        og_image: {
          type: "string",
          description: "Open Graph image URL for social media previews"
        },
        fb_pixel_id: {
          type: "string",
          description: "Meta/Facebook Pixel ID for tracking"
        },
        ga4_tag_id: {
          type: "string",
          description: "Google Analytics 4 tag ID"
        },
        gtm_id: {
          type: "string",
          description: "Google Tag Manager container ID"
        },
        cloaking: {
          type: "boolean",
          description: "Hide destination URL by opening in an iframe"
        },
        forward_params: {
          type: "boolean",
          description: "Forward URL parameters to the destination"
        },
        block_bots: {
          type: "boolean",
          description: "Block known bots and spiders from following the link"
        },
        hide_referrer: {
          type: "boolean",
          description: "Hide referrer information when users click"
        },
        expiry_datetime: {
          type: "string",
          description: "ISO 8601 datetime when the link should expire"
        },
        expiry_destination: {
          type: "string",
          description: "Fallback URL after expiry (404 if blank)"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "update_link",
    description: "Update an existing Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to update (required)"
        },
        url: {
          type: "string",
          description: "New destination URL"
        },
        name: {
          type: "string",
          description: "New nickname for the link"
        },
        note: {
          type: "string",
          description: "New private note"
        },
        enabled: {
          type: "boolean",
          description: "Whether the link is active"
        },
        utm_source: { type: "string", description: "UTM source parameter" },
        utm_medium: { type: "string", description: "UTM medium parameter" },
        utm_campaign: { type: "string", description: "UTM campaign parameter" },
        utm_term: { type: "string", description: "UTM term parameter" },
        utm_content: { type: "string", description: "UTM content parameter" },
        og_title: { type: "string", description: "Open Graph title" },
        og_description: {
          type: "string",
          description: "Open Graph description"
        },
        og_image: { type: "string", description: "Open Graph image URL" },
        fb_pixel_id: { type: "string", description: "Meta Pixel ID" },
        ga4_tag_id: {
          type: "string",
          description: "Google Analytics 4 tag ID"
        },
        gtm_id: { type: "string", description: "Google Tag Manager ID" },
        cloaking: { type: "boolean", description: "Enable URL cloaking" },
        forward_params: {
          type: "boolean",
          description: "Forward URL parameters"
        },
        block_bots: { type: "boolean", description: "Block bots" },
        hide_referrer: { type: "boolean", description: "Hide referrer" },
        expiry_datetime: {
          type: "string",
          description: "Expiry datetime (ISO 8601)"
        },
        expiry_destination: {
          type: "string",
          description: "Fallback URL after expiry"
        }
      },
      required: ["link_id"]
    }
  },
  {
    name: "delete_link",
    description: "Delete a Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to delete"
        }
      },
      required: ["link_id"]
    }
  },
  {
    name: "get_link",
    description: "Get details of a specific Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to retrieve"
        }
      },
      required: ["link_id"]
    }
  },
  {
    name: "list_links",
    description: "List all links in the workspace. Returns links with click statistics.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_clicks",
    description: "Get recent click data for the workspace",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "Optional: filter clicks by link ID"
        }
      },
      required: []
    }
  },
  {
    name: "get_analytics",
    description: "Get time-series click analytics data for charting. Returns click counts over time.",
    inputSchema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)"
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: today)"
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID"
        },
        frequency: {
          type: "string",
          enum: ["day", "hour"],
          description: "Time granularity: 'day' (default) or 'hour'"
        },
        country: {
          type: "string",
          description: "Filter by country code (e.g., 'US', 'GB')"
        },
        platform: {
          type: "string",
          description: "Filter by platform (e.g., 'desktop', 'mobile', 'tablet')"
        },
        browser: {
          type: "string",
          description: "Filter by browser name"
        },
        unique: {
          type: "boolean",
          description: "Count unique clicks only (by IP)"
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering: include (default), exclude, or only"
        }
      },
      required: []
    }
  },
  {
    name: "get_analytics_by",
    description: "Get click counts grouped by a dimension (country, platform, browser, etc.). Useful for breakdowns and top-N reports.",
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
            "bot_name"
          ],
          description: "Dimension to group by (required)"
        },
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)"
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: today)"
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID"
        },
        country: {
          type: "string",
          description: "Filter by country code"
        },
        platform: {
          type: "string",
          description: "Filter by platform"
        },
        unique: {
          type: "boolean",
          description: "Count unique clicks only"
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering"
        }
      },
      required: ["counter"]
    }
  },
  {
    name: "export_clicks",
    description: "Export detailed click records with full information (timestamp, browser, country, URL, platform, referer, bot, ISP, params).",
    inputSchema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)"
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: yesterday)"
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID"
        },
        country: {
          type: "string",
          description: "Filter by country code"
        },
        platform: {
          type: "string",
          description: "Filter by platform"
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering"
        }
      },
      required: []
    }
  },
  // Domain Management
  {
    name: "list_domains",
    description: "List all custom domains in the workspace.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "create_domain",
    description: "Add a custom domain to the workspace. The domain must be configured to point to Linkly's servers.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The domain name (e.g., 'links.example.com')"
        }
      },
      required: ["name"]
    }
  },
  {
    name: "delete_domain",
    description: "Remove a custom domain from the workspace.",
    inputSchema: {
      type: "object",
      properties: {
        domain_id: {
          type: "integer",
          description: "The ID of the domain to delete"
        }
      },
      required: ["domain_id"]
    }
  },
  // Link Search
  {
    name: "search_links",
    description: "Search for links by name, URL, or note. Returns matching links with click statistics.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to match against link names, URLs, and notes"
        }
      },
      required: ["query"]
    }
  },
  // Workspace Webhooks
  {
    name: "list_webhooks",
    description: "List all webhook URLs subscribed to the workspace. These receive click events for all links.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "subscribe_webhook",
    description: "Subscribe a webhook URL to receive click events for all links in the workspace.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The webhook URL to receive click event notifications"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "unsubscribe_webhook",
    description: "Unsubscribe a webhook URL from workspace click events.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The webhook URL to unsubscribe"
        }
      },
      required: ["url"]
    }
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
          description: "The ID of the link"
        }
      },
      required: ["link_id"]
    }
  },
  {
    name: "subscribe_link_webhook",
    description: "Subscribe a webhook URL to receive click events for a specific link.",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link"
        },
        url: {
          type: "string",
          description: "The webhook URL to receive click event notifications"
        }
      },
      required: ["link_id", "url"]
    }
  },
  {
    name: "unsubscribe_link_webhook",
    description: "Unsubscribe a webhook URL from a specific link's click events.",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link"
        },
        url: {
          type: "string",
          description: "The webhook URL to unsubscribe"
        }
      },
      required: ["link_id", "url"]
    }
  }
];
async function handleToolCall(env, name, args) {
  switch (name) {
    case "create_link": {
      const result = await apiRequest(
        env,
        "POST",
        `/api/v1/workspace/${env.WORKSPACE_ID}/links`,
        args
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "update_link": {
      const { link_id, ...updateData } = args || {};
      const result = await apiRequest(
        env,
        "POST",
        `/api/v1/workspace/${env.WORKSPACE_ID}/links`,
        { id: link_id, ...updateData }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "delete_link": {
      const result = await apiRequest(
        env,
        "DELETE",
        `/api/v1/workspace/${env.WORKSPACE_ID}/links/${args.link_id}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "get_link": {
      const result = await apiRequest(
        env,
        "GET",
        `/api/v1/get_link/${args.link_id}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "list_links": {
      const result = await apiRequest(
        env,
        "GET",
        `/api/v1/workspace/${env.WORKSPACE_ID}/links/export`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "get_clicks": {
      const params = new URLSearchParams();
      params.append("format", "json");
      if (args?.link_id) params.append("link_id", String(args.link_id));
      const url = `/api/v1/workspace/${env.WORKSPACE_ID}/clicks/export?${params.toString()}`;
      const result = await apiRequest(env, "GET", url);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "get_analytics": {
      const params = new URLSearchParams();
      if (args?.start) params.append("start", args.start);
      if (args?.end) params.append("end", args.end);
      if (args?.link_id) params.append("link_id", String(args.link_id));
      if (args?.frequency) params.append("frequency", args.frequency);
      if (args?.country) params.append("country", args.country);
      if (args?.platform) params.append("platform", args.platform);
      if (args?.browser) params.append("browser", args.browser);
      if (typeof args?.unique !== "undefined")
        params.append("unique", String(args.unique));
      if (args?.bots) params.append("bots", args.bots);
      const queryString = params.toString();
      const url = `/api/v1/workspace/${env.WORKSPACE_ID}/clicks${queryString ? `?${queryString}` : ""}`;
      const result = await apiRequest(env, "GET", url);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "get_analytics_by": {
      const params = new URLSearchParams();
      params.append("counter", args.counter);
      if (args.start) params.append("start", args.start);
      if (args.end) params.append("end", args.end);
      if (args.link_id) params.append("link_id", String(args.link_id));
      if (args.country) params.append("country", args.country);
      if (args.platform) params.append("platform", args.platform);
      if (typeof args.unique !== "undefined")
        params.append("unique", String(args.unique));
      if (args?.bots) params.append("bots", args.bots);
      const url = `/api/v1/workspace/${env.WORKSPACE_ID}/clicks/counters/${args.counter}?${params.toString()}`;
      const result = await apiRequest(env, "GET", url);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "export_clicks": {
      const params = new URLSearchParams();
      params.append("format", "json");
      if (args.start) params.append("start", args.start);
      if (args.end) params.append("end", args.end);
      if (args.link_id) params.append("link_id", String(args.link_id));
      if (args.country) params.append("country", args.country);
      if (args.platform) params.append("platform", args.platform);
      if (args.bots) params.append("bots", args.bots);
      const url = `/api/v1/workspace/${env.WORKSPACE_ID}/clicks/export?${params.toString()}`;
      const result = await apiRequest(env, "GET", url);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    // Domain management, webhooks, etc. — same pattern:
    case "list_domains": {
      const result = await apiRequest(
        env,
        "GET",
        `/api/v1/workspace/${env.WORKSPACE_ID}/domains`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "create_domain": {
      const result = await apiRequest(
        env,
        "POST",
        `/api/v1/workspace/${env.WORKSPACE_ID}/domains`,
        { name: args.name }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "delete_domain": {
      const result = await apiRequest(
        env,
        "DELETE",
        `/api/v1/workspace/${env.WORKSPACE_ID}/domains/${args.domain_id}`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, message: result }, null, 2)
          }
        ]
      };
    }
    case "search_links": {
      const params = new URLSearchParams();
      params.append("search", args.query);
      const result = await apiRequest(
        env,
        "GET",
        `/api/v1/workspace/${env.WORKSPACE_ID}/links/export?${params.toString()}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "list_webhooks": {
      const result = await apiRequest(
        env,
        "GET",
        `/api/v1/workspace/${env.WORKSPACE_ID}/webhooks`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "subscribe_webhook": {
      const result = await apiRequest(
        env,
        "POST",
        `/api/v1/workspace/${env.WORKSPACE_ID}/webhooks`,
        { url: args.url }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "unsubscribe_webhook": {
      const encoded = encodeURIComponent(args.url);
      await apiRequest(
        env,
        "DELETE",
        `/api/v1/workspace/${env.WORKSPACE_ID}/webhooks/${encoded}`
      );
      return {
        content: [
          { type: "text", text: JSON.stringify({ success: true }, null, 2) }
        ]
      };
    }
    case "list_link_webhooks": {
      const result = await apiRequest(
        env,
        "GET",
        `/api/v1/link/${args.link_id}/webhooks`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "subscribe_link_webhook": {
      const result = await apiRequest(
        env,
        "POST",
        `/api/v1/link/${args.link_id}/webhooks`,
        { url: args.url }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
    case "unsubscribe_link_webhook": {
      const encoded = encodeURIComponent(args.url);
      await apiRequest(
        env,
        "DELETE",
        `/api/v1/link/${args.link_id}/webhooks/${encoded}`
      );
      return {
        content: [
          { type: "text", text: JSON.stringify({ success: true }, null, 2) }
        ]
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
__name(handleToolCall, "handleToolCall");
function sendJSONRPC(socket, payload) {
  try {
    socket.send(JSON.stringify(payload));
  } catch (e) {
  }
}
__name(sendJSONRPC, "sendJSONRPC");
var MyDurableObject = class extends DurableObject {
  static {
    __name(this, "MyDurableObject");
  }
  constructor(ctx, env) {
    super(ctx, env);
  }
  async fetch(request) {
    const upgradeHeader = request.headers.get("Upgrade") || "";
    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response(
        "Model Context Protocol Durable Object is up. Use WebSocket.",
        { status: 200 }
      );
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    server.addEventListener("message", async (evt) => {
      let data;
      try {
        data = typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;
      } catch (err) {
        sendJSONRPC(server, {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" }
        });
        return;
      }
      const id = data.id ?? null;
      const method = data.method;
      const params = data.params ?? {};
      try {
        if (method === "tools/list" || method === "tools/list_tools" || method === "list_tools") {
          const result = { tools };
          sendJSONRPC(server, { jsonrpc: "2.0", id, result });
        } else if (method === "tools/call" || method === "call_tool" || method === "call") {
          const name = params.name || params?.tool?.name || null;
          const args = params.arguments || params.args || params?.arguments || {};
          if (!name) {
            sendJSONRPC(server, {
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: "Missing tool name" }
            });
            return;
          }
          try {
            const value = await handleToolCall(this.env, name, args);
            sendJSONRPC(server, { jsonrpc: "2.0", id, result: value });
          } catch (err) {
            sendJSONRPC(server, {
              jsonrpc: "2.0",
              id,
              error: { code: 32e3, message: err?.message || String(err) }
            });
          }
        } else {
          sendJSONRPC(server, {
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: "Method not found" }
          });
        }
      } catch (err) {
        sendJSONRPC(server, {
          jsonrpc: "2.0",
          id,
          error: { code: 32e3, message: err?.message || String(err) }
        });
      }
    });
    server.addEventListener("close", (evt) => {
    });
    server.addEventListener("error", (evt) => {
    });
    return new Response(null, { status: 101, webSocket: client });
  }
};
var src_default = {
  async fetch(request, env, ctx) {
    if (!env.API_KEY || !env.WORKSPACE_ID) {
      return new Response(
        "Error: LINKLY_API_KEY and LINKLY_WORKSPACE_ID environment variables are required"
      );
    }
    const objectId = env.MY_DURABLE_OBJECT.idFromName(env.WORKSPACE_ID);
    const object = env.MY_DURABLE_OBJECT.get(objectId);
    return object.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-jvGnMU/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-jvGnMU/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  MyDurableObject,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
