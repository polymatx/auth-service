const passport = require( 'passport' );
const { debug } = global._.config;
const { UniqueConstraintError, BaseError: SequelizeError } = require( 'sequelize' );
const BaseError = require( '../helpers/BaseError' );
const { ApiError } = require( '../helpers/Errors' );
const { validationResult } = require( 'express-validator' );
const Client = require( '../models/Client' );
const User = require( '../models/User' );
const Token = require( '../models/Token' );

const { createToken, verifyToken } = require( '../oauth/TokenUtils' );
const { v4: uuid } = require( 'uuid' );

async function register( req, res ) {
    const errors = validationResult( req );

    if ( !errors.isEmpty() ) {
        return res.status( 422 ).json( { errors: errors.array() } );
    }

    const { username, email, mobile, password } = req.body;

    try {
        const user = await User.createUser( { username, email, mobile, password } );
        res.json( user );
    } catch ( e ) {
        debug.error( e );
        if ( !ApiError.isBaseError( e )) {
            if ( e instanceof UniqueConstraintError ) {
                e = ApiError.get( 'USER_ALREADY_EXISTS' );
            } else if ( e instanceof SequelizeError ) {
                e = ApiError.get( 'DATABASE_ERROR' );
            } else {
                e = ApiError.get( 'INTERNAL_ERROR' );
            }
        }
        return res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
    }
}

async function generateClient( req, res ) {
    const errors = validationResult( req );

    if ( !errors.isEmpty() ) {
        return res.status( 422 ).json( { errors: errors.array() } );
    }

    const { applicationName, grants } = req.body;

    try {
        const { clientId, clientSecret } = await Client.generateClient( { applicationName, grants } );
        res.json( { applicationName, grants, clientId, clientSecret } );
    } catch ( e ) {
        debug.error( e );
        if ( !ApiError.isBaseError( e ) ) {
            if ( e instanceof UniqueConstraintError ) {
                e = ApiError.get( 'APPLICATION_ALREADY_EXISTS' );
            } else if ( e instanceof SequelizeError ) {
                e = ApiError.get( 'DATABASE_ERROR' );
            } else {
                e = ApiError.get( 'INTERNAL_ERROR' );
            }
        }
        return res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
    }
}

async function getUserToken( req, res ) {

    const { userId, clientId } = req.body;

    try {
        const user = await User.findUserById( userId );

        console.log(user);
        if (user) {

            const sessionId = uuid();
            const { accessToken, refreshToken, accessId, refreshId, expiresAt } = await createToken( userId, sessionId, clientId );
            await Token.revokePreviousTokensAndSaveNewToken( { accessId, refreshId, sessionId, userId, clientId } );

            res.json({
                "access_token": accessToken,
                "refresh_token": refreshToken,
                "sessionId": sessionId,
                "expires_at": expiresAt,
                "token_type": 'Bearer',
            });

        } else {

            return res.status( 404 ).json({
                'message': 'User not found'
            });
        }

    } catch ( e ) {
        debug.error( e );
        return res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
    }
}

async function check( req, res ) {
    const { id, username, mobile, email, mobile_verified_at, email_verified_at, verify, block,  has_profile, sessionId } = req.user;
    res.json( { id, username, mobile, email, mobile_verified_at, email_verified_at, verify, block,  has_profile, sessionId } );
}

async function user( req, res ) {
    res.json( req.user );
}

async function getClientDetail( req, res ) {
    try {
        const { applicationName } = req.params;
        const client = await Client.getClientDetail( { applicationName } );
        return res.json( client );
    } catch ( e ) {
        debug.error( e );
        if ( !ApiError.isBaseError( e ) ) {
            e = ApiError.get( 'INTERNAL_ERROR' );
        }
        return res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
    }
}


async function logout( req, res ) {
    const { sessionId } = req.user;
    try {
        await Token.revokeSession( sessionId );
        return res.status( 204 ).send();
    } catch ( e ) {
        debug.error( e );
        if ( !ApiError.isBaseError( e ) ) {
            e = ApiError.get( 'INTERNAL_ERROR' );
        }
        return res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
    }

}

async function internalAuthentication( req, res, next ) {
    try
    {
        const token = req.body.token || req.query.token;

        if ( !token )
        {
            return res.status ( 403 ).json ({
                'message': 'forbidden'
            });
        }

        if (token === "SGl68oGecZAeQ9Dm")
        {
            next ();

        } else {

            return res.status( 412 ).json({
                'message': 'Wrong Credentials'
            });
        }
    }
    catch ( e )
    {
        debug.error( e );
        if ( !ApiError.isBaseError( e ) ) {
            e = ApiError.get( 'INTERNAL_ERROR' );
        }
        return res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
    }
}

async function bearerStrategy( req, res, next ) {
    passport.authenticate( 'bearer', { session: false }, function ( e, user, info ) {
        if ( e || !user ) {
            debug.error( e );
            if ( !ApiError.isBaseError( e ) ) {
                e = ApiError.get( 'INVALID_TOKEN' );
            }
            return res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
        }
        req.user = user;
        next();
    } )( req, res, next );
}

async function clientPasswordStrategy(req, res, next) {
    passport.authenticate(
        [
            'oauth2-client-password'
        ],
        {
            session: false
        },
        function(e, data) {
            if (e) {
                debug.error(e);
                if (!ApiError.isBaseError( e ))
                {
                    e = ApiError.get("INVALID_CLIENT");
                }
                return res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
            }
            req.user = data;
            next();
        })(req, res, next);
}

async function tokenErrorHandler (e, req, res, next) {
    if (!ApiError.isBaseError( e ))
    {
        e = ApiError.get("WRONG_CREDENTIALS");
        return res.status ( e.statusCode ).json(e.toJSON(req.getLocale()))
    }
    res.status( e.statusCode ).json( e.toJSON(req.getLocale()) );
}

module.exports = {
    register,
    generateClient,
    check,
    user,
    getClientDetail,
    getUserToken,
    bearerStrategy,
    clientPasswordStrategy,
    tokenErrorHandler,
    logout,
    internalAuthentication
};
