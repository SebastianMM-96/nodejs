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

### Windows

```

```
