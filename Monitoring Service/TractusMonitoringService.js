//1. Variable declaration
var webSocketServer = require('ws').Server;
var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var sc = require('windows-service-controller');
const express = require('express');
const app = express();

http.createServer(function(request, respone){
   pathName= url.parse(request.url).pathname;
   query= url.parse(request.url).query;
   console.log('pathName' + pathName);  
   console.log('query' + query);
     	sc.getDisplayName('TractusScannerService.exe')
    .catch(function(error) { 
        console.log(error.message);
    })
    .done(function(displayName) { 
        console.log('Display name: ' + displayName); 
    });
	
	if(query == "StopService"){
		sc.stop('TractusScannerService.exe');
		
	}
	else if(query == "StartService")
	{
	sc.start('TractusScannerService.exe');
    }
    else if(query == "StopWebService"){
		sc.stop('TractusWebScannerService.exe');
		
	}
	else if(query == "StartWebService")
	{
	sc.start('TractusWebScannerService.exe');
	}
}).listen(7000);



