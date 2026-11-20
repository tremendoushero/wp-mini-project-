// api/index.js
// Purpose: Vercel Serverless Function entry point for the Express backend
// Vercel routes incoming /api requests to this handler function.

const app = require('../backend/server');

module.exports = app;
