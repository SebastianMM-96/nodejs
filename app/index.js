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
const { parse } = require('path');
const url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

/** The server should respond all request **/
const server = http.createServer((req, res)=>{
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
            'payload' : buffer
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
});

/** 
 * Start the server in port 3000 
 * You can see the result using:
 * curl localhost:3000
 **/
server.listen(3000, () => {
    console.log("Server is now listening :) ");
});

/** Define the samples **/
var handlers = {};

/** Sample handler **/
handlers.sample = (data, callback) => {
    /** Callback HTTP status code **/
    callback(406, {'name' : 'Sample handler'});
    /** Payload as an objet **/
};

/** Not found handler **/
handlers.notFound = (data, callback) => {
    callback(404);
};

/** Routing Requests **/
var router = {
    'sample' : handlers.sample
}