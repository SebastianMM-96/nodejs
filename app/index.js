/** 
 * RESTFul API
 * Developed by: Sebastian Marroquin
 * 
**/

/**
 * Starting a server
 */

/** Dependencies **/
const http = require('http');
/** Https module */
const https = require('https');
const { parse } = require('path');
const url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
/** Use the config file */
var config = require('./lib/config');
var fs = require('fs');
/** Require the handlers */
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

/** Instantiate the http server */
const httpServer = http.createServer((req, res)=>{
    unifiedServer(req, res);
});

/** Start the server */
httpServer.listen(config.httpPort, () => {
    console.log("Server is now listening in " +config.httpPort+ " :)");
});

/**
 * Instantiate the HTTPS server
 * & start the server
 */
var httpsServerOptions = {
    /** Two keys */
    /** Reading files from OpenSSL */
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};

/** Create a secure server */
const httpsServer = https.createServer(httpsServerOptions, (req, res)=>{
    unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, () => {
    console.log("Server is now listening in " +config.httpsPort+ " :)");
});


/** All the server logic for http & https */
var unifiedServer = (req, res) => {
    /** Parsing Request Paths **/

    /** Get the URL and parse it **/
    var parsedUrl = url.parse(req.url, true);
    
    /** Get the path **/
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    /** Parsing Query Strings **/
    /** Get the query strng as an object **/
    var queryStringObj = parsedUrl.query;

    /** Parsing HTTP Methods **/
    /** Get the http method **/
    var method = req.method.toLowerCase();

    /** Parsing headers **/
    /** Get the headers as an object */
    var headers = req.headers;

    /** Parsing Payloads **/
    /** Get the payload */
    var decoder = new StringDecoder('utf-8');
    /** Save the string in buffer variable */
    var buffer = '';
    req.on('data', (data) => {
        /** Append the result into the buffer **/
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        /** Choose the handler **/
        var chosenHandler = typeof(router[trimmedPath]) != 'undefined' ? router[trimmedPath] : handlers.notFound;

        /** Construt the data object to send to the router **/
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObj' : queryStringObj,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        /** Route the request to the handler specified in the router **/
        chosenHandler(data, (status, payload) => {
            /** Default status code **/
            status = typeof(status) == 'number' ? status : 200;
            
            /** Define the payload **/
            payload = typeof(payload) == 'object' ? payload : {};

            /** Convert paylod to string **/
            var payloadString = JSON.stringify(payload);

            /** Get the respose (return) and payload **/
            /** Returning JSON **/
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(status);
            res.end(payloadString);

            /** Log the request **/
            console.log('Request received:', status, payloadString);

        });
    });
}

/** Routing Requests **/
var router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens
}