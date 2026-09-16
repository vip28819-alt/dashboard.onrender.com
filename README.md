# ProBot-style Discord Bot

A standalone Discord bot with a ProBot-inspired workflow: moderation, automod, welcome messages, logs, warnings, XP profiles and leaderboards, reputation, self-assignable roles, tickets, and utility commands.

## Setup

1. Install Node.js 18.17 or newer.
2. Copy `.env.example` to `.env`.
3. Create a Discord application and bot in the Discord Developer Portal.
4. Put the bot token in `DISCORD_TOKEN` and the application ID in `CLIENT_ID`.
5. Invite the bot with the `bot` and `applications.commands` scopes. Enable these privileged intents in the Developer Portal: **Server Members Intent** and **Message Content Intent**.
6. Install and start:

```powershell
npm install
npm start
```

To stop a bot started with `npm start`, open another terminal in the project folder and run:

```powershell
npm run stop
```

`DEV_GUILD_ID` is optional. The bot registers commands globally and also syncs them directly to every connected server when it starts. When the bot is added to a new server while running, the `guildCreate` handler syncs that server immediately, so slash commands do not need to wait for global propagation. Re-invite the bot using both the `bot` and `applications.commands` scopes if slash commands are missing in a server.

## Server copy and paste

Administrators can preview and copy a server structure with `/copyserver source_server_id:<ID>`. Run it again with `confirm:true` to create missing roles, categories, channels, permissions, and saved bot settings. After a successful copy, `/paste` previews the saved source for that destination server; `/paste confirm:true` repeats the operation. Existing same-named roles and channels are skipped.

## Commands

- `/setup welcome channel:#welcome`
- `/setup logs event:all` or `/log setup` to create a private category with one channel per log event
- `/setup automod enabled:true`
- `/ban`, `/kick`, `/timeout`, `/warn`, `/warnings`, `/clear`
- `/level`, `/profile`, `/rank`, `/leaderboard`, `/top`, `/setxp`, `/setlevel`
- `/rep`, `/selfrole`, `/roll`
- `/ticket`
- `/stop` (Administrator only; gracefully stops the bot process)
- `/about` (bot information and dashboard link), `/help`, `/ping`, `/serverinfo`, `/userinfo`

Settings and XP are stored in `data/guilds.json`, which is created automatically. The dashboard is available at `http://localhost:3000` by default. For public hosting, deploy the service with `DASHBOARD_HOST=0.0.0.0`, set `DASHBOARD_PUBLIC_URL` to the public HTTPS URL, and configure Discord OAuth with `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DISCORD_REDIRECT_URI` set to `${DASHBOARD_PUBLIC_URL}/auth/callback`. Visitors must sign in with Discord; the dashboard only shows servers where the signed-in user has Administrator or Manage Server permission. Configure self-assignable roles in the dashboard, then members can toggle them with `/selfrole role:@Role`.

### Public Render deployment

1. Push this project to a GitHub repository and create a Render **Web Service** from it.
2. Use build command `npm install` and start command `npm start`. The included `render.yaml` can also be used as a Blueprint.
3. In the Discord Developer Portal, open the application, go to **OAuth2**, and add `https://YOUR-SERVICE.onrender.com/auth/callback` as a redirect URI.
4. Add these Render environment variables: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DASHBOARD_PUBLIC_URL`, `DISCORD_REDIRECT_URI`, and `DASHBOARD_HOST=0.0.0.0`.
5. Open the Render URL and choose **Sign in with Discord**. Only authorized server managers can edit that server.

Keep `DISCORD_TOKEN` and `DISCORD_CLIENT_SECRET` private. Render's free service may sleep and its local JSON data is not durable; use a persistent disk or external database before relying on it for production settings.

The dashboard's Tickets module supports multiple independent ticket systems. Each system can have its own category, panel channel, panel button, naming prefix, staff role, welcome/close messages, and enabled state. Existing panels appear as active systems and can be edited and republished without deleting them. New tickets are always parented to their configured ticket category; if that category is missing, the bot repairs the system before creating the ticket. Closing a ticket uploads a transcript containing the ticket messages, authors, timestamps, and attachment URLs to the private `log-ticket-transcript` channel. The Logs module and the dashboard Overview quick setup can create or repair the private log category and all event channels, including ticket transcripts. Moderation audit entries include the moderator and target user.

The bot needs **Manage Messages**, **Moderate Members**, **Kick Members**, **Ban Members**, **Manage Channels**, **Manage Roles**, and **Send Messages** permissions for the related features.
