import express from 'express';
const router = express.Router();
// import db from '../db';
import { DataType } from '../db';

// const db:DataType = require('../db');
const getData = require('../db');

import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://hizjgtdaswwzuktgocis.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpempndGRhc3d3enVrdGdvY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgzOTQxNjgsImV4cCI6MjAyMzk3MDE2OH0.sc-4aHvs7IpmDM-5zbSqDmaa6q7iW2aCSjKCf5pw7Wo'// process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

type GatewayFromDb = {
    serial_number: string,
    name: string,
    ipv4address: string,
}
type DeviceFromDb = {
    date_created: string | null
    status: boolean | null
    uid: string
    vendor: string
}

type Gateway = {
    serial_number: string,
    name: string,
    ipv4address: string,
    offlineDevices: number,
    onlineDevices: number,
    devices: {
        uid: number | undefined;
        vendor: string | undefined;
        date_created: string | undefined;
        status: string | undefined;
    }[],
}

function generateUniqueserial_number() {
  const prefix = 'GW-';
  const serial_number = prefix + uuidv4().slice(0, 6);
  return serial_number;
}


router.get('/', async (req, res) => {
    const { sn } = req.query;


    
    const gateways:GatewayFromDb[] = (await getData(false)).gateways;
    // const devicess:DeviceFromDb[] = (await getData()).gateways;
    const { data:devicesInGateway , error } = await supabase.from('Gateways').select('serial_number').eq('serial_number',gateways[0].serial_number).select(`
    serial_number,
    Devices (
        uid
    )
  `)/* .eq('serial_number',gateways[0].serial_number) */ as ({data:DeviceFromDb[],error})

    console.log('gatewaysgateways',gateways)
    console.log('devicesInGateway',devicesInGateway)
    // Filter gateways by serial number if 'sn' query parameter is present
    const matchedGateways = sn ? gateways.filter(gateway => gateway.serial_number.includes(sn.toString())) : gateways;

    // Map over the matched gateways to create the response data
    const gatewaysWithDevices = matchedGateways.map(gateway => {
        // const devicesInGateway = gateway.devices.map(deviceUID => {
        //     const device = db.devices.find(device => device.uid === deviceUID);
        //     return {
        //         uid: device?.uid,
        //         vendor: device?.vendor,
        //         date_created: device?.date_created,
        //         status: device?.status,
        //         // matchSearch: device.uid.toString().includes(sn),
        //     };
        // });


        return {
            serial_number: gateway.serial_number,
            name: gateway.name,
            ipv4address: gateway.ipv4address,
            // offlineDevices: devicesInGateway.filter(device => device.status === 'offline').length || 0,
            // onlineDevices: devicesInGateway.filter(device => device.status === 'online').length || 0,
            devices: devicesInGateway,
        };
    });

    res.json({ gateways: gatewaysWithDevices });
});

// Route for exact matching of serial_number
router.get('/:serial_number', (req, res) => {
    const { serial_number } = req.params;

    // Find the gateway object with the matching serial number
    // const gateway = db.gateways.find((gateway) => gateway.serial_number === serial_number);
    // const devicess = db.devices;

    // if (gateway) {
    //     // Create the response object with the same fields as filtering gateways by serial number
    //     const response: Gateway = {
    //         serial_number: gateway.serial_number,
    //         name: gateway.name,
    //         ipv4address: gateway.ipv4address,
    //         offlineDevices: devicess.filter((device) => device.status === 'offline').length || 0,
    //         onlineDevices: devicess.filter((device) => device.status === 'online').length || 0,
    //         devices: gateway.devices.map((deviceUID) => {
    //             const device = db.devices.find((device) => device.uid === deviceUID);
    //             return {
    //                 uid: device?.uid,
    //                 vendor: device?.vendor,
    //                 date_created: device?.date_created,
    //                 status: device?.status,
    //             };
    //         }),
    //     };

    //     res.json({ gateway: response });
    // } else {
        res.status(404).json({ message: 'Gateway not found' });
    // }
});

router.post('/', (req, res) => {
    const { name, ipv4address } = req.body; // Assuming the request body contains the necessary fields
  
    // Create a new gateway object
    const newGateway = {
        serial_number: generateUniqueserial_number(),
        name: name,
        ipv4address: ipv4address,
      devices: [], // Initialize devices as an empty array
    };
  
    // Add the new gateway to the gateways array
    // db.gateways.push(newGateway);
  
    res.status(201).json({ message: 'Gateway created successfully'/* , gateway: newGateway  */});
  });

module.exports = router;


// URLs
// all gateways: http://localhost:3001/gateways
// single gateway:  http://localhost:3001/gateways/GATEWAY001
// filter by serial number(all gateways that include the sn value): http://localhost:3001/gateways?sn=GATEWAY001
// new gateway (POST): http://localhost:3001/gateways