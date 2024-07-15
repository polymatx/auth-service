const passport = require( 'passport' );
const { debug } = global._.config;
const ClientPasswordStrategy = require( 'passport-oauth2-client-password' ).Strategy;
const BearerStrategy = require( 'passport-http-bearer' ).Strategy;
const User = require( '../models/User' );
const Client = require( '../models/Client' );
const { verifyToken } = require( '../oauth/TokenUtils' );
const { errors: { JOSEError } } = require( 'jose' );
const BaseError = require('../helpers/BaseError');
const { ApiError } = require('../helpers/Errors');

function run()
{
    passport.use( new ClientPasswordStrategy(
        async function ( clientId, clientSecret, done )
        {
            try
            {
                const { applicationName, grants } = await Client.authenticateClient( clientId, clientSecret );
                if ( grants.includes( 'password' ) )
                {
                    done( null, { applicationName, grants, clientId, clientSecret } );
                }
                else
                {
                    done( null, false );
                }
            }
            catch ( e )
            {
                debug.error(e);
                done( e, false );
            }
        }
    ) );

    passport.use( new BearerStrategy( { passReqToCallback: true },
        async function ( req, accessToken, done )
        {
            try
            {
                const verificationResult = await verifyToken( accessToken, false );
                const { userId, sessionId } = verificationResult;
                const user = await User.findUserById( userId );
                done( null, { ...user, sessionId } );
            }
            catch ( e )
            {
                debug.error(e);
                if (ApiError.isBaseError( e ))
                {
                    return done( e.toOAuthorizeError(), false );
                }
                if ( e instanceof JOSEError )
                {
                    if (e.code === 'ERR_JWT_EXPIRED')
                    {
                        const error = ApiError.get("ERR_JWT_EXPIRED");
                        return done( error, false );

                    } else {

                        const error = ApiError.get("INVALID_TOKEN");
                        return done( error, false );
                    }
                }
                return done( e, false );
            }
        }
    ) );
}

module.exports = { run };
