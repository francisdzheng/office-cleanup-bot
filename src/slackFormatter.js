/**
 * Slack Message Formatter
 * Converts group assignments into formatted Slack messages.
 */

/**
 * Format assignments as a Slack mrkdwn message.
 * @param {{ groups: Array<{name: string, members: string[]}>, absentList: string[] }} result
 * @returns {string} Slack mrkdwn formatted string
 */
function formatAsText(result) {
  const { groups, absentList } = result;
  const today = new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  let text = `🧹 *お掃除当番 / Cleaning Duty — ${today}*\n\n`;

  for (const g of groups) {
    if (g.name === 'Not Assigned' && g.members.length === 0) continue;

    const emoji = getGroupEmoji(g.name);
    text += `${emoji} *${g.name}*\n`;

    if (g.members.length === 0) {
      text += `　　_（人数不足 / not enough people）_\n`;
    } else {
      for (const m of g.members) {
        text += `　　• ${m}\n`;
      }
    }
    text += '\n';
  }

  if (absentList.length > 0) {
    text += `🏠 *本日お休み / Absent Today:* ${absentList.join(', ')}\n`;
  }

  return text;
}

/**
 * Format as Slack Block Kit blocks for richer display.
 */
function formatAsBlocks(result) {
  const { groups, absentList } = result;
  const today = new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🧹 お掃除当番 / Cleaning Duty — ${today}`, emoji: true },
    },
    { type: 'divider' },
  ];

  for (const g of groups) {
    if (g.name === 'Not Assigned' && g.members.length === 0) continue;

    const emoji = getGroupEmoji(g.name);
    const memberList =
      g.members.length > 0
        ? g.members.map(m => `• ${m}`).join('\n')
        : '_（人数不足 / not enough people）_';

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *${g.name}*\n${memberList}`,
      },
    });
  }

  if (absentList.length > 0) {
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `🏠 *本日お休み / Absent:* ${absentList.join(', ')}`,
        },
      ],
    });
  }

  return blocks;
}

function getGroupEmoji(name) {
  if (name.includes('Floor')) return '🧹';
  if (name.includes('trash') || name.includes('ゴミ')) return '🗑️';
  if (name.includes('Freespace') || name.includes('フリースペース')) return '🪑';
  if (name.includes('Meeting') || name.includes('会議室')) return '🚪';
  if (name.includes('Pantry') || name.includes('パントリー')) return '🍳';
  if (name.includes('Call') || name.includes('電話')) return '📞';
  if (name.includes('Restroom') || name.includes('お手洗い')) return '🚻';
  if (name.includes('Entrance') || name.includes('玄関')) return '🚪';
  if (name.includes('Not Assigned')) return '⚠️';
  return '📋';
}

module.exports = { formatAsText, formatAsBlocks };
