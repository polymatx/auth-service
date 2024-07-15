const { checkSchema } = require( 'express-validator' );

const schemaCheck = checkSchema( {
    applicationName: {
        in: 'body',
        errorMessage: 'Field applicationName is required.',
        isString: true
    },
    grants: {
        in: 'body',
        errorMessage: 'Field grants is required and must be an array.',
        isArray: true
    }
} );

module.exports = schemaCheck;