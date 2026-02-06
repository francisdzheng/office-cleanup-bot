/**
 * Office Cleaning Rotation — Main Script
 *
 * This is the entry point. It:
 * 1. Reads today's absences from Slack (if ABSENCE_CHANNEL_ID is set)
 * 2. Generates group assignments
 * 3. Posts the result to the destination Slack channel
 *
 * Environment variables (set as GitHub Secrets):
 *   SLACK_BOT_TOKEN        - Bot token (xoxb-...)
 *   SLACK_POST_CHANNEL_ID  - Channel to post assignments to
 *   SLACK_ABSENCE_CHANNEL_ID - Channel where people post absences (optional)
 */

const { WebClient } = require('@slack/web-api');
const { assignGroups } = require('./assignGroups');
const { detectAbsentees } = require('./absenceDetector');
const { formatAsText, formatAsBlocks } = require('./slackFormatter');
const { ROSTER, USER_ID_TO_NAME } = require('./roster');

async function main() {
  const token = process.env.SLACK_BOT_TOKEN;
  const postChannelId = process.env.SLACK_POST_CHANNEL_ID;
  const absenceChannelId = process.env.SLACK_ABSENCE_CHANNEL_ID;

  if (!token) {
    console.error('❌ SLACK_BOT_TOKEN is not set');
    process.exit(1);
  }
  if (!postChannelId) {
    console.error('❌ SLACK_POST_CHANNEL_ID is not set');
    process.exit(1);
  }

  const slack = new WebClient(token);

  // Step 1: Detect absences
  let absentees = [];

  if (absenceChannelId && USER_ID_TO_NAME.size > 0) {
    console.log('📡 Reading absence channel...');
    try {
      absentees = await detectAbsentees(slack, absenceChannelId, USER_ID_TO_NAME);
      console.log(`🏠 Detected absentees: ${absentees.length > 0 ? absentees.join(', ') : 'none'}`);
    } catch (err) {
      console.warn(`⚠️ Could not read absence channel: ${err.message}`);
      console.warn('Proceeding without absence detection.');
    }
  } else {
    console.log('ℹ️ Absence detection skipped (SLACK_ABSENCE_CHANNEL_ID not set or USER_ID_TO_NAME empty)');
  }

  // Step 2: Generate assignments
  console.log(`👥 Roster: ${ROSTER.length} people, ${absentees.length} absent`);
  const result = assignGroups(ROSTER, absentees);

  // Step 3: Format and post to Slack
  const text = formatAsText(result);
  const blocks = formatAsBlocks(result);

  console.log('\n📋 Assignment preview:\n');
  console.log(text);

  try {
    await slack.chat.postMessage({
      channel: postChannelId,
      text, // Fallback for notifications
      blocks,
      unfurl_links: false,
      unfurl_media: false,
    });
    console.log('✅ Posted to Slack successfully!');
  } catch (err) {
    console.error(`❌ Failed to post to Slack: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
