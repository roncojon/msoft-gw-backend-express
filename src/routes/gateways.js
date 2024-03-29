"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
function generateUniqueSerialNumber() {
    const prefix = 'GW-';
    const serialNumber = prefix + (0, uuid_1.v4)().slice(0, 6);
    return serialNumber;
}
router.get('/', (req, res) => {
    const { sn } = req.query;
    const gateways = db_1.default.gateways;
    // Filter gateways by serial number if 'sn' query parameter is present
    const matchedGateways = sn ? gateways.filter(gateway => gateway.serialNumber.includes(sn)) : gateways;
    // Map over the matched gateways to create the response data
    const gatewaysWithDevices = matchedGateways.map(gateway => {
        const devicesInGateway = gateway.devices.map(deviceUID => {
            const device = db_1.default.devices.find(device => device.uid === deviceUID);
            return {
                uid: device === null || device === void 0 ? void 0 : device.uid,
                vendor: device === null || device === void 0 ? void 0 : device.vendor,
                dateCreated: device === null || device === void 0 ? void 0 : device.dateCreated,
                status: device === null || device === void 0 ? void 0 : device.status,
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
    const gateway = db_1.default.gateways.find((gateway) => gateway.serialNumber === serialNumber);
    const devicess = db_1.default.devices;
    if (gateway) {
        // Create the response object with the same fields as filtering gateways by serial number
        const response = {
            serialNumber: gateway.serialNumber,
            name: gateway.name,
            ipv4address: gateway.ipv4address,
            offlineDevices: devicess.filter((device) => device.status === 'offline').length || 0,
            onlineDevices: devicess.filter((device) => device.status === 'online').length || 0,
            devices: gateway.devices.map((deviceUID) => {
                const device = db_1.default.devices.find((device) => device.uid === deviceUID);
                return {
                    uid: device === null || device === void 0 ? void 0 : device.uid,
                    vendor: device === null || device === void 0 ? void 0 : device.vendor,
                    dateCreated: device === null || device === void 0 ? void 0 : device.dateCreated,
                    status: device === null || device === void 0 ? void 0 : device.status,
                };
            }),
        };
        res.json({ gateway: response });
    }
    else {
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
    db_1.default.gateways.push(newGateway);
    res.status(201).json({ message: 'Gateway created successfully', gateway: newGateway });
});
module.exports = router;
// URLs
// all gateways: http://localhost:3001/gateways
// single gateway:  http://localhost:3001/gateways/GATEWAY001
// filter by serial number(all gateways that include the sn value): http://localhost:3001/gateways?sn=GATEWAY001
// new gateway (POST): http://localhost:3001/gateways
