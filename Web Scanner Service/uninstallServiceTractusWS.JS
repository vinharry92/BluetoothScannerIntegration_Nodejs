var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name: 'TractusWebScannerService', 
    description: 'NodeJS server for the Tractus.',
    script: 'C:\\Program Files\\TractusSetup\\Web Scanner Service\\TractusWebScannerService.js',
});

// Listen for the 'Uninstall' event, which indicates the
// process is available as a service.
svc.on('uninstall', function () {
    console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// install the service
svc.uninstall();