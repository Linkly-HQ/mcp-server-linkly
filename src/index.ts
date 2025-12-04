import { DurableObject } from "cloudflare:workers";

const API_BASE = "https://app.linklyhq.com";

/** Generic Linkly API request */
async function apiRequest(env: Env, method: string, path: string, body: any = null) {
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
  const text = await resp.text();

  if (!resp.ok) {
    throw new Error(`Linkly API ${resp.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** MCP tools available */
const tools = [
  {
    name: "linkly.create_link",
    description: "Create a new Linkly short link.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Destination URL" },
        name: { type: "string", description: "Name for the link" }
      },
      required: ["url"]
    }
  }
];

/** Handle tool call */
async function handleToolCall(env: Env, name: string, args: any) {
  if (name === "create_link") {
    const result = await apiRequest(
      env,
      "POST",
      `/api/v1/workspace/${env.WORKSPACE_ID}/links`,
      args
    );

    return {
      content: [
        { type: "text", text: JSON.stringify(result, null, 2) }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

/** Send JSON-RPC message */
function sendJSON(socket: WebSocket, msg: any) {
  try {
    socket.send(JSON.stringify(msg));
  } catch (err) {
    console.log("WebSocket send error:", err);
  }
}

/** Durable Object WebSocket */
export class MyDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response(
        "Linkly MCP is running. Connect via WebSocket.",
        { status: 200 }
      );
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();

    server.addEventListener("message", async (evt) => {
      let msg;

      try {
        msg = JSON.parse(evt.data);
      } catch {
        sendJSON(server, {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        });
        return;
      }

      const { id, method, params = {} } = msg;

      // REQUIRED BY CHATGPT DESKTOP
      if (method === "initialize") {
        sendJSON(server, {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "1.0",
            capabilities: {},
          },
        });
        return;
      }

      // REQUIRED BY CHATGPT DESKTOP
      if (method === "ping") {
        sendJSON(server, { jsonrpc: "2.0", id, result: "pong" });
        return;
      }

      // Tools discovery
      if (method === "tools/list") {
        sendJSON(server, {
          jsonrpc: "2.0",
          id,
          result: { tools },
        });
        return;
      }

      // ChatGPT Desktop Direct Tool Call
      if (method.startsWith("linkly.")) {
        const name = method.replace("linkly.", "");
        const result = await handleToolCall(this.env, name, params);
        sendJSON(server, { jsonrpc: "2.0", id, result });
        return;
      }

      // Postman-style universal call
      if (method === "tools/call") {
        const toolName = params.name?.replace("linkly.", "");
        const args = params.arguments || {};
        const result = await handleToolCall(this.env, toolName, args);
        sendJSON(server, { jsonrpc: "2.0", id, result });
        return;
      }

      // Unknown
      sendJSON(server, {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "Unknown method" },
      });
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}

/** Worker entry */
export default {
  async fetch(req: Request, env: Env) {
    const objId = env.MY_DURABLE_OBJECT.idFromName("linkly-do");
    const stub = env.MY_DURABLE_OBJECT.get(objId);
    return stub.fetch(req);
  }
};
