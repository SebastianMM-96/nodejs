/** 
 * Request handlers file 
 * */

/** Dependencies */
const { time } = require('console');
const { type } = require('os');
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');
const { isRegExp } = require('util');

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
 */
handlers._users.get = (data, callback) => {
    /** Check the phone is valid */
    var phone = typeof (data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
    if (phone) {
        /** token from headers */
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        //verify the given token is valid for the phone
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                /** Lookup */
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        /** Remove the hashed password from the user object */
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(403, { 'Error': 'Missing required token in header or token is invalid' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

/**
 * User's put
 * Require data : phone
 * Optional data : firstName, lastName, password
 */
handlers._users.put = (data, callback) => {
    /** Check for the required field */
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    /** Optional fields */
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    /** Err if the phone is invalid */
    if (phone) {
        if (firstName || lastName || password) {

            /** token from headers */
            var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
            //verify the given token is valid for the phone
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    /** Lookup the user */
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            /** Update the fields */
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                /** Hash the password */
                                userData.hashedPassword = helpers.hash(password);
                            }
                            /** Store the updates */
                            _data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, { 'Error': 'Could not update the user' });
                                }
                            });
                        } else {
                            callback(400, { 'Error': 'The specified user does not exist' });
                        }
                    });
                } else {
                    callback(403, { 'Error': 'Missing required token in header or token is invalid' });
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }

};

/**
 * User's delete
 * Required field : phone
 */
