const express = require('express');
const router = express.Router();

// Import individual route handlers
const totalsRouter = require('./totals');
const gatewaysRouter = require('./gateways');
const devicesRouter = require('./devices');

// Register route handlers
router.use('/totals', totalsRouter);
router.use('/gateways', gatewaysRouter);
router.use('/devices', devicesRouter);

module.exports = router;