# Linkly MCP Server

An MCP (Model Context Protocol) server that allows AI assistants like Claude and ChatGPT to create and manage short links, track clicks, and automate URL management.

## About Linkly

[Linkly](https://linklyhq.com) is a powerful link management platform that lets you create branded short links, track clicks in real-time, and optimize your marketing campaigns. Features include custom domains, UTM parameters, retargeting pixels, QR codes, and detailed analytics.

## Features

### Link Management
- **create_link** - Create new short links with full customization (UTM params, pixels, Open Graph, etc.)
- **update_link** - Update existing links
- **delete_link** - Delete links
- **get_link** - Get details of a specific link
- **list_links** - List all links in the workspace with click statistics
- **search_links** - Search links by name, URL, or note

### Analytics
- **get_clicks** - Get recent click data
- **get_analytics** - Get time-series click data for charting (daily/hourly)
- **get_analytics_by** - Get click counts grouped by dimension (country, platform, browser, etc.)
- **export_clicks** - Export detailed click records

### Domain Management
- **list_domains** - List all custom domains in the workspace
- **create_domain** - Add a custom domain
- **delete_domain** - Remove a custom domain

### Webhook Management
- **list_webhooks** - List workspace-level webhook subscriptions
- **subscribe_webhook** - Subscribe a URL to receive click events for all links
- **unsubscribe_webhook** - Unsubscribe a webhook URL
- **list_link_webhooks** - List webhooks for a specific link
- **subscribe_link_webhook** - Subscribe a URL to a specific link's click events
- **unsubscribe_link_webhook** - Unsubscribe from a link's click events

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

## Quick Start with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "linkly": {
      "command": "npx",
      "args": ["-y", "linkly-mcp-server"],
      "env": {
        "LINKLY_API_KEY": "your-api-key",
        "LINKLY_WORKSPACE_ID": "your-workspace-id"
      }
    }
  }
}
```

For detailed setup instructions and usage examples, see the [Claude Desktop Setup Guide](docs/claude-desktop-setup.md).

## Usage with Claude Code

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "linkly": {
      "command": "npx",
      "args": ["-y", "linkly-mcp-server"],
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

### get_analytics

Get time-series click analytics data for charting.

**Optional parameters:**
- `start` - Start date (YYYY-MM-DD, default: 30 days ago)
- `end` - End date (YYYY-MM-DD, default: today)
- `link_id` - Filter by specific link
- `frequency` - Time granularity: `day` (default) or `hour`
- `country` - Filter by country code (e.g., 'US', 'GB')
- `platform` - Filter by platform (desktop, mobile, tablet)
- `browser` - Filter by browser name
- `unique` - Count unique clicks only (by IP)
- `bots` - Bot filtering: `include` (default), `exclude`, or `only`

### get_analytics_by

Get click counts grouped by a dimension. Useful for breakdowns and top-N reports.

**Required parameters:**
- `counter` - Dimension to group by: `country`, `platform`, `browser_name`, `referer`, `isp`, `link_id`, `destination`, `bot_name`

**Optional parameters:**
- `start` - Start date (YYYY-MM-DD)
- `end` - End date (YYYY-MM-DD)
- `link_id` - Filter by specific link
- `country` - Filter by country code
- `platform` - Filter by platform
- `unique` - Count unique clicks only
- `bots` - Bot filtering

### export_clicks

Export detailed click records with full information.

**Optional parameters:**
- `start` - Start date (YYYY-MM-DD, default: 30 days ago)
- `end` - End date (YYYY-MM-DD, default: yesterday)
- `link_id` - Filter by specific link
- `country` - Filter by country code
- `platform` - Filter by platform
- `bots` - Bot filtering

Returns: Array of click records with timestamp, browser, country, URL, link_id, platform, referer, bot, ISP, and params.

### search_links

Search for links by name, URL, or note.

**Required parameters:**
- `query` - Search string to match against link names, URLs, and notes

### list_domains

List all custom domains in the workspace. No parameters required.

### create_domain

Add a custom domain to the workspace.

**Required parameters:**
- `name` - The domain name (e.g., 'links.example.com')

### delete_domain

Remove a custom domain from the workspace.

**Required parameters:**
- `domain_id` - The ID of the domain to delete

### list_webhooks

List all webhook URLs subscribed to the workspace. No parameters required.

### subscribe_webhook

Subscribe a webhook URL to receive click events for all links.

**Required parameters:**
- `url` - The webhook URL to receive click event notifications

### unsubscribe_webhook

Unsubscribe a webhook URL from workspace click events.

**Required parameters:**
- `url` - The webhook URL to unsubscribe

### list_link_webhooks

List all webhook URLs subscribed to a specific link.

**Required parameters:**
- `link_id` - The ID of the link

### subscribe_link_webhook

Subscribe a webhook URL to receive click events for a specific link.

**Required parameters:**
- `link_id` - The ID of the link
- `url` - The webhook URL to receive click event notifications

### unsubscribe_link_webhook

Unsubscribe a webhook URL from a specific link's click events.

**Required parameters:**
- `link_id` - The ID of the link
- `url` - The webhook URL to unsubscribe

## License

MIT
