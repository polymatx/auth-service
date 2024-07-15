const { checkSchema } = require( 'express-validator' );

const schemaCheck = checkSchema( {
    username: {
        in: 'body',
        errorMessage: 'Field username is required.',
        isString: true,
        isLength: {
            errorMessage: 'Username must be at least 4 characters long.',
            options: {
                min: 4,
                max: 128
            }
        }
    },
    email: {
        in: 'body',
        errorMessage: 'Field email should be a valid email address.',
        isEmail: true
    },
    password: {
        in: 'body',
        errorMessage: 'Field password is required',
        isString: true,
        isLength: {
            errorMessage: 'Password must be at least 8 characters.',
            options: { min: 8 }
        }
    },
    passwordConfirmation: {
        custom: {
            options: ( value, { req } ) =>
            {
                if ( value !== req.body.password )
                {
                    throw new Error( 'Password confirmation does not match password.' );
                }
                return true;
            }
        }
    }
} );

module.exports = schemaCheck;
