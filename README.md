# 🧹 Office Cleaning Rotation Automation

Automated office cleaning duty assignment with Slack integration. Runs on Mon/Wed/Fri via GitHub Actions — zero manual work.

## What it does

1. **(Optional)** Reads today's "I'm off" messages from a Slack absence channel
2. Shuffles the roster and assigns people to cleaning groups (same logic as the existing web shuffler)
3. Posts the formatted result to your Slack channel

---

## Quick Start

### Step 1: Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. Name it something like `Cleaning Rotation Bot`
4. Select your workspace

### Step 2: Configure Bot Permissions

1. In your app settings, go to **"OAuth & Permissions"** (left sidebar)
2. Scroll to **"Scopes" → "Bot Token Scopes"**
3. Add these scopes:

| Scope | Why |
|---|---|
| `chat:write` | Post messages to channels |
| `channels:history` | Read messages from public absence channel |
| `groups:history` | Read messages from private absence channel (if applicable) |
| `users:read` | Look up user display names (for absence matching) |

### Step 3: Install the App to Your Workspace

1. Go to **"Install App"** (left sidebar)
2. Click **"Install to Workspace"**
3. Authorize the permissions
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)

### Step 4: Invite the Bot to Your Channels

In Slack, go to each channel and type:
```
/invite @Cleaning Rotation Bot
```

You need to invite it to:
- The channel where you want assignments posted (e.g., `#cleaning-duty`)
- The absence channel where people post they're off (e.g., `#attendance` or `#absence`)

### Step 5: Get Channel IDs

For each channel, right-click the channel name → **"View channel details"** → scroll to the bottom → copy the **Channel ID** (starts with `C`).

### Step 6: Set Up the GitHub Repository

1. Create a new **private** repo on GitHub
2. Push this code to it:
   ```bash
   cd cleaning-rotation
   git init
   git add .
   git commit -m "Initial setup"
   git remote add origin https://github.com/YOUR_ORG/cleaning-rotation.git
   git push -u origin main
   ```

### Step 7: Add GitHub Secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|---|---|
| `SLACK_BOT_TOKEN` | `xoxb-your-bot-token-here` |
| `SLACK_POST_CHANNEL_ID` | `C0123456789` (the channel to post assignments) |
| `SLACK_ABSENCE_CHANNEL_ID` | `C9876543210` (the absence channel — optional) |

### Step 8: Configure the Roster

Edit `src/roster.js`:

1. Update the `ROSTER` array with your team members' names
2. Fill in `USER_ID_TO_NAME` with Slack user IDs mapped to roster names

To get Slack user IDs:
- Click someone's profile in Slack → click "⋮" → **"Copy member ID"**
- Or run the script: `node scripts/get-slack-users.js` (after setting SLACK_BOT_TOKEN)

### Step 9: Test Locally

```bash
npm install
node src/test.js          # Test assignment logic (no Slack needed)
```

To test the full Slack flow:
```bash
export SLACK_BOT_TOKEN=xoxb-your-token
export SLACK_POST_CHANNEL_ID=C0123456789
node src/index.js
```

### Step 10: Test the GitHub Action

1. Go to your repo → **Actions** tab
2. Click **"Office Cleaning Rotation"** in the left sidebar
3. Click **"Run workflow"** → **"Run workflow"**
4. Check that a message appears in your Slack channel

---

## Schedule

The workflow runs automatically:
- **Monday, Wednesday, Friday at 9:00 AM JST**
- (GitHub Actions cron may have 5-15 min delay — this is normal)

To change the schedule, edit `.github/workflows/cleaning-rotation.yml`:
```yaml
schedule:
  - cron: '0 0 * * 1,3,5'  # 00:00 UTC = 09:00 JST
```

---

## How Absence Detection Works

The bot reads today's messages from the absence channel and checks for keywords:

**Marked as ABSENT** (excluded from rotation):
- Japanese: お休み、休み、休暇、有給、在宅、リモート、テレワーク、体調不良 ...
- English: off today, day off, absent, sick, wfh, work from home, remote, pto ...

**Marked as LATE (still included)**:
- Japanese: 遅刻、遅れます、午後から ...
- English: running late, coming late, after lunch ...

**Ignored** (normal messages):
- Everything else

### Absence detection is optional

If you don't set `SLACK_ABSENCE_CHANNEL_ID` or don't fill in `USER_ID_TO_NAME`, the bot will simply use the full roster without filtering.

---

## Files

```
├── .github/workflows/
│   └── cleaning-rotation.yml    # GitHub Actions schedule
├── src/
│   ├── index.js                 # Main entry point
│   ├── assignGroups.js          # Assignment engine (core logic)
│   ├── absenceDetector.js       # Slack absence detection
│   ├── slackFormatter.js        # Slack message formatting
│   ├── roster.js                # Team roster config
│   └── test.js                  # Local test script
├── package.json
└── README.md
```

---

## Troubleshooting

**"not_in_channel" error**: The bot isn't in the target channel. Run `/invite @Cleaning Rotation Bot` in Slack.

**"channel_not_found" error**: Double-check the channel ID. Make sure you're using the Channel ID (C...), not the channel name.

**"invalid_auth" error**: The bot token is wrong or expired. Regenerate it in the Slack app settings.

**Assignments look wrong**: Run `node src/test.js` locally to verify the assignment logic.

**Action doesn't run**: Check the Actions tab for errors. Make sure secrets are set correctly (no trailing spaces/newlines).
