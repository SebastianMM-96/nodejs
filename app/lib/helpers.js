/**
 * Helpers for tasks
 */

 /** Dependencies */
var crypto = require('crypto');
var config = require('./config');
var queryString = require('querystring');
var https = require('https');

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

/** Send a SMS message */
helpers.sendTwilioSms = (phone, msg, callback)=>{
    //validate the params
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone && msg){
        //Config the request payload
        var payload = {
            'From' : config.twilio.fromPhone,
            'To' : '+1' + phone,
            'Body' : msg
        };
        //stringify the payload
        var stringPayload = queryString.stringify(payload);
        var requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/' + config.twilio.accountsId + '/Messages.json',
            'auth' : config.twilio.accountsId + ':' + config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(stringPayload)
            }
        };
        var req = https.request(requestDetails, (res)=>{
            var status = res.statusCode;
            if(status == 200 || status == 201){
                callback(false);
            }else{
                callback('Status code was: ' + status);
            }
        });
        
        // Bind the error event
        req.on('error', (e)=>{
            callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    }else{
        callback('Given parameters were missing');
    }
}

/** Export */
module.exports = helpers;