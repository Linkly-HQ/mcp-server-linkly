# Using Linkly with ChatGPT

This guide shows you how to create a Custom GPT that connects to your Linkly account, allowing you to create and manage short links directly through ChatGPT conversations.

## What You Can Do

Once connected, you can ask ChatGPT to:

- **Create short links** - "Create a short link for https://example.com"
- **Track performance** - "How many clicks did my links get this week?"
- **Manage links** - "Update the link called 'promo' with a new destination"
- **View analytics** - "Show me clicks by country for the last 30 days"
- **Search links** - "Find all links related to the product launch"

## Setup Instructions

### Step 1: Get Your API Credentials

1. Log in to your [Linkly dashboard](https://app.linklyhq.com)
2. Go to **Settings → API**
3. Copy your **API Key** and **Workspace ID** — you'll need these later

### Step 2: Create a Custom GPT

1. Go to [ChatGPT](https://chat.openai.com)
2. Click your profile icon → **My GPTs** → **Create a GPT**
3. In the **Configure** tab, set up your GPT:

**Name:** Linkly Link Manager (or your preferred name)

**Description:** Creates and manages short links using Linkly. Can create branded links, track clicks, view analytics, and more.

**Instructions:**
```
You are a helpful assistant that manages short links using Linkly. You can:
- Create new short links with custom slugs, UTM parameters, and tracking pixels
- List and search existing links
- View click analytics and statistics
- Update or delete links

When creating links, always confirm the short URL was created and provide it to the user.
When showing analytics, format numbers clearly and summarize key insights.
Always use the user's workspace via the API credentials configured in the actions.
```

### Step 3: Add Actions

1. Scroll down to **Actions** and click **Create new action**
2. For the **Authentication** section:
   - Select **API Key**
   - Auth Type: **Custom**
   - Custom Header Name: `X-API-KEY`
   - API Key: Paste your Linkly API key
3. Paste the following OpenAPI schema:

```yaml
openapi: 3.1.0
info:
  title: Linkly API
  description: API for managing short links, analytics, and domains
  version: 1.0.0
servers:
  - url: https://app.linklyhq.com

paths:
  /api/v1/workspace/{workspace_id}/links:
    post:
      operationId: createOrUpdateLink
      summary: Create a new short link or update an existing one
      parameters:
        - name: workspace_id
          in: path
          required: true
          schema:
            type: string
        - name: X-WORKSPACE-ID
          in: header
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - url
              properties:
                id:
                  type: integer
                  description: Link ID (include to update existing link)
                url:
                  type: string
                  description: The destination URL
                name:
                  type: string
                  description: Nickname for the link
                note:
                  type: string
                  description: Private note about this link
                domain:
                  type: string
                  description: Custom domain (without trailing /)
                slug:
                  type: string
                  description: Custom slug (must start with /)
                enabled:
                  type: boolean
                  description: Whether the link is active
                utm_source:
                  type: string
                utm_medium:
                  type: string
                utm_campaign:
                  type: string
                utm_term:
                  type: string
                utm_content:
                  type: string
                og_title:
                  type: string
                  description: Open Graph title for social previews
                og_description:
                  type: string
                  description: Open Graph description
                og_image:
                  type: string
                  description: Open Graph image URL
                fb_pixel_id:
                  type: string
                  description: Meta/Facebook Pixel ID
                ga4_tag_id:
                  type: string
                  description: Google Analytics 4 tag ID
                gtm_id:
                  type: string
                  description: Google Tag Manager ID
                cloaking:
                  type: boolean
                  description: Hide destination URL in iframe
                forward_params:
                  type: boolean
                  description: Forward URL parameters
                block_bots:
                  type: boolean
                  description: Block bots and spiders
                hide_referrer:
                  type: boolean
                  description: Hide referrer information
                expiry_datetime:
                  type: string
                  description: Expiry datetime (ISO 8601)
                expiry_destination:
                  type: string
                  description: Fallback URL after expiry
      responses:
        '200':
          description: Link created or updated successfully

  /api/v1/workspace/{workspace_id}/links/{link_id}:
    delete:
      operationId: deleteLink
      summary: Delete a link
      parameters:
        - name: workspace_id
          in: path
          required: true
          schema:
            type: string
        - name: link_id
          in: path
          required: true
          schema:
            type: integer
        - name: X-WORKSPACE-ID
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Link deleted

  /api/v1/get_link/{link_id}:
    get:
      operationId: getLink
      summary: Get details of a specific link
      parameters:
        - name: link_id
          in: path
          required: true
          schema:
            type: integer
        - name: X-WORKSPACE-ID
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Link details

  /api/v1/workspace/{workspace_id}/links/export:
    get:
      operationId: listLinks
      summary: List all links in the workspace
      parameters:
        - name: workspace_id
          in: path
          required: true
          schema:
            type: string
        - name: X-WORKSPACE-ID
          in: header
          required: true
          schema:
            type: string
        - name: search
          in: query
          schema:
            type: string
          description: Search query to filter links
      responses:
        '200':
          description: List of links

  /api/v1/workspace/{workspace_id}/clicks/export:
    get:
      operationId: getClicks
      summary: Get recent click data
      parameters:
        - name: workspace_id
          in: path
          required: true
          schema:
            type: string
        - name: X-WORKSPACE-ID
          in: header
          required: true
          schema:
            type: string
        - name: link_id
          in: query
          schema:
            type: integer
          description: Filter by link ID
        - name: format
          in: query
          schema:
            type: string
            default: json
          description: Response format (json or csv)
      responses:
        '200':
          description: Recent clicks

  /api/v1/workspace/{workspace_id}/clicks:
    get:
      operationId: getAnalytics
      summary: Get time-series click analytics
      parameters:
        - name: workspace_id
          in: path
          required: true
          schema:
            type: string
        - name: X-WORKSPACE-ID
          in: header
          required: true
          schema:
            type: string
        - name: start
          in: query
          schema:
            type: string
          description: Start date (YYYY-MM-DD)
        - name: end
          in: query
          schema:
            type: string
          description: End date (YYYY-MM-DD)
        - name: link_id
          in: query
          schema:
            type: integer
          description: Filter by link ID
        - name: frequency
          in: query
          schema:
            type: string
            enum: [day, hour]
          description: Time granularity
        - name: country
          in: query
          schema:
            type: string
          description: Filter by country code
        - name: platform
          in: query
          schema:
            type: string
          description: Filter by platform
        - name: unique
          in: query
          schema:
            type: boolean
          description: Count unique clicks only
        - name: bots
          in: query
          schema:
            type: string
            enum: [include, exclude, only]
          description: Bot filtering
      responses:
        '200':
          description: Analytics data

  /api/v1/workspace/{workspace_id}/clicks/counters/{counter}:
    get:
      operationId: getAnalyticsBy
      summary: Get click counts grouped by dimension
      parameters:
        - name: workspace_id
          in: path
          required: true
          schema:
            type: string
        - name: counter
          in: path
          required: true
          schema:
            type: string
            enum: [country, platform, browser_name, referer, isp, link_id, destination, bot_name]
          description: Dimension to group by
        - name: X-WORKSPACE-ID
          in: header
          required: true
          schema:
            type: string
        - name: start
          in: query
          schema:
            type: string
        - name: end
          in: query
          schema:
            type: string
        - name: link_id
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Grouped analytics

  /api/v1/workspace/{workspace_id}/domains:
    get:
      operationId: listDomains
      summary: List custom domains
      parameters:
        - name: workspace_id
          in: path
          required: true
          schema:
            type: string
        - name: X-WORKSPACE-ID
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of domains
```

4. Click **Test** to verify the connection works
5. Click **Save** in the top right

### Step 4: Configure Your Credentials in the GPT

After adding the action, you need to tell your GPT your workspace ID. Add this to the end of your GPT's **Instructions**:

```
IMPORTANT: When making API calls, always use workspace_id: "YOUR_WORKSPACE_ID_HERE" and api_key: "YOUR_API_KEY_HERE" in request bodies, and include X-WORKSPACE-ID: "YOUR_WORKSPACE_ID_HERE" in headers.
```

Replace `YOUR_WORKSPACE_ID_HERE` and `YOUR_API_KEY_HERE` with your actual credentials from Step 1.

### Step 5: Test Your GPT

Click **Preview** and try asking:
- "List my links"
- "Create a short link for https://example.com"
- "Show me my click analytics for the last 7 days"

## Example Conversations

### Creating a Link

> **You:** Create a short link for https://example.com/summer-sale with UTM source "twitter" and name it "Summer Promo"
>
> **ChatGPT:** I've created your short link:
> - **Short URL:** https://link.ly/abc123
> - **Name:** Summer Promo
> - **Destination:** https://example.com/summer-sale?utm_source=twitter

### Checking Analytics

> **You:** How many clicks did I get this week broken down by country?
>
> **ChatGPT:** Here's your click breakdown by country for the last 7 days:
> - United States: 1,234 clicks
> - United Kingdom: 567 clicks
> - Germany: 234 clicks
> - Canada: 189 clicks

### Searching Links

> **You:** Find all links related to "product launch"
>
> **ChatGPT:** I found 3 links matching "product launch":
> 1. **Product Launch Email** - https://link.ly/launch1 (2,345 clicks)
> 2. **Launch Day Twitter** - https://link.ly/launch2 (1,234 clicks)
> 3. **Launch Press Release** - https://link.ly/launch3 (567 clicks)

## Available Actions

| Action | Description |
|--------|-------------|
| `createOrUpdateLink` | Create a new short link or update an existing one (include `id` to update) |
| `getLink` | Get details of a specific link |
| `deleteLink` | Delete a link |
| `listLinks` | List all links in your workspace (with optional search) |
| `getClicks` | Get recent click data |
| `getAnalytics` | Get time-series click data for charts |
| `getAnalyticsBy` | Get clicks grouped by country, browser, platform, etc. |
| `listDomains` | List your custom domains |

## Link Creation Options

When creating links, you can specify:

- **Basic:** `url`, `name`, `note`, `domain`, `slug`, `enabled`
- **UTM Parameters:** `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- **Open Graph:** `og_title`, `og_description`, `og_image`
- **Tracking:** `fb_pixel_id`, `ga4_tag_id`, `gtm_id`
- **Advanced:** `cloaking`, `forward_params`, `block_bots`, `hide_referrer`
- **Expiry:** `expiry_datetime`, `expiry_destination`

## Troubleshooting

### "Authentication failed" or "Unauthorized"

- Double-check your API key in the Linkly dashboard at **Settings → API**
- Make sure the API key is entered correctly in the Action's authentication settings
- Verify there are no extra spaces in your credentials

### Actions not working

- Test each action individually using the **Test** button in the GPT editor
- Check that your workspace ID is included in the request
- Verify the OpenAPI schema was pasted correctly

### GPT not using the correct workspace

- Make sure your workspace ID is in the GPT's instructions
- Try being explicit: "Use my Linkly workspace to create a link for..."

## Privacy & Security

- Your API credentials are stored securely in your Custom GPT configuration
- Only you (and anyone you share the GPT with) can access your Linkly account
- Consider creating a GPT just for yourself if you don't want to share access
- You can revoke API keys anytime from the Linkly dashboard

## Need Help?

- [Linkly Documentation](https://docs.linklyhq.com)
- [Linkly Support](mailto:support@linklyhq.com)
- [OpenAI Custom GPT Guide](https://help.openai.com/en/articles/8554397-creating-a-gpt)
