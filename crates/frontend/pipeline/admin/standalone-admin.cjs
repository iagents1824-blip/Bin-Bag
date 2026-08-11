'use strict';
// Standalone admin server â€” run separately from the main Express server.
// Usage: node pipeline/admin/standalone-admin.cjs
const express    = require('express');
const adminRouter = require('./admin-server.cjs');

const app  = express();
const PORT = process.env.ADMIN_PORT || 3001;

app.use(express.json());
app.use('/admin', adminRouter);

app.listen(PORT, () => {
  console.log('BinBag Admin API running on http://localhost:' + PORT);
  console.log('  GET  /admin/pending-listings  â€” review queue');
  console.log('  GET  /admin/listings          â€” all listings (optional ?status=)');
  console.log('  PATCH /admin/listings/:id     â€” approve/reject { status: ... }');
});