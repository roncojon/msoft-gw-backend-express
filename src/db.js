const db = {
    gateways: [
      {
        serialNumber: "GATEWAY001",
        name: "Gateway 1",
        ipv4address: "192.168.1.100",
        devices: [1, 2] // Referring to device UIDs
      },
      {
        serialNumber: "GATEWAY002",
        name: "Gateway 2",
        ipv4address: "192.168.1.200",
        devices: [3,45] // Referring to device UIDs
      },
      {
        serialNumber: "GATEWAY003",
        name: "Gateway 2",
        ipv4address: "192.168.1.200",
        devices: [46] // Referring to device UIDs
      }
    ],
    devices: [
      {
        uid: 1,
        vendor: "Device 1",
        dateCreated: "2022-01-01",
        status: "online"
      },
      {
        uid: 2,
        vendor: "Device 2",
        dateCreated: "2022-02-01",
        status: "offline"
      },
      {
        uid: 3,
        vendor: "Device 3",
        dateCreated: "2022-03-01",
        status: "online"
      },
      {
        uid: 45,
        vendor: "Device 45",
        dateCreated: "2022-03-01",
        status: "online"
      },
      {
        uid: 46,
        vendor: "Device 46",
        dateCreated: "2022-03-01",
        status: "online"
      },
    ],
  };
  
  module.exports = db;
  
  