/**
 * Absence Detection Module
 * Reads messages from a Slack channel and determines who is absent today
 * using rules-based keyword matching (no LLM needed).
 */

// Keywords that indicate someone is absent (Japanese + English)
const ABSENT_KEYWORDS = [
  // Japanese
  'お休み', '休み', '休暇', '欠勤', '有給', '有休', '休む', '休みます',
  '不在', '出社しません', '出社できません', 'テレワーク', '在宅勤務',
  '在宅', 'リモート', 'リモートワーク', '体調不良', '病欠',
  // English
  'off today', 'day off', 'taking off', 'absent', 'sick', 'wfh',
  'work from home', 'working from home', 'remote', 'not coming in',
  'won\'t be in', 'out today', 'out sick', 'leave', 'pto', 'vacation',
  'holiday', 'not in office', 'not in the office',
];

// Keywords that indicate "late but coming" — these people should NOT be excluded
const LATE_BUT_COMING_KEYWORDS = [
  '遅刻', '遅れます', '遅れ', '午後から', '午後出社',
  'running late', 'be late', 'coming late', 'in late', 'after lunch',
];

/**
 * Check if a message indicates absence.
 * @param {string} text - Message text
 * @returns {'absent' | 'late' | 'none'}
 */
function classifyMessage(text) {
  const lower = text.toLowerCase();

  // Check "late but coming" first (higher priority — don't exclude them)
  for (const kw of LATE_BUT_COMING_KEYWORDS) {
    if (lower.includes(kw)) return 'late';
  }

  // Check absence keywords
  for (const kw of ABSENT_KEYWORDS) {
    if (lower.includes(kw)) return 'absent';
  }

  return 'none';
}

/**
 * Fetch today's messages from a Slack channel and identify absentees.
 * @param {import('@slack/web-api').WebClient} slackClient
 * @param {string} channelId - The absence channel ID
 * @param {Map<string, string>} userIdToName - Map of Slack user ID → display name
 * @returns {Promise<string[]>} List of absent display names
 */
async function detectAbsentees(slackClient, channelId, userIdToName) {
  // Get start of today (JST = UTC+9)
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffset);
  const jstMidnight = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate());
  const utcMidnightJST = new Date(jstMidnight.getTime() - jstOffset);
  const oldest = Math.floor(utcMidnightJST.getTime() / 1000).toString();

  let allMessages = [];
  let cursor;

  do {
    const result = await slackClient.conversations.history({
      channel: channelId,
      oldest,
      limit: 200,
      cursor,
    });
    allMessages = allMessages.concat(result.messages || []);
    cursor = result.response_metadata?.next_cursor;
  } while (cursor);

  const absentees = new Set();

  for (const msg of allMessages) {
    const text = msg.text || '';
    const userId = msg.user;
    const classification = classifyMessage(text);

    if (classification === 'absent' && userId && userIdToName.has(userId)) {
      absentees.add(userIdToName.get(userId));
    }
  }

  return [...absentees];
}

module.exports = { detectAbsentees, classifyMessage };
