# Linkly MCP Server

An MCP (Model Context Protocol) server for Linkly that allows AI assistants to create and manage short links, track clicks, and automate URL management.

## Features

### Link Management
- **create_link** - Create new short links with full customization (UTM params, pixels, Open Graph, etc.)
- **update_link** - Update existing links
- **delete_link** - Delete links
- **get_link** - Get details of a specific link
- **list_links** - List all links in the workspace with click statistics

### Analytics
- **get_clicks** - Get recent click data
- **get_analytics** - Get time-series click data for charting (daily/hourly)
- **get_analytics_by** - Get click counts grouped by dimension (country, platform, browser, etc.)
- **export_clicks** - Export detailed click records

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

## License

MIT
