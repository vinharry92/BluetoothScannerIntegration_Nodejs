//1. Variable declaration
var webSocketServer = require('ws').Server;
var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var url = require('url');
var SerialPort = require('serialport');
var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var bluetooth = require('node-bluetooth');
var device = new bluetooth.DeviceINQ();
var sc = require('windows-service-controller');
var express = require('express');
var app = express();
var StringDecoder = require('string_decoder').StringDecoder;
// var streamBuffers = require('stream-buffers');
var Count = 0;
var bufferArray = [];
var bufferErrorArray = [];


var myPort;
var param1;
var param2;
var isReconnectPort = false; 
//var appType;
var connections = new Array; 


//2. WebSocketServer  
var webSocketServerObject = new webSocketServer({port:9070});



// ------------------------ Serial event functions ----------------------:

// this is called when the serial port is opened:
  function showPortOpen() {
		broadcast(param3 + "$$" +"{isScannerActive : true}");
  

}
		// include the serialport library


// this is called when new data comes into the serial port:

 function readSerialData(data) {
	bufferArray = [];
	bufferErrorArray = [];
	if (connections.length > 0) {
		//if(appType == "windows")
			Finaldata = data + "$$" + "windows";
		broadcast(Finaldata.toString());
	}
}

// this is called when the serial port is closed:

 function showPortClose(data) {
	if (connections.length > 0) {
		var serialPortList = [];
		SerialPort.list(function (err, ports) {
			ports.forEach(function(portData) {
				if( portData.serialNumber != undefined ) {
					serialPortList.push(portData.comName);
					
				}
			})
			if(serialPortList.length <= 0) {
				broadcast("disconnected");
			}
		})
	}
	//broadcast("{isScannerActive : false}");
}

// this is called when the serial port has an error:

 function showError(error) {
	if (connections.length > 0) {
		broadcast("Error : Opening "+ param1 +" File not found. Please connect the device in Device connection wizard / insert the device for the scanner to work.");
	}
}

 function sendToSerial(data, client) {

}

// ------------------------ webSocket Server event functions

webSocketServerObject.on('connection', handleConnection);

  function handleConnection(client) {

  console.log("New Connection");        // you have a new client

  connections.push(client);             // add this client to the connections array

  client.on('message', sendToSerial, client);      // when a client sends a message,

  client.on('close', function() {           // when a client closes its connection

    console.log("connection closed");       // print it out

    var position = connections.indexOf(client); // get the client's position in the array

    connections.splice(position, 1);        // and delete it from the array
	btSerial.close();
	
	sc.getDisplayName('TractusScannerService.exe')
    .catch(function(error) { 
        console.log(error.message);
    })
    .done(function(displayName) { 
        console.log('Display name: ' + displayName); 
    });
	
	sc.stop('TractusScannerService.exe');
	

  });

}

// This function broadcasts messages to all webSocket clients

  function broadcast(data) {

  for (c in connections) {     // iterate over the array of connections
	
    connections[c].send(JSON.stringify(data)); // send the data to each connection

  }

}


  function createNewConnection(port, speed) {
	
	myPort = new SerialPort(port, speed);
	
	myPort.on('open', showPortOpen);    // called when the serial port opens

	myPort.on('close', showPortClose);  // called when the serial port closes

	myPort.on('error', showError);   // called when there's an error with the serial port

	myPort.on('data', readSerialData);
	
}

 function reconnectPort() {
	var availport = '';
	var speed = 9600;
	var count = 0;
	SerialPort.list(function (err, ports) {
		ports.forEach(function(port) {
			if(port.serialNumber != undefined && count == 0){
				count++;
				if(myPort != undefined) {
					myPort.close(function (err) {
						
						myPort = undefined;
					});
				}
				availport = port.comName.toString();
				createNewConnection(availport, speed);
			}
		});
	
	});
}



