const path = require( 'path' );
const env = require( '../helpers/Environment' );

const environment = env.str( 'NODE_ENV', 'development' );
const debugStatus = env.bool( 'DEBUG', true );
const debugPrefix = `auth-service-${ environment }`;

if ( debugStatus )
{
    process.env.DEBUG = debugPrefix;
}

module.exports = {
    environment,
    appName: 'auth-service',
    debug: {
        enabled: debugStatus,
        prefix: debugPrefix,
        log: console.log,
        error: console.error
    },
    rootDir: path.resolve( '' ),
    sequelize: {
        config:
            {
                dialect: 'mysql',
                username: env.str( 'MYSQL_USER', 'root' ),
                password: env.str( 'MYSQL_PASS', 'S9GJUS942aQqHgp9hGI1h@JYdzHpT7CzK76aW@xSgL9fV1Yp1B' ),
                database: env.str( 'MYSQL_DB', 'spontify' ),
                host: env.str( 'MYSQL_HOST', 'mysql-local' ),
                port: env.num( 'MYSQL_PORT', '3306' ),
                logging: env.bool( 'DATABASE_LOGGING', 'true' ) ? console.log : false,
            }
    },
    server: {
        config: {
            host: env.str( 'SERVER_HOST', '0.0.0.0' ),
            port: env.num( 'SERVER_PORT', '3001' ),
        },
        options: {
            logger: env.bool( 'WEB_SERVER_LOGGING', true )
        }
    },
    security: {
        jwtSignSecret: env.str( 'JWT_SECRET', '0vmmRxf0qcXqianKEDmm6cdng_tMrzRzFFnzB-etnuE' ),
        jwtEncryption: {
            shouldEncrypt: env.bool( 'SHOULD_ENCRYPT_TOKENS', false ),
            encryptionKey: env.str( 'JWE_ENCRYPTION_KEY', 'LUvvFZKeG8MTRCZLYBUHdmZoPg70hm-ZYTz6oRBCa-U' )
        },
        databaseEncryptionSecret: env.str( 'DATABASE_ENCRYPTION_SECRET', '623b07cb53ec407ab641f6ef531301a2' ),
        accessTokenTTL: env.str( 'ACCESS_TOKEN_TTL', '1 day' ),
        refreshTokenTTL: env.str( 'REFRESH_TOKEN_TTL', '1 year' ),
        bcryptSaltRounds: env.num( 'BCRYPT_SALT_ROUNDS', 10 )
    },
    rateLimiter: {
        points: env.num( 'RATE_LIMIT_REQUESTS_NUMBER', 10000 ),
        duration: env.num( 'RATE_LIMIT_DURATION_SECONDS', 1000 ),
        timeoutMs: 5000,
        whiteList: env.array( 'RATE_LIMIT_WHITE_LIST', [ '127.0.0.1', '8.8.8.8' ] ),
        whileListRegExp: env.str( 'RATE_LIMIT_WHITE_LIST_REGEXP', '^172.17+$' )
    },
    constants: {
        middlewareDirectory: '/middlewares'
    }
};
