const statusCodes = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class UnauthenticatedError extends CustomAPIError {
    constructor(message){
        super(message);
        this.statusCodes = statusCodes.UNAUTHORIZED;
    }
}

module.exports = UnauthenticatedError;