//3.
var server = http.createServer(function(req,res) {
	var pquery = querystring.parse(url.parse(req.url).query);
    var callback = (pquery.callback ? pquery.callback : '');
    var connectStatus = (pquery.connectStatus ? pquery.connectStatus : '');
	var bluetoothstatus = (pquery.bluetoothstatus ? pquery.bluetoothstatus : '');
	var bluetoothDisconnect = (pquery.bluetoothDisconnect ? pquery.bluetoothDisconnect : '');
	var pariedDeviceList = (pquery.pariedDeviceList ? pquery.pariedDeviceList : '');
	var ScannerFound = (pquery.ScannerFound ? pquery.ScannerFound : '');
	var ScannerAddress = (pquery.ScannerAddress ? pquery.ScannerAddress : '');
	var ScannerName = (pquery.ScannerName ? pquery.ScannerName : '');
		var isConnected = false;

	/*---------------Paried DeviceList8----------*/
	
	if(pariedDeviceList == "pariedDeviceList")
	{
	var deviceName =[];
	var deviceAddress=[];
	device.listPairedDevices(function(deviceList)
	{

	for (var i = 0; i < deviceList.length; i++) { 
		deviceName.push(deviceList[i].name);
		deviceAddress.push(deviceList[i].address);

    }
	broadcast(deviceName + "$$" + "{deviceName : true}");
	broadcast(deviceAddress + "$$" + "{deviceAddress : true}");

    });
		
	}
		
	
if(bluetoothstatus=bluetooth)	
{
	btSerial.close();
	if(ScannerAddress)
	{
	// var BScannerList = JSON.parse(ScannerAddress);
	// var address = BScannerList.B_Address;
	var address= ScannerAddress;
	if(address)
	{

		btSerial.findSerialPortChannel(address, function(channel) {
			btSerial.connect(address, channel, function() {
				broadcast(address + "$$" + "{BluetoothStatus : true}");

				btSerial.on('data', function(Chunk) {
					if(Chunk.length > 0)
					{
						var buffer = new Buffer(Chunk);
						bufferArray.push(buffer);
					}
					else
					{
						var buffer = new Buffer(Chunk);
						bufferErrorArray.push(buffer);
					}
					
					setTimeout(function() {
						if(bufferArray.length > 1)
						{
							var multiChunk = Buffer.concat(bufferArray);
							readSerialData(multiChunk.toString('utf8'));
						}
						else if(bufferArray.length == 1) {
							var singleChunk = bufferArray[0];
							readSerialData(singleChunk.toString('utf8'));
						}
						else if (bufferErrorArray.length > 1 || bufferErrorArray.length == 1)
						{
							var errorChunk = Buffer.concat(bufferErrorArray);
							readSerialData(errorChunk.toString('utf8'));
						}
						}, 1500);
					
				});
				

			}, function () {
				console.log('cannot connect');
			});
	
			// close the connection when you're ready
			//btSerial.close();
		}, function() {
			console.log('found nothing');
			var scannernotfound = 'found nothing';
			readSerialData(scannernotfound.toString('utf8'));
		});


	}
	btSerial.inquire();
	}

}
	
    if (connectStatus == "connect") {
		//appType = "windows";
		
		var deviceList  = (pquery.deviceList ? pquery.deviceList : '');
		var myobj = JSON.parse(deviceList);
		var serialPortList = [];
		SerialPort.list(function (err, ports) {
		ports.forEach(function(portData) {
			if( portData.serialNumber != undefined ) {
				serialPortList.push(portData.comName);
			}
		});
		
		//When device is not connected 
		if(serialPortList.length <= 0) {
			param1 = "";
			for(var i = 0; i < myobj.length; i++) {
				param1 += param1 == "" ?  myobj[i].param1 :  "," +  myobj[i].param1  + myobj[i].param3;
			}
			createNewConnection(param1, 9600);
		}
		
		 for(var i = 0; i < myobj.length; i++) {
			if (myPort != undefined && !isConnected ) {

				if(serialPortList.indexOf(myobj[i].param1) == 0) {
					isConnected = true;
					var port = myobj[i].param1;
					var speed = myobj[i].param2;
					var Name = myobj[i].param3;
					param1 = port;
					param2 = speed;
					param3 = Name;
					myPort.close(function (err) {
						
						myPort = undefined;
						createNewConnection(port, speed,Name);
					});
				}
					
			} else if(serialPortList.indexOf(myobj[i].param1) == 0 && !isConnected){
				param1 = myobj[i].param1;
				param2 = myobj[i].param2;
				param3 = myobj[i].param3;
				isConnected = true;
				if (myPort != undefined) {
					myPort.close(function (err) {
						
						myPort = undefined;
						createNewConnection(myobj[i].param1, myobj[i].param2,myobj[i].param3);
					});
				} else {
					createNewConnection(myobj[i].param1, myobj[i].param2,myobj[i].param3);
				}
			}
		 }
		  if(isConnected == false) {
			if (myPort != undefined) {
				myPort.close(function (err) {
					
					myPort = undefined;
					param1 = "";
					for(var i = 0; i < myobj.length; i++) {
						param1 += param1 == "" ?  myobj[i].param1 :  "," +  myobj[i].param1;
					}
					createNewConnection(param1, 9600);
				});
			} else {
				param1 = "";
				for(var i = 0; i < myobj.length; i++) {
					param1 += param1 == "" ?  myobj[i].param1 :  "," +  myobj[i].param1;
				}
				createNewConnection(param1, 9600);
			}
		}
		
		})
    } 
	
	
	else if (connectStatus == "connectWithAvailablePort") {
		//appType = "web";
		if (myPort != undefined) {
			myPort.close(function (err) {
				
				myPort = undefined;
				reconnectPort();
			});
		} else {
			reconnectPort();
		}
    } else if (connectStatus == "disconnect"){
		//appType = "windows";
		if(myPort != undefined) {
			var myPortObj = JSON.parse(JSON.stringify(myPort));
			myPortObj.opening = true;
			if(myPortObj.opening == true) {
				myPort.close(function (err) {
					myPort = undefined;
				});
			} else
				myPort = undefined;
		}
	} 
	else if (connectStatus == "porterror"){
		SerialPort.list(function (err, ports) {
			ports.forEach(function(portData) {
				if( portData.comName != myPort.path ) 
				{
				showError(error);
				}
			})
		})
	} 
	
	
	else if(connectStatus == "checkScannerStatus") {
		var serialPortList = [];
		SerialPort.list(function (err, ports) {
		ports.forEach(function(portData) {
			if( portData.serialNumber != undefined ) {
				serialPortList.push(portData.comName);
			}
		})
		if(serialPortList.length > 0) {
				broadcast(param3 + "$$" +"{isScannerActive : true}");
		}
			
		})
	}
	
});
//4.
server.listen(5070);

console.log('Server started');