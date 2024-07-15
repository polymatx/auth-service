const { JWT, JWK, JWE, errors: { JOSEError } } = require( 'jose' );
const { config } = global._;
const { debug } = config;
const { generateUniqueId } = require( '../helpers/Utility' );
const Token = require( '../models/Token' );
const JWT_SIGN_KEY = JWK.asKey( config.security.jwtSignSecret );

let JWT_ENC_KEY;
if (config.security.jwtEncryption.shouldEncrypt)
{
    JWT_ENC_KEY = JWK.asKey( config.security.jwtEncryption.encryptionKey );
}

const JWT_ACCESS_TTL = config.security.accessTokenTTL;
const JWT_REFRESH_TTL = config.security.refreshTokenTTL;

async function createToken( userId, sessionId, clientId )
{
    const opts = {
        algorithm: 'HS256',
        header: { typ: 'JWT' },
        issuer: clientId.toString(),
        iat: true,
        subject: userId.toString()
    };
    let accessToken = JWT.sign( { refresh: false, sessionId },
        JWT_SIGN_KEY,
        Object.assign( opts, { expiresIn: JWT_ACCESS_TTL, jti: generateUniqueId() } ) );

    let refreshToken = JWT.sign( { refresh: true, sessionId },
        JWT_SIGN_KEY,
        Object.assign( opts, { expiresIn: JWT_REFRESH_TTL, jti: generateUniqueId() } ) );

    const decodedAccessToken = JWT.decode( accessToken );
    const decodedRefreshToken = JWT.decode( refreshToken );
    if (config.security.jwtEncryption.shouldEncrypt)
    {
        accessToken = JWE.encrypt( accessToken, JWT_ENC_KEY );
        refreshToken = JWE.encrypt( refreshToken, JWT_ENC_KEY );
    }
    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessId: decodedAccessToken.jti,
        refreshId: decodedRefreshToken.jti,
        sessionId,
        expiresAt: {
            access_token: decodedAccessToken.exp,
            refresh_token: decodedRefreshToken.exp
        }
    };
}

async function verifyToken( token, isRefresh = false )
{
    let finalToken = token;
    if (config.security.jwtEncryption.shouldEncrypt)
    {
        finalToken = JWE.decrypt( token, JWT_ENC_KEY ).toString( 'utf-8' );
    }
    const { iss: clientId, sub: userId, jti: tokenId, refresh, sessionId } = JWT.decode( finalToken );
    const dbToken = await Token.validateToken( { tokenId, type: isRefresh ? 'refresh' : 'access' } );
    JWT.verify( finalToken, JWT_SIGN_KEY, {
        algorithms: [ 'HS256' ],
        issuer: dbToken.clientId
    } );
    return {
        userId,
        clientId,
        tokenId,
        refresh,
        sessionId
    };
}

module.exports = { createToken, verifyToken };
