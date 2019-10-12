var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name: 'TractusMonitoringService', 
    description: 'NodeJS server for the Tractus.',
    script: 'C:\\Program Files\\TractusSetup\\Monitoring Service\\TractusMonitoringService.js'
});

// Listen for the 'install' event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

// install the service
svc.install();