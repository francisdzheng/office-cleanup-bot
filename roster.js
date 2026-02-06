/**
 * Roster Configuration
 *
 * INSTRUCTIONS:
 * 1. Replace the roster names below with your actual team members.
 * 2. For USER_ID_TO_NAME, you'll need each person's Slack user ID.
 *    - In Slack, click on a person's profile → "⋮" → "Copy member ID"
 *    - Or use the Slack API: https://api.slack.com/methods/users.list
 *
 * The roster names MUST match what people use in the shuffler.
 * The USER_ID_TO_NAME map connects Slack user IDs to roster names,
 * so absence detection knows which roster name to exclude.
 */

// Full list of people eligible for cleaning duty
const ROSTER = [
  'Miho',
  'fortkle',
  'Rory',
  'chikitam',
  'Mio',
  'Yuki',
  'francis',
  'Neko',
  'Ramen',
  'Akihiro',
  'takeo',
  'Kei',
  'Shabliss',
  'Tai',
  'Rio',
  'Tao',
  'kimuson',
  'Syori',
  'chui',
  'yume',
  'Rola',
  'Pon',
  'Apippo',
  'ESD',
  'Kyle',
  'Kuroki',
  'kanata',
  'Mohnya',
  'davide',
  'Cap',
  'Bee',
  'Shu',
  'Marina',
  'Ryu',
  'Tanjou',
  'Ugajin',
  'Michelle',
  'Jesse',
  'Kats',
  'Aoba',
  'Chiaki',
  'Mia',
];

// Map: Slack User ID → Roster Name
// Replace 'UXXXXXXXXXX' with actual Slack user IDs
const USER_ID_TO_NAME = new Map([
  // ['U01ABC1234', 'Miho'],
  // ['U01ABC1235', 'fortkle'],
  // ['U01ABC1236', 'Rory'],
  // ... add all team members
]);

module.exports = { ROSTER, USER_ID_TO_NAME };
