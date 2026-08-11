'use strict';

/**
 * Score a classified listing 0-100.
 * Returns the listing with .score and .status set.
 *
 * @param {object} listing
 * @param {object} config   pipeline.config.json scoring block
 * @returns {object}
 */
function scoreAndTag(listing, config) {
  const w   = config.weights;
  const src = config.sourceReliabilityScores || {};
  let score = 0;

  // 1. Has a working-looking URL
  if (listing.website_url && listing.website_url.startsWith('http')) {
    score += w.hasWorkingUrl || 30;
  }

  // 2. Has a meaningful description
  const descLen = (listing.short_description || '').length;
  if (descLen >= (config.minDescriptionLength || 40)) {
    score += w.hasDescription || 20;
  } else if (descLen > 10) {
    score += Math.floor(((w.hasDescription || 20) * descLen) / (config.minDescriptionLength || 40));
  }

  // 3. Has a logo
  if (listing.logo_url) score += w.hasLogo || 10;

  // 4. Has a pricing model
  if (listing.pricing_model) score += w.hasPricing || 10;

  // 5. Has tags
  if (listing.tags && listing.tags.length >= 2) score += w.hasTags || 10;

  // 6. Source reliability multiplier
  const reliability = src[listing.source] || 0.7;
  const sourceBonus = Math.round((w.sourceReliability || 20) * reliability);
  score += sourceBonus;

  score = Math.min(100, Math.max(0, score));

  const threshold = config.autoPublishThreshold || 70;
  const status = score >= threshold ? 'auto_published' : 'pending_review';

  return { ...listing, score, status };
}

/**
 * Score an array of listings.
 */
function scoreBatch(listings, config) {
  return listings.map(l => scoreAndTag(l, config));
}

module.exports = { scoreBatch, scoreAndTag };