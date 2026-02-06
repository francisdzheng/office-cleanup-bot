/**
 * Office Cleaning Group Assignment Engine
 * Headless version of the existing shuffler logic.
 * Takes a roster + absentees → returns group assignments.
 */

// Fisher–Yates shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Predefined groups with all constraints
const PREDEFINED_GROUPS = [
  { name: '床全般・Floor・Team A', count: 3, priority: 1, isFloor: true },
  { name: '床全般・Floor・Team B', count: 3, priority: 2, isFloor: true },
  { name: '床全般・Floor・Team C', count: 3, priority: 3, isFloor: true },
  { name: 'ゴミ出し・Taking out trash X', count: 2, priority: 4 },
  { name: 'ゴミ出し・Taking out trash Y', count: 2, priority: 5 },
  { name: 'ゴミ出し・Taking out trash Additional', count: 1, priority: 6 },
  { name: 'フリースペース机・Freespace Desk', count: 1, priority: 7 },
  { name: '会議室 Interactive・Meeting Room Interactive', count: 1, priority: 8 },
  { name: '会議室 Honest・Meeting Room Honest', count: 1, priority: 9 },
  { name: 'パントリーエリア（冷蔵庫内含む）・Pantry Area (incl. fridge)', count: 2, priority: 10 },
  { name: '電話ブース・Call Booths', count: 1, priority: 11 },
  { name: '会議室 Beyond Boundaries・Meeting Room Beyond Boundaries', count: 1, priority: 12 },
  { name: '会議室 Agile・Meeting Room Agile', count: 1, priority: 13 },
  {
    name: 'お手洗い (男）・Restroom (Men)',
    count: 1,
    priority: 14,
    excludedForMen: ['Kanata', 'Kuroki', 'Bee', 'Marina', 'Chiaki', 'Mio', 'Michelle', 'Mia'],
  },
  {
    name: 'お手洗い (女）・Restroom (Women)',
    count: 2,
    priority: 15,
    restrictedTo: ['Kanata', 'Kuroki', 'Bee', 'Marina', 'Chiaki', 'Mio', 'Michelle', 'Mia'],
  },
  { name: 'Entrance・玄関', count: 1, priority: 16 },
];

/**
 * Strip existing markers from a name.
 */
function stripMarkers(name) {
  return name
    .replace(/\s*(\(v\)|\(w\))\s*$/i, '')
    .replace(/\s*\((x|y),\s*(set|collect)\)\s*$/i, '')
    .replace(/\s*\(collect\s+all\)\s*$/i, '')
    .replace(/\s*\(bottle[\/&]can[^)]*\)\s*$/i, '')
    .replace(/\s*\(duplicate\)\s*$/i, '')
    .trim();
}

/**
 * Main assignment function.
 * @param {string[]} roster - Full list of eligible names
 * @param {string[]} absentees - Names of people who are absent today
 * @returns {{ groups: Array<{name: string, members: string[], priority: number}>, absentList: string[] }}
 */
function assignGroups(roster, absentees = []) {
  // Clean and deduplicate roster
  const seen = new Set();
  const cleanRoster = [];
  const duplicates = [];

  for (const raw of roster) {
    const name = stripMarkers(raw.trim());
    if (!name) continue;
    const lc = name.toLowerCase();
    if (!seen.has(lc)) {
      seen.add(lc);
      cleanRoster.push(name);
    } else {
      duplicates.push(name);
    }
  }

  // Remove absentees (case-insensitive)
  const absentSet = new Set(absentees.map(a => a.trim().toLowerCase()));
  const present = cleanRoster.filter(n => !absentSet.has(n.toLowerCase()));
  const confirmedAbsent = cleanRoster.filter(n => absentSet.has(n.toLowerCase()));

  // Shuffle
  const shuffled = shuffleArray(present);
  let remaining = [...shuffled];
  const output = [];

  // 1) Men's restroom (exclude certain people)
  for (const g of PREDEFINED_GROUPS.filter(g => g.excludedForMen)) {
    const grp = { name: g.name, members: [], priority: g.priority };
    const excluded = new Set(g.excludedForMen.map(n => n.toLowerCase()));
    const eligible = remaining
      .map((n, i) => ({ name: n, idx: i }))
      .filter(e => !excluded.has(e.name.toLowerCase()));

    const selected = eligible.slice(0, g.count);
    selected.forEach(e => grp.members.push(e.name));
    // Remove from remaining (reverse order to preserve indices)
    selected
      .sort((a, b) => b.idx - a.idx)
      .forEach(e => remaining.splice(e.idx, 1));
    output.push(grp);
  }

  // 2) Women's restroom (restricted to certain people)
  for (const g of PREDEFINED_GROUPS.filter(g => g.restrictedTo)) {
    const grp = { name: g.name, members: [], priority: g.priority };
    const allowed = new Set(g.restrictedTo.map(n => n.toLowerCase()));
    const eligible = remaining
      .map((n, i) => ({ name: n, idx: i }))
      .filter(e => allowed.has(e.name.toLowerCase()));

    const selected = eligible.slice(0, g.count);
    selected.forEach(e => grp.members.push(e.name));
    selected
      .sort((a, b) => b.idx - a.idx)
      .forEach(e => remaining.splice(e.idx, 1));
    output.push(grp);
  }

  // 3) All other groups in priority order
  const otherGroups = PREDEFINED_GROUPS.filter(g => !g.restrictedTo && !g.excludedForMen).sort(
    (a, b) => a.priority - b.priority
  );

  for (const g of otherGroups) {
    const grp = { name: g.name, members: [], priority: g.priority };
    for (let i = 0; i < g.count && remaining.length > 0; i++) {
      let nm = remaining.shift();

      // Trash markers
      if (g.name.startsWith('ゴミ出し・Taking out trash')) {
        if (g.name.endsWith(' X') || g.name.endsWith(' Y')) {
          nm += grp.members.length === 0 ? ' (collect)' : ' (set)';
        } else {
          nm += ' (bottle&can)';
        }
      }

      // Floor markers: first person (v), rest (w)
      if (g.isFloor) {
        nm += grp.members.length === 0 ? ' (v)' : ' (w)';
      }

      grp.members.push(nm);
    }
    output.push(grp);
  }

  // Not Assigned
  const notAssigned = { name: 'Not Assigned', members: [], priority: 999 };
  remaining.forEach(n => notAssigned.members.push(n));
  duplicates.forEach(n => notAssigned.members.push(`${n} (duplicate)`));
  output.push(notAssigned);

  return {
    groups: output.sort((a, b) => a.priority - b.priority),
    absentList: confirmedAbsent,
  };
}

module.exports = { assignGroups, PREDEFINED_GROUPS };
