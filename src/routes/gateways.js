const express = require('express');
const router = express.Router();
const db = require('../db');

const { v4: uuidv4 } = require('uuid');

function generateUniqueSerialNumber() {
  const prefix = 'GW-';
  const serialNumber = prefix + uuidv4().slice(0, 6);
  return serialNumber;
}


router.get('/', (req, res) => {
    const { sn } = req.query;
    const gateways = db.gateways;

    // Filter gateways by serial number if 'sn' query parameter is present
    const matchedGateways = sn ? gateways.filter(gateway => gateway.serialNumber.includes(sn)) : gateways;

    // Map over the matched gateways to create the response data
    const gatewaysWithDevices = matchedGateways.map(gateway => {
        const devicesInGateway = gateway.devices.map(deviceUID => {
            const device = db.devices.find(device => device.uid === deviceUID);
            return {
                uid: device.uid,
                vendor: device.vendor,
                dateCreated: device.dateCreated,
                status: device.status,
                // matchSearch: device.uid.toString().includes(sn),
            };
        });

        return {
            serialNumber: gateway.serialNumber,
            name: gateway.name,
            ipv4address: gateway.ipv4address,
            offlineDevices: devicesInGateway.filter(device => device.status === 'offline').length || 0,
            onlineDevices: devicesInGateway.filter(device => device.status === 'online').length || 0,
            devices: devicesInGateway,
        };
    });

    res.json({ gateways: gatewaysWithDevices });
});

// Route for exact matching of serialNumber
router.get('/:serialNumber', (req, res) => {
    const { serialNumber } = req.params;

    // Find the gateway object with the matching serial number
    const gateway = db.gateways.find((gateway) => gateway.serialNumber === serialNumber);

    if (gateway) {
        // Create the response object with the same fields as filtering gateways by serial number
        const response = {
            serialNumber: gateway.serialNumber,
            name: gateway.name,
            ipv4address: gateway.ipv4address,
            offlineDevices: gateway.devices.filter((device) => device.status === 'offline').length || 0,
            onlineDevices: gateway.devices.filter((device) => device.status === 'online').length || 0,
            devices: gateway.devices.map((deviceUID) => {
                const device = db.devices.find((device) => device.uid === deviceUID);
                return {
                    uid: device.uid,
                    vendor: device.vendor,
                    dateCreated: device.dateCreated,
                    status: device.status,
                };
            }),
        };

        res.json({ gateway: response });
    } else {
        res.status(404).json({ message: 'Gateway not found' });
    }
});

router.post('/', (req, res) => {
    const { name, ipv4address } = req.body; // Assuming the request body contains the necessary fields
  
    // Create a new gateway object
    const newGateway = {
        serialNumber: generateUniqueSerialNumber(),
        name: name,
        ipv4address: ipv4address,
      devices: [], // Initialize devices as an empty array
    };
  
    // Add the new gateway to the gateways array
    db.gateways.push(newGateway);
  
    res.status(201).json({ message: 'Gateway created successfully', gateway: newGateway });
  });

module.exports = router;


// URLs
// all gateways: http://localhost:3001/gateways
// single gateway:  http://localhost:3001/gateways/GATEWAY001
// filter by serial number(all gateways that include the sn value): http://localhost:3001/gateways?sn=GATEWAY001
// new gateway (POST): http://localhost:3001/gateways