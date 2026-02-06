/**
 * Local test — run with: node src/test.js
 * Tests the assignment logic without needing Slack credentials.
 */

const { assignGroups } = require('./assignGroups');
const { formatAsText } = require('./slackFormatter');
const { classifyMessage } = require('./absenceDetector');
const { ROSTER } = require('./roster');

console.log('=== Test 1: Full roster, no absentees ===\n');
const result1 = assignGroups(ROSTER);
console.log(formatAsText(result1));

console.log('\n=== Test 2: With 5 absentees ===\n');
const result2 = assignGroups(ROSTER, ['Miho', 'Rory', 'Kanata', 'Bee', 'Kyle']);
console.log(formatAsText(result2));

console.log('\n=== Test 3: Absence keyword detection ===\n');
const testMessages = [
  'お休みします',
  '今日は休みです',
  '在宅勤務です',
  'WFH today',
  'I\'ll be out sick',
  'Running late, will be in by 11',
  '遅れます、すみません',
  '午後から出社します',
  'Good morning everyone!',
  'Has anyone seen the meeting notes?',
  '有給取ります',
  'taking a day off',
  'テレワークします',
];

for (const msg of testMessages) {
  const cls = classifyMessage(msg);
  const icon = cls === 'absent' ? '🏠' : cls === 'late' ? '⏰' : '✅';
  console.log(`  ${icon} [${cls.padEnd(6)}] "${msg}"`);
}

console.log('\n=== Test 4: Restroom constraint check ===\n');
const result3 = assignGroups(ROSTER);
const menRoom = result3.groups.find(g => g.name.includes('Restroom (Men)'));
const womenRoom = result3.groups.find(g => g.name.includes('Restroom (Women)'));
const restricted = ['kanata', 'kuroki', 'bee', 'marina', 'chiaki', 'mio', 'michelle', 'mia'];

if (menRoom) {
  const menOk = menRoom.members.every(m => !restricted.includes(m.toLowerCase()));
  console.log(`  Men's restroom: ${menRoom.members.join(', ')} — ${menOk ? '✅ OK' : '❌ VIOLATION'}`);
}
if (womenRoom) {
  const womenOk = womenRoom.members.every(m => restricted.includes(m.toLowerCase()));
  console.log(`  Women's restroom: ${womenRoom.members.join(', ')} — ${womenOk ? '✅ OK' : '❌ VIOLATION'}`);
}

console.log('\n✅ All tests complete.\n');
