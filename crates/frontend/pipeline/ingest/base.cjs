'use strict';

/**
 * RawTool — the normalized shape every ingest source must produce.
 * @typedef {Object} RawTool
 * @property {string}  name
 * @property {string}  [description]
 * @property {string}  [website_url]
 * @property {string}  [logo_url]
 * @property {string}  source       — source identifier e.g. 'producthunt'
 * @property {string}  [source_url] — link to the source page/post
 * @property {string}  [launch_date] — ISO date string
 * @property {string[]} [tags]
 * @property {string}  [pricing]    — raw pricing hint e.g. 'free', 'paid'
 * @property {object}  [raw]        — original source payload (for debugging)
 */

/**
 * BaseSource — abstract base every ingest module inherits from.
 * Subclasses must implement fetchLatest().
 */
class BaseSource {
  constructor(name, config) {
    this.name   = name;
    this.config = config || {};
  }

  /** @returns {Promise<RawTool[]>} */
  async fetchLatest() {
    throw new Error('fetchLatest() not implemented in ' + this.name);
  }

  /** Wrap fetchLatest with retry logic */
  async fetchWithRetry(retries = 3, delayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const results = await this.fetchLatest();
        console.log('[' + this.name + '] Fetched ' + results.length + ' raw items.');
        return results;
      } catch (err) {
        console.error('[' + this.name + '] Attempt ' + attempt + '/' + retries + ' failed: ' + err.message);
        if (attempt < retries) await new Promise(r => setTimeout(r, delayMs * attempt));
      }
    }
    console.error('[' + this.name + '] All retries exhausted — skipping source.');
    return [];
  }
}

module.exports = { BaseSource };
