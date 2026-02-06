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
  ['U0A4FL5QD29', 'Francis'],
  ['U090X3J58KT', 'Miho'],
  ['U046E19K6E7', 'fortkle'],
  ['U077P1CKQ73', 'Rory'],
  ['U04ERHD8R2P', 'chikitam'],
  ['U05QM3HTNDT', 'mio'],
  ['U08MNDQSPQ8', 'yuki'],
  ['U04RESHBGH0', 'Neko'],
  ['U01AYBXHPLP', 'Ramen'],
  ['U072NBJEDK3', 'Akihiro'],
  ['U0ABPSEHV9D', 'Takeo'],
  ['U06D1LRS5B4', 'Kei'],
  ['U09L5FE1C1G', 'Shabliss'],
  ['U069HCGMZ8S', 'Tai'],
  ['U096ERTUWF4', 'Rio'],
  ['U079ESLHRU0', 'Tao'],
  ['U08AB2961ND', 'kimuson'],
  ['U05LB7P0WQ2', 'Syori'],
  ['U0857G8MN8K', 'chui'],
  ['U0624E5TQQM', 'Yume'],
  ['U07K4ESCT6C', 'Rola'],
  ['U0A3XCT5M28', 'Pon'],
  ['U06UXSEC404', 'Apippo'],
  ['U01GA8KR47L', 'ESD'],
  ['U079G4KCBDH', 'Kyle'],
  ['U09G7D2I3K3', 'Kuroki'],
  ['U07CXVAVCBZ', 'Kanata'],
  ['U093BMT9P0A', 'Mohnya'],
  ['U07LLQWSZHS', 'Davide'],
  ['U01BA1H9S5B', 'Cap'],
]);

module.exports = { ROSTER, USER_ID_TO_NAME };
