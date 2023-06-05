const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.json());

const db = require('../db');

let nextUID = 100;

function generateUID() {
  const uid = nextUID;
  nextUID += 1;
  return uid;
}

router.get('/', (req, res) => {
  const { uid } = req.query;
  if (uid) {
    // Filter the gateways to find those that contain devices matching the filter
    const matchedGateways = db.gateways.filter((gateway) =>
      gateway.devices.some((deviceUID) => {
        // Find the device object with matching UID
        const device = db.devices.find((device) => device.uid === deviceUID);
        return device && device.uid.toString().includes(uid);
      })
    );

    // Create an array of gateways with their respective devices
    const gatewaysWithDevices = matchedGateways.map((gateway) => {
      // Map over the devices in each gateway
      const devicesInGateway = gateway.devices.map((deviceUID) => {
        // Find the device object with matching UID
        const device = db.devices.find((device) => device.uid === deviceUID);
        return {
          uid: device.uid,
          vendor: device.vendor,
          dateCreated: device.dateCreated,
          status: device.status,
          matchSearch: device.uid.toString().includes(uid),
        };
      });

      // Create the gateway object with device information
      return {
        serialNumber: gateway.serialNumber,
        name: gateway.name,
        ipv4address: gateway.ipv4address,
        offlineDevices: devicesInGateway.filter((device) => device.status === 'offline').length || 0,
        onlineDevices: devicesInGateway.filter((device) => device.status === 'online').length || 0,
        devices: devicesInGateway,
      };
    });

    // Return the gateways with their devices that match the filter
    res.json({ gateways: gatewaysWithDevices });
    return;
  }

  // If no filter is provided, return all devices
  res.json(db.devices);
});

router.post('/', (req, res) => {
  const { vendor, dateCreated, status, gatewaySerialNumber } = req.body; // Assuming the request body contains the necessary fields, including the gatewaySerialNumber

  // Find the gateway with the provided serial number
  const gateway = db.gateways.find((gateway) => gateway.serialNumber === gatewaySerialNumber);

  if (!gateway) {
    res.status(404).json({ message: 'Gateway not found' });
    return;
  }

  // Check if the gateway already has the maximum number of devices
  if (gateway.devices.length >= 10) {
    res.status(400).json({ message: 'Gateway has reached the maximum number of devices' });
    return;
  }

  // Generate a new UID for the device
  const uid = generateUID(); // Replace generateUID() with your own function to generate a unique UID

  // Create a new device object
  const newDevice = {
    uid,
    vendor,
    dateCreated,
    status
  };

  // Add the new device to the devices array
  db.devices.push(newDevice);

  // Add the UID of the new device to the devices array of the corresponding gateway
  gateway.devices.push(uid);

  res.status(201).json({ message: 'Device created successfully', device: newDevice });
});

router.delete('/:uid', (req, res) => {
    const { uid } = req.params;
  
    console.log('device uid')
    console.log(uid)
    // Find the device with the provided UID
    const deviceIndex = db.devices.findIndex((device) => device.uid === Number(uid));
    console.log('deviceIndex')
    console.log(deviceIndex)

    if (deviceIndex === -1) {
      res.status(404).json({ message: 'Device not found' });
      return;
    }
  
    // Get the UID of the gateway the device belongs to
    // const gatewayUID = db.gateways.find((gateway) => gateway.devices.includes(Number(uid)))?.uid;
    const gateway = db.gateways.find((gateway) => gateway.devices.includes(Number(uid)));
    console.log('gatewgatewayayUID')
    console.log(gateway)

    if (!gateway) {
      res.status(404).json({ message: 'Gateway not found' });
      return;
    }
  
    // Remove the device from the devices array
    db.devices.splice(deviceIndex, 1);
  
    // Remove the device UID from the devices array of the corresponding gateway
    // const gateway = db.gateways.find((gw) => gw.serialNumber === gateway.serialNumber);
    if (gateway) {
      const deviceIndexInGateway = gateway.devices.indexOf(Number(uid));
      if (deviceIndexInGateway !== -1) {
        gateway.devices.splice(deviceIndexInGateway, 1);
      }
    }
  
    res.json({ message: 'Device deleted successfully' });
  });
  
module.exports = router;

// URLs
// all devices: http://localhost:3001/devices
// filter by serial number(all devices that include the duid value): http://localhost:3001/devices?uid=2
// new device (POST): http://localhost:3000/devices 
// delete: http://localhost:3000/devices/101