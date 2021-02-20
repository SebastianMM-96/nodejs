/** 
 * Create and export configuration variables 
 **/

/** Container for all the env */
var env = {};

/** Staging env */
env.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5,
    'twilio' : {
        'accountsId' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
    }
};

/** Production env */
env.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisIsAlsoASecret',
    'maxChecks' : 5
};

/** Determine wich env was passed as a command-line */
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

/** Check the current env */
var envToExport = typeof(env[currentEnv]) == 'object' ? env[currentEnv] : env.staging;

/** Export module */
module.exports = envToExport;