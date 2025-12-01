# Linkly MCP Server

An MCP (Model Context Protocol) server for Linkly that allows AI assistants to create and manage short links, track clicks, and automate URL management.

## Features

- **create_link** - Create new short links with full customization (UTM params, pixels, Open Graph, etc.)
- **update_link** - Update existing links
- **delete_link** - Delete links
- **get_link** - Get details of a specific link
- **list_links** - List all links in the workspace with click statistics
- **get_clicks** - Get recent click data

## Installation

```bash
cd integrations/mcp-server
npm install
```

## Configuration

Set the following environment variables:

```bash
export LINKLY_API_KEY="your-api-key"
export LINKLY_WORKSPACE_ID="your-workspace-id"
```

You can find these at [Settings → API](https://app.linklyhq.com/app/user/api) in your Linkly dashboard.

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "linkly": {
      "command": "node",
      "args": ["/path/to/shortr/integrations/mcp-server/index.js"],
      "env": {
        "LINKLY_API_KEY": "your-api-key",
        "LINKLY_WORKSPACE_ID": "your-workspace-id"
      }
    }
  }
}
```

## Usage with Claude Code

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "linkly": {
      "command": "node",
      "args": ["/path/to/shortr/integrations/mcp-server/index.js"],
      "env": {
        "LINKLY_API_KEY": "your-api-key",
        "LINKLY_WORKSPACE_ID": "your-workspace-id"
      }
    }
  }
}
```

## Available Tools

### create_link

Create a new short link.

**Required parameters:**
- `url` - The destination URL

**Optional parameters:**
- `name` - Nickname for the link
- `note` - Private note
- `domain` - Custom domain
- `slug` - Custom slug (must start with /)
- `enabled` - Whether link is active (default: true)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` - UTM parameters
- `og_title`, `og_description`, `og_image` - Open Graph metadata
- `fb_pixel_id` - Meta/Facebook Pixel ID
- `ga4_tag_id` - Google Analytics 4 tag ID
- `gtm_id` - Google Tag Manager ID
- `cloaking` - Hide destination URL in iframe
- `forward_params` - Forward URL parameters to destination
- `block_bots` - Block bots and spiders
- `hide_referrer` - Hide referrer information
- `expiry_datetime` - When the link expires (ISO 8601)
- `expiry_destination` - Fallback URL after expiry

### update_link

Update an existing link.

**Required parameters:**
- `link_id` - The ID of the link to update

All other parameters from `create_link` are optional.

### delete_link

Delete a link.

**Required parameters:**
- `link_id` - The ID of the link to delete

### get_link

Get details of a specific link.

**Required parameters:**
- `link_id` - The ID of the link to retrieve

### list_links

List all links in the workspace. No parameters required.

### get_clicks

Get recent click data.

**Optional parameters:**
- `link_id` - Filter clicks by link ID

## License

MIT
