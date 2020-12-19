/**
 * Helpers for tasks
 */

 /** Dependencies */
var crypto = require('crypto');
var config = require('./config');

/** Container for helpers */
var helpers = {};

/** Hash function - SHA256 */
helpers.hash = (str)=>{
    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }else{
        return false;
    }
};

/**
 * Parse the JSON string to an object in all cases
 */

helpers.parseJsonToObject = (str)=>{
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
}


/** Export */
module.exports = helpers;