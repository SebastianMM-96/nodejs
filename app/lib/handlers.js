/** 
 * Request handlers file 
 * */

/** Dependencies */
var _data = require('./data');
var helpers = require('./helpers');

/** Define all the handlers */
var handlers = {};

// /** Sample handler **/
// handlers.sample = (data, callback) => {
//     /** Callback HTTP status code **/
//     callback(406, {'name' : 'Sample handler'});
//     /** Payload as an objet **/
// };

/** User handlers */
handlers.users = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

/** Container for the users */
handlers._users = {};

/** All the methods */
/**
 * User's post
 * firstName, lastName, phone, pass, tosAgreement
 * data: none (optional)
 */
handlers._users.post = (data, callback) => {
    /** Check all the required fields are filled out */
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        /** Make sure that the user doesnt already exist */
        _data.read('users', phone, (err, data) => {
            if (err) {
                /** Hash the password using cripto */
                var hashedPassword = helpers.hash(password);
                /** Create a user object */
                if (hashedPassword) {
                    var userObj = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };
                    /** Store the user */
                    _data.create('users', phone, userObj, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    });
                } else {
                    callback(500, { 'Error': 'Could not hash the user\'s password' });
                }
            } else {
                callback(400, { 'Error': 'User already exist' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
};

/**
 * User's get
 * Require data : phone
 * optional data : none
 * @todo Only let an authenticated user access their object.
 */
handlers._users.get = (data, callback) => {
    /** Check the phone is valid */
    var phone = typeof (data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
    if(phone){
        /** Lookup */
        _data.read('users', phone, (err, data)=>{
            if(!err && data){
                /** Remove the hashed password from the user object */
                delete data.hashedPassword;
                callback(200, data);
            }else{
                callback(404);
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'});
    }
};

/**
 * User's put
 * Require data : phone
 * Optional data : firstName, lastName, password
 * @todo Only let an authenticated user update their own object.
 */
handlers._users.put = (data, callback) => {
    /** Check for the required field */
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    /** Optional fields */
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    /** Err if the phone is invalid */
    if(phone){
        if(firstName || lastName || password){
            /** Lookup the user */
            _data.read('users', phone, (err, userData)=>{
                if(!err && userData){
                    /** Update the fields */
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        /** Hash the password */
                        userData.hashedPassword = helpers.hash(password);
                    }
                    /** Store the updates */
                    _data.update('users', phone, userData, (err)=>{
                        if(!err){
                            callback(200);
                        }else{
                            console.log(err);
                            callback(500, {'Error':'Could not update the user'});
                        }
                    });
                }else{
                    callback(400, {'Error':'The specified user does not exist'});
                }
            })
        }else{
            callback(400, {'Error': 'Missing fields to update'});
        }
    }else{
        callback(400, {'Error': 'Missing required field'});
    }

};

/**
 * User's delete
 * Required field : phone
 * @todo Only let an authenticated user delete their object
 * @todo Cleanup any other data fields associated with this user
 */
handlers._users.delete = (data, callback) => {
    /** Check the phone is valid */
    var phone = typeof (data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
    if(phone){
        /** Lookup */
        _data.read('users', phone, (err, data)=>{
            if(!err && data){
                _data.delete('users', phone, (err)=>{
                    if(!err){
                        callback(200);
                    }else{
                        callback(500, {'Error':'Could not delete the user'});
                    }
                });
            }else{
                callback(400, {'Error':'Could not find the user'});
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'});
    }
};

/** Create a ping handler */
handlers.ping = (data, callback) => {
    callback(200);
};

/** Not found handler **/
handlers.notFound = (data, callback) => {
    /** Callback http status code */
    callback(404);
};

/** Export the handlers */
module.exports = handlers;