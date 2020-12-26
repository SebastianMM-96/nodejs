# Spec's

1. The API listens on a PORT and accepts incoming HTTP
requests for:
    - POST
    - GET
    - PUT
    - DELETE
    - HEAD

2. API allows a client to connect, then create a new user, 
then edit and delete that user 

3. API allows sign in give a token

4. API allows the user to sign out

5. API allows signed-in user to use their token to create a check

6. API allows a signed-in user to edit or delete any of their checks

7. Perform all the checks at the appropriate times and send alerts to the users when a check
changes. 

## Config file

To select the environments that are available within the configuration file, it is necessary in the terminal to enter the following command:

### Linux/MacOS

```
$> NODE_ENV=<envName> node index.js
```

## HTTPS Support

- Install OpenSSL
- Run the following command: 

```
$> openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```
## Storing data

The librarie is in the ``` lib ``` folder. 
CRUD to do into a file:

```
/** Require the data module */
var _data = require('./lib/data');

/** Write */
_data.create('test', 'newFile', {'foo':'bar'}, (err)=>{
    console.log('This is the error: ', err);
})

/** Read */
_data.read('test', 'newFile', (err, data)=>{
    console.log('This is the error: ', err);
    console.log('This is the data: ', data);
})

/** Update */
_data.update('test', 'newFile', {'fizz' : 'buzz'}, (err)=>{
    console.log('This is the error: ', err);
})

/** Delete */
_data.delete('test', 'newFile', (err)=>{
    console.log('This is the error: ', err);
})

```

## Tokens 

authentication mechanism to verify a user's sessions. The tokens were created from the id and password of an existing user.