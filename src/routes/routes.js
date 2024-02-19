const expresss = require('express');
const router = expresss.Router();

// Import individual route handlers
const totalsRouter = require('./totals');
const gatewaysRouter = require('./gateways');
const devicesRouter = require('./devices');

// Register route handlers
// router.use('/', gatewaysRouter);
router.use('/totals', totalsRouter);
router.use('/gateways', gatewaysRouter);
router.use('/devices', devicesRouter);

module.exports = router;