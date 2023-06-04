const express = require('express');
const router = express.Router();
const db = require('../db');

// Handler for '/totals' endpoint
router.get('/', (req, res) => {
  const totalGateways = db.gateways.length;
  const totalDevices = db.devices.length;

  res.json({ totalGateways, totalDevices });
});

module.exports = router;

// URLs
// http://localhost:3001/totals
