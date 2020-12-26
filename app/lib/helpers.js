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

/** Random string function */
helpers.createRandomString = (strLength)=>{
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength){
        //Define all the char into string
        var possibleChar = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var str = '';

        for(i=1; i <= strLength; i++){
            //random char
            var randomChar = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            //append 
            str += randomChar;
        }

        return str;
    }else{
        return false;
    }
}

/** Export */
module.exports = helpers;