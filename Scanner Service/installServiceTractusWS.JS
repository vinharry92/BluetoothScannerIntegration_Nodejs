var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name: 'TractusScannerService', 
    description: 'NodeJS server for the Tractus.',
    script: 'C:\\Program Files\\TractusSetup\\Scanner Service\\TractusScannerService.js',
});

// Listen for the 'install' event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

// install the service
svc.install();