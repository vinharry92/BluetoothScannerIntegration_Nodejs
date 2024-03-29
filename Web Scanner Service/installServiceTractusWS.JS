﻿var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name: 'TractusWebScannerService', 
    description: 'NodeJS server for the Tractus.',
    script: 'C:\\Program Files\\TractusSetup\\Web Scanner Service\\TractusWebScannerService.js',
});

// Listen for the 'install' event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

// install the service
svc.install();