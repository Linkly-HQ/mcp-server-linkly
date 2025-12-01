# Using Linkly with Claude Desktop

This guide shows you how to connect Claude Desktop to your Linkly account, allowing you to create and manage short links directly through conversation.

## What You Can Do

Once connected, you can ask Claude to:

- **Create short links** - "Create a short link for https://example.com"
- **Track performance** - "How many clicks did my links get this week?"
- **Manage links** - "Update the link called 'promo' with a new destination"
- **View analytics** - "Show me clicks by country for the last 30 days"
- **Search links** - "Find all links related to the product launch"
- **Manage domains** - "List my custom domains"
- **Set up webhooks** - "Subscribe https://my-site.com/webhook to receive click events"

## Setup Instructions

### Step 1: Get Your API Credentials

1. Log in to your [Linkly dashboard](https://app.linklyhq.com)
2. Go to **Settings → API**
3. Copy your **API Key** and **Workspace ID**

### Step 2: Configure Claude Desktop

1. Open Claude Desktop
2. Go to **Settings** (gear icon) → **Developer** → **Edit Config**
3. This opens your configuration file. Add the Linkly server:

```json
{
  "mcpServers": {
    "linkly": {
      "command": "npx",
      "args": ["-y", "linkly-mcp-server"],
      "env": {
        "LINKLY_API_KEY": "your-api-key-here",
        "LINKLY_WORKSPACE_ID": "your-workspace-id-here"
      }
    }
  }
}
```

4. Replace `your-api-key-here` and `your-workspace-id-here` with your actual credentials
5. Save the file and restart Claude Desktop

### Step 3: Verify the Connection

After restarting, you should see a hammer icon in the Claude Desktop input area. Click it to see the available Linkly tools.

Try asking: "List my Linkly links"

## Example Conversations

### Creating a Link

> **You:** Create a short link for https://example.com/my-landing-page with the name "Summer Sale" and UTM source set to "twitter"
>
> **Claude:** I've created your short link. Here are the details:
> - Short URL: https://link.ly/abc123
> - Name: Summer Sale
> - Destination: https://example.com/my-landing-page?utm_source=twitter

### Checking Analytics

> **You:** How many clicks did I get last week, broken down by country?
>
> **Claude:** Here's your click breakdown by country for the last 7 days:
> - United States: 1,234 clicks
> - United Kingdom: 567 clicks
> - Germany: 234 clicks
> ...

### Updating a Link

> **You:** Disable the link called "Old Promo"
>
> **Claude:** I've disabled the "Old Promo" link. It will no longer redirect visitors.

### Setting Up Webhooks

> **You:** Set up a webhook to send click events to https://my-app.com/webhooks/clicks
>
> **Claude:** Done! I've subscribed https://my-app.com/webhooks/clicks to receive click events for all links in your workspace.

## Available Tools

| Tool | Description |
|------|-------------|
| `create_link` | Create a new short link with optional UTM params, pixels, and more |
| `update_link` | Update an existing link's settings |
| `delete_link` | Delete a link |
| `get_link` | Get details of a specific link |
| `list_links` | List all links in your workspace |
| `search_links` | Search links by name, URL, or note |
| `get_clicks` | Get recent click data |
| `get_analytics` | Get time-series click data for charts |
| `get_analytics_by` | Get clicks grouped by country, browser, platform, etc. |
| `export_clicks` | Export detailed click records |
| `list_domains` | List your custom domains |
| `create_domain` | Add a custom domain |
| `delete_domain` | Remove a custom domain |
| `list_webhooks` | List workspace webhook subscriptions |
| `subscribe_webhook` | Subscribe a URL to receive click events |
| `unsubscribe_webhook` | Unsubscribe a webhook URL |
| `list_link_webhooks` | List webhooks for a specific link |
| `subscribe_link_webhook` | Subscribe to a specific link's clicks |
| `unsubscribe_link_webhook` | Unsubscribe from a link's clicks |

## Link Creation Options

When creating links, you can specify:

- **Basic:** `url`, `name`, `note`, `domain`, `slug`, `enabled`
- **UTM Parameters:** `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- **Open Graph:** `og_title`, `og_description`, `og_image`
- **Tracking:** `fb_pixel_id`, `ga4_tag_id`, `gtm_id`
- **Advanced:** `cloaking`, `forward_params`, `block_bots`, `hide_referrer`
- **Expiry:** `expiry_datetime`, `expiry_destination`

## Troubleshooting

### "Could not connect to MCP server"

- Check that your API key and Workspace ID are correct
- Ensure you have Node.js installed (v18 or later)
- Try running `npx linkly-mcp-server` in a terminal to see any errors

### "Authentication failed"

- Verify your API key in the Linkly dashboard at Settings → API
- Make sure there are no extra spaces in your credentials

### Tools not appearing

- Restart Claude Desktop after saving the configuration
- Check that the JSON syntax in your config file is valid

## Need Help?

- [Linkly Documentation](https://docs.linklyhq.com)
- [Linkly Support](mailto:support@linklyhq.com)
- [MCP Server GitHub](https://github.com/Linkly-HQ/linkly-mcp-server)
