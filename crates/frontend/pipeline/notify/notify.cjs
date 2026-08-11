'use strict';
const axios = require('axios');

/**
 * Send a daily summary digest.
 *
 * Defaults to Discord webhook (DISCORD_WEBHOOK_URL env var).
 * Falls back to logging if no webhook is configured.
 *
 * @param {object} summary
 * @param {number} summary.ingested    total raw items ingested
 * @param {number} summary.unique      after dedup
 * @param {number} summary.autoPublished
 * @param {number} summary.pendingReview
 * @param {number} summary.rejected
 * @param {object[]} summary.highlights   up to 5 new notable listings
 * @param {string[]} summary.errors       source error messages
 */
async function sendDigest(summary) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('[notify] No DISCORD_WEBHOOK_URL set â€” logging digest only.');
    console.log('[notify] Digest:', JSON.stringify(summary, null, 2));
    return;
  }

  const highlights = (summary.highlights || []).slice(0, 5).map((l, i) =>
    (i + 1) + '. **' + l.name + '** (' + (l.category || 'other') + ') â€” ' +
    (l.short_description || '').slice(0, 80) + (l.website_url ? ' Â· <' + l.website_url + '>' : '')
  ).join('\n');

  const errorSection = summary.errors && summary.errors.length
    ? '\n\nâš ï¸ **Source errors:** ' + summary.errors.join(', ')
    : '';

  const embed = {
    title:       'ðŸ¤– BinBag Daily Listing Digest',
    color:       0x00FF41,
    description: [
      'ðŸ“¥ Ingested: **' + summary.ingested + '** raw items',
      'âœ… Unique after dedup: **' + summary.unique + '**',
      'ðŸŸ¢ Auto-published: **' + summary.autoPublished + '**',
      'ðŸŸ¡ Pending review: **' + summary.pendingReview + '**',
      summary.rejected ? 'ðŸ”´ Rejected/dupes: **' + summary.rejected + '**' : null
    ].filter(Boolean).join('\n'),
    fields: highlights ? [{ name: 'ðŸŒŸ Highlights', value: highlights }] : [],
    footer: { text: 'BinBag Auto-Listing Pipeline Â· ' + new Date().toUTCString() }
  };

  if (errorSection) {
    embed.fields.push({ name: 'âš ï¸ Errors', value: summary.errors.join('\n').slice(0, 500) });
  }

  try {
    await axios.post(webhookUrl, { embeds: [embed] }, { timeout: 10000 });
    console.log('[notify] Digest sent to Discord webhook.');
  } catch (err) {
    console.error('[notify] Webhook failed:', err.message);
  }
}

module.exports = { sendDigest };