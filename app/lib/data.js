/** File to storing and editing data */

/** Dependencies */
const { dir } = require('console');
var fs = require('fs');
var path = require('path');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const helpers = require('./helpers');

/** Create a container for the module */
var lib = {};

/** Define the base dir of the data */
lib.baseDir = path.join(__dirname, '/../.data/');

/** Write data to a file */
lib.create = (dir, file, data, callback) => {
    /** Open the file for reading */
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            /** Good */
            /** Convert data to string */
            var stringData = JSON.stringify(data);

            /** Write in the file */
            fs.writeFile(fileDescriptor, stringData, (err)=>{
                if(!err){
                    fs.close(fileDescriptor, (err)=>{
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error closing the file');
                        }
                    });
                }else{
                    callback('Error writing to new file');
                }
            });

        } else {
            /** Bad */
            callback('Could not create a new file, it may already exist');
        }
    });
};

/** Read data from file */
lib.read = (dir, file, callback)=>{
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data)=>{
        if(!err && data){
            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        }else{
            callback(err, data);
        }
    });
};

/** Update data */
lib.update = (dir, file, data, callback) => {
    /** Open the file to write */
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            /** Convert data to string */
            var stringData = JSON.stringify(data);

            /** Truncate the file */
            fs.truncate(fileDescriptor, (err)=>{
                if(!err){
                    /** Write in the file */
                    fs.writeFile(fileDescriptor, stringData, (err)=>{
                        if(!err){
                            fs.close(fileDescriptor, (err)=>{
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing the file');
                                }
                            });
                        }else{
                            callback('Error writing into existing file');
                        }
                    });
                }else{
                    callback('Error truncating the file');
                }
            });
        }else{
            callback('Could not open the file for updating, it main not exist yet');
        }
    });
};

/** Delete a file */
lib.delete = (dir, file, callback)=>{
    /** Unlinking / remove from file system */
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err)=>{
        if(!err){
            callback(false);
        }else{
            callback('Error deleting the file');
        }
    });
};

/** Export the module */
module.exports = lib;