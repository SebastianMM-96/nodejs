/** 
 * Create and export configuration variables 
 **/

/** Container for all the env */
var env = {};

/** Staging env */
env.staging = {
    'port' : 3000,
    'envName' : 'staging'
};

/** Production env */
env.production = {
    'port' : 5000,
    'envName' : 'production'
};

/** Determine wich env was passed as a command-line */
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

/** Check the current env */
var envToExport = typeof(env[currentEnv]) == 'object' ? env[currentEnv] : env.staging;

/** Export module */
module.exports = envToExport;