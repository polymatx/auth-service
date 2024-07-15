const oauth2orize = require( 'oauth2orize' );
const { debug } = global._.config;
const OAuth2Server = oauth2orize.createServer();
const { errors: { JOSEError } } = require( 'jose' );
const User = require( '../models/User' );
const Token = require( '../models/Token' );
const { createToken, verifyToken } = require( './TokenUtils' );
const { v4: uuid } = require( 'uuid' );
const {ApiError} = require('../helpers/Errors');
const BaseError = require('../helpers/BaseError');

OAuth2Server.exchange( oauth2orize.exchange.password(
    async function ( client, username, password, done )
    {
        try
        {
            const { id: userId } = await User.authenticateUser( { username, password } );
            const sessionId = uuid();
            const { accessToken, refreshToken, accessId, refreshId, expiresAt } = await createToken( userId, sessionId, client.clientId );
            await Token.revokePreviousTokensAndSaveNewToken( { accessId, refreshId, sessionId, userId, clientId: client.clientId } );
            done(
                null,
                accessToken,
                refreshToken,
                {
                    session_id: sessionId,
                    expires_at: expiresAt
                } );
        }
        catch ( e )
        {
            debug.error( e );
            if (e instanceof BaseError)
            {
                return done(e.toOAuthorizeError(), false);
            }
            done(e, false );
        }
    } ) );

OAuth2Server.exchange( oauth2orize.exchange.refreshToken(
    async function ( client, refreshToken, done )
    {
        try
        {
            const { userId, sessionId, refresh, tokenId } = await verifyToken( refreshToken, true );
            if ( refresh )
            {
                await User.findUserById( userId );
                const { clientId } = client;
                const { accessToken, refreshToken, accessId, refreshId, expiresAt } = await createToken( userId, sessionId, clientId );
                // TODO: what if user doesn't receive new token
                await Token.saveAndRevokeTokens( { prevRefreshId: tokenId, accessId, refreshId, sessionId, userId, clientId } );
                done( null, accessToken, refreshToken, { session_id: sessionId, expires_at: expiresAt } );
            }
            else
            {
                const error = ApiError.get("INVALID_REFRESH_TOKEN");
                done( error.toOAuthorizeError(), false );
            }
        }
        catch ( e )
        {
            debug.error( e );
            if ( e instanceof JOSEError )
            {
                const error = ApiError.get("INVALID_TOKEN");
                return done( error.toOAuthorizeError(), false );
            }
            if ( e instanceof BaseError )
            {
                const error = ApiError.get("REFRESH_TOKEN_REVOKED");
                return done( error.toOAuthorizeError(), false );
            }
            const error = ApiError.get("PARSE_TOKEN_ERROR");
            return done(error.toOAuthorizeError(), false );
        }
    } ) );

module.exports = { OAuth2Server };
