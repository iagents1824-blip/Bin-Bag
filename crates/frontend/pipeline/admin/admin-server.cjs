'use strict';
const express = require('express');
const { getListings, updateStatus } = require('../persist/persist.cjs');

const router = express.Router();

// GET /admin/pending-listings â€” list all pending-review items
router.get('/pending-listings', (req, res) => {
  const items = getListings('pending_review');
  res.json({ count: items.length, items });
});

// GET /admin/listings â€” all listings, optional ?status= filter
router.get('/listings', (req, res) => {
  const { status } = req.query;
  const items = getListings(status || null);
  res.json({ count: items.length, items });
});

// PATCH /admin/listings/:id â€” approve or reject
router.patch('/listings/:id', (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;
  const allowed    = ['auto_published', 'pending_review', 'rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'status must be one of: ' + allowed.join(', ') });
  }
  const updated = updateStatus(id, status);
  if (!updated) return res.status(404).json({ error: 'Listing not found: ' + id });
  res.json({ success: true, listing: updated });
});

module.exports = router;