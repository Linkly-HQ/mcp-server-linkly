import { DurableObject } from "cloudflare:workers";

const API_BASE = "https://app.linklyhq.com";

/** Generic Linkly API request */
async function apiRequest(
  env: Env,
  method: string,
  path: string,
  body: any = null
) {
  const url = `${API_BASE}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-WORKSPACE-ID": env.WORKSPACE_ID,
      "X-API-KEY": env.API_KEY,
    },
  };
  if (body) {
    options.body = JSON.stringify({
      ...body,
      workspace_id: env.WORKSPACE_ID,
      api_key: env.API_KEY,
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

/** Available tools */
const tools = [
  {
    name: "create_link",
    description: "Create a new Linkly short link.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Destination URL", required: true },
        name: { type: "string", description: "Name/nickname for the link" },
        note: { type: "string", description: "Private note" },
        domain: { type: "string", description: "Custom domain" },
        slug: { type: "string", description: "Custom slug" },
        enabled: { type: "boolean", description: "Link active status" },
        utm_source: { type: "string" },
        utm_medium: { type: "string" },
        utm_campaign: { type: "string" },
        utm_term: { type: "string" },
        utm_content: { type: "string" },
        og_title: { type: "string" },
        og_description: { type: "string" },
        og_image: { type: "string" },
        fb_pixel_id: { type: "string" },
        ga4_tag_id: { type: "string" },
        gtm_id: { type: "string" },
        cloaking: { type: "boolean" },
        forward_params: { type: "boolean" },
        block_bots: { type: "boolean" },
        hide_referrer: { type: "boolean" },
        expiry_datetime: { type: "string" },
        expiry_destination: { type: "string" },
      },
      required: ["url"],
    },
  },
  // Add other tools (update_link, delete_link, etc.) following same pattern if needed
];

/** Handle tool calls */
async function handleToolCall(env: Env, name: string, args: any) {
  switch (name) {
    case "create_link": {
      const result = await apiRequest(
        env,
        "POST",
        `/api/v1/workspace/${env.WORKSPACE_ID}/links`,
        args
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
    // Add other tool implementations here if needed
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/** Send JSON-RPC response via WebSocket */
function sendJSONRPC(socket: WebSocket, payload: any) {
  try {
    socket.send(JSON.stringify(payload));
  } catch (e) {
    console.error("WebSocket send error:", e);
  }
}

/** Durable Object */
export class MyDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade") || "";
    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response(
        "MCP Durable Object is running. Connect via WebSocket.",
        { status: 200 }
      );
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    server.addEventListener("message", async (evt: any) => {
      let data: any;
      try {
        data = typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;
      } catch (err) {
        sendJSONRPC(server, {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        });
        return;
      }

      const id = data.id ?? null;
      const method = data.method;
      const params = data.params ?? {};

      try {
        // Return tools list
        if (
          method === "tools/list" ||
          method === "tools/list_tools" ||
          method === "list_tools"
        ) {
          sendJSONRPC(server, { jsonrpc: "2.0", id, result: { tools } });
          return;
        }

        // Handle Postman MCP call
        if (method === "tools/call" || method === "call_tool" || method === "call") {
          const name = params.name || params?.tool?.name || null;
          const args = params.arguments || params.args || params?.arguments || {};
          if (!name) {
            sendJSONRPC(server, {
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: "Missing tool name" },
            });
            return;
          }
          const value = await handleToolCall(this.env, name, args);
          sendJSONRPC(server, { jsonrpc: "2.0", id, result: value });
          return;
        }

        // Handle ChatGPT Desktop: method like "linkly.create_link"
        if (method && method.startsWith("linkly.")) {
          const name = method.replace("linkly.", "");
          const args = params || {};
          const value = await handleToolCall(this.env, name, args);
          sendJSONRPC(server, { jsonrpc: "2.0", id, result: value });
          return;
        }

        // Unknown method
        sendJSONRPC(server, {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: "Method not found" },
        });
      } catch (err: any) {
        sendJSONRPC(server, {
          jsonrpc: "2.0",
          id,
          error: { code: 32000, message: err?.message || String(err) },
        });
      }
    });

    server.addEventListener("close", () => {});
    server.addEventListener("error", () => {});

    return new Response(null, { status: 101, webSocket: client });
  }
}

/** Exported handler */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (!env.API_KEY || !env.WORKSPACE_ID) {
      return new Response(
        "Error: LINKLY_API_KEY and LINKLY_WORKSPACE_ID environment variables are required",
        { status: 400 }
      );
    }

    const objectId = env.MY_DURABLE_OBJECT.idFromName(env.WORKSPACE_ID);
    const object = env.MY_DURABLE_OBJECT.get(objectId);
    return object.fetch(request);
  },
} satisfies ExportedHandler<Env>;
