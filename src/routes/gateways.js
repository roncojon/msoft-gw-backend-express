"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// const db:DataType = require('../db');
const getData = require('../db');
const uuid_1 = require("uuid");
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = 'https://hizjgtdaswwzuktgocis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpempndGRhc3d3enVrdGdvY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgzOTQxNjgsImV4cCI6MjAyMzk3MDE2OH0.sc-4aHvs7IpmDM-5zbSqDmaa6q7iW2aCSjKCf5pw7Wo'; // process.env.SUPABASE_KEY
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function generateUniqueserial_number() {
    const prefix = 'GW-';
    const serial_number = prefix + (0, uuid_1.v4)().slice(0, 6);
    return serial_number;
}
router.get('/', async (req, res) => {
    const { sn } = req.query;
    const gateways = (await getData(false)).gateways;
    // Filter gateways by serial number if 'sn' query parameter is present
    const matchedGateways = sn ? gateways.filter(gateway => gateway.serial_number.includes(sn.toString())) : gateways;
    // Map over the matched gateways to create the response data
    const gatewaysWithDevices = await Promise.all(matchedGateways.map(async (gateway) => {
        const { data: devicesInGateway, error } = await supabase.from('Gateways')
            .select('serial_number')
            .eq('serial_number', gateway.serial_number)
            .select(`
        Devices (
            *
        )
      `); /* as ({data:DeviceFromDb[],error}) */
        const devicesss = devicesInGateway.flatMap(d => d.Devices);
        console.log('gatewaysgateways', gateways);
        console.log('devicesInGateway', devicesInGateway);
        console.log('devicesss', devicesss);
        return {
            serial_number: gateway.serial_number,
            name: gateway.name,
            ipv4address: gateway.ipv4address,
            offlineDevices: devicesss?.filter(device => device?.status === false).length || 0,
            onlineDevices: devicesss?.filter(device => device?.status === true).length || 0,
            devices: devicesss ?? [],
        };
    }));
    console.log('gatewaysWithDevices', gatewaysWithDevices);
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
    res.status(201).json({ message: 'Gateway created successfully' /* , gateway: newGateway  */ });
});
module.exports = router;
// URLs
// all gateways: http://localhost:3001/gateways
// single gateway:  http://localhost:3001/gateways/GATEWAY001
// filter by serial number(all gateways that include the sn value): http://localhost:3001/gateways?sn=GATEWAY001
// new gateway (POST): http://localhost:3001/gateways
