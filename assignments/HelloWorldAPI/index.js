/**
 * Hello World API
 * Dev by: SebastianMM-96
 */

/** Dependencies */
const http = require('http');

/** Create the server */
const server = http.createServer((req, res) => {
    /** Get the http method **/
    var method = req.method.toLowerCase();
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200, 'Good request');
    if (method == 'post') {
        const response = JSON.stringify({ message: 'Hello World!' });
        res.end(response);
    } else {
        const response = JSON.stringify({ message: 'You need to send a POST request to get the appropriate response' });
        res.end(response);
    }
});

/** Server listen on port 9000 */
server.listen(9000, () => {
    console.log('Server is now listening on port 9000')
});