handlers._users.delete = (data, callback) => {
    /** Check the phone is valid */
    var phone = typeof (data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
    if (phone) {
        /** token from headers */
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        //verify the given token is valid for the phone
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                /** Lookup */
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                //delete each of the cheks for the user
                                var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                var checksToDelete = userChecks.length;
                                if(checksToDelete > 0){
                                    var checksDeleted = 0;
                                    var deletionErrors = false;
                                    userChecks.forEach((chedkId)=>{
                                        _data.delete('checks', chedkId, (err)=>{
                                            if(err){
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                            if(checksDeleted == checksToDelete){
                                                if(!deletionErrors){
                                                    callback(200);
                                                }else{
                                                    callback(500, {'Error': 'Error while tried to delete the user\'s checks'});
                                                }
                                            }
                                        })
                                    });
                                }else{
                                    callback(200);
                                }
                            } else {
                                callback(500, { 'Error': 'Could not delete the user' });
                            }
                        });
                    } else {
                        callback(400, { 'Error': 'Could not find the user' });
                    }
                });
            } else {
                callback(403, { 'Error': 'Missing required token in header or token is invalid' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

/** User tokens */
handlers.tokens = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

/** Container for all the tokens */
handlers._tokens = {};

/** Tokens method: POST */
/** Required data: phone, password */
handlers._tokens.post = (data, callback) => {
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        /** user mathc with phone */
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                /** Hash the sent password and compare */
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    /** create new token, set exp. date 1 hr in future */
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObj = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObj, (err) => {
                        if (!err) {
                            callback(200, tokenObj);
                        } else {
                            callback(500, { 'Error': 'Could not create the token' });
                        }
                    });

                } else {
                    callback(400, { 'Error': 'Passsword did not match the specified user\'s stored password' });
                }
            } else {
                callback(400, { 'Error': 'User not found' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
}
/** Tokens method: GET */
/** Required data: id */
handlers._tokens.get = (data, callback) => {
    //Check the id is valid
    var id = typeof (data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false;
    if (id) {
        /** Lookup */
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
}
/** Tokens method: PUT */
/** 
 * Required fields: id, extend 
 * Optional: none
 * */
handlers._tokens.put = (data, callback) => {
    var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if (id && extend) {
        /** Lookup the token */
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                //check the token is expired
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    //store the new data
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { 'Error': 'Could not update the token\'s expiration' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Token already expires and cannot be extended' });
                }
            } else {
                callback(400, { 'Error': 'Speified token does not exist' });
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field(s) or fields are invalid' });
    }
}
/** Tokens method: DELETE */
handlers._tokens.delete = (data, callback) => {
    /** check id valid */
    var id = typeof (data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false;
    if (id) {
        /** Lookup */
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error': 'Could not delete the token' });
                    }
                });
            } else {
                callback(400, { 'Error': 'Could not find the token' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
}

/** Verify if a given token id is currently valid for a given user */
handlers._tokens.verifyToken = (id, phone, callback) => {
    //lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            //token for a given user
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

/** Checks service */
handlers.checks = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
};

/** Container for all the checks methods */
handlers._checks = {};

/** 
 * Checks Post 
 * Required data: Protocol, url, method, successCodes, timeOutSeconds
 * optional data: none
 * */
handlers._checks.post = (data, callback) => {
    //validate inputs
    var protocol = typeof (data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeOutSeconds = typeof (data.payload.timeOutSeconds) == 'number' && data.payload.url.timeOutSeconds % 1 === 0 && data.payload.timeOutSeconds >= 1 && data.payload.timeOutSeconds <= 5 ? data.payload.timeOutSeconds : false;

    if (protocol && url && method && successCodes && timeOutSeconds) {
        // get the token from the headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        //Lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                var userPhone = tokenData.phone;
                //lookup user data
                _data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        //adding the new check
                        var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        //verify that the user has less than the number of the max checks
                        if (userChecks.length < config.maxChecks) {
                            //create a random id for the check
                            var checkId = helpers.createRandomString(20);
                            //create the check obj and include the user's phone
                            var checkObj = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeOutSeconds': timeOutSeconds
                            };

                            _data.create('checks', checkId, checkObj, (err) => {
                                if (!err) {
                                    //add the checkId into userObj
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    //save the new user data
                                    _data.update('users', userPhone, userData, (err) => {
                                        if (!err) {
                                            callback(200, checkObj);
                                        } else {
                                            callback(500, { 'Error': 'Could not update the user with the check' });
                                        }
                                    });

                                } else {
                                    callback(500, { 'Error': 'Could not create the check' });
                                }
                            });
                        } else {
                            callback(400, { 'Error': 'User have the max of checks (' + config.maxChecks + ')' });
                        }

                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });

    } else {
        callback(400, { 'Error': 'Missing required inputs or inputs are invalid' });
    }

};

/** 
 * Checks get
 * Required data: id
 * Optional data : none
 */
handlers._checks.get = (data, callback) => {
    /** Check the id is valid */
    var id = typeof (data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false;
    if (id) {
        /** Lookup the check */
        _data.read('checks', id, (err, checkData)=>{
            if (!err && checkData) {
                /** token from headers */
                var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                //verify the given token is valid for the phone
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        /** Lookup */
                        callback(200, checkData);
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

/**
 * Checks put
 * Required data: id
 * Optional data : protocol, url, method, successCodes, timeOutSeconds
 */
handlers._checks.put = (data, callback) => {
    /** Check for the required field */
    var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    /** Optional fields */
    var protocol = typeof (data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeOutSeconds = typeof (data.payload.timeOutSeconds) == 'number' && data.payload.url.timeOutSeconds % 1 === 0 && data.payload.timeOutSeconds >= 1 && data.payload.timeOutSeconds <= 5 ? data.payload.timeOutSeconds : false;

    if (id) {
        /** check to make sure one or more optional fields has benn sent */
        if (protocol || url || method || successCodes || timeOutSeconds) {
            /** lookup */
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    /** token from headers */
                    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                    //verify the given token is valid for the phone
                    handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            /**update the check neccessary */
                            if (protocol) {
                                checkData.protocol = protocol;
                            }
                            if (url) {
                                checkData.url = url;
                            }
                            if (method) {
                                checkData.method = method;
                            }
                            if (successCodes) {
                                checkData.successCodes = successCodes;
                            }
                            if (timeOutSeconds) {
                                checkData.timeOutSeconds = timeOutSeconds;
                            }
                            //store the new updates
                            _data.update('checks', id, checkData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, { 'Error': 'Could not update the check' });
                                }
                            })
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Id did not exist' });
                }
            })
        } else {
            callback(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
}

/**
 * Checks delete
 */
handlers._checks.delete = (data, callback) => {
    /** Check the id is valid */
    var id = typeof (data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false;
    if (id) {
        /**Lookup the check */
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                /** token from headers */
                var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                //verify the given token is valid for the phone
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        //delete the chack data
                        _data.delete('checks', id, (err) => {
                            if (!err) {
                                /** Lookup */
                                _data.read('users', checkData.userPhone, (err, userData) => {
                                    if (!err && userData) {
                                        var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                        //remove the deleted check
                                        var checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            _data.update('users', checkData.userData, (err) => {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    callback(500, { 'Error': 'Could not update the user' });
                                                }
                                            });
                                        } else {
                                            callback(500, { 'Error': 'Not find the user\'s object' });
                                        }
                                    } else {
                                        callback(400, { 'Error': 'Could not find the user' });
                                    }
                                });
                            } else {
                                callback(500, { 'Error': 'Could not delete the data' });
                            }
                        });

                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(400, { 'Error': 'The id is not exist' });
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' });
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