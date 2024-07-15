const { config } = global._;
const { RateLimiterCluster, RLWrapperBlackAndWhite } = require( 'rate-limiter-flexible' );
const Boom = require( 'boom' );


const whiteListConfig = {};

const { whiteList, whileListRegExp } = config.rateLimiter;

if ( whiteList && Array.isArray( whiteList ) )
{
    whiteListConfig[ 'whiteList' ] = whiteList;
}

if ( whileListRegExp )
{
    const regxp = new RegExp( whileListRegExp );
    whiteListConfig[ 'isWhiteListed' ] = key => regxp.test( key );
}

const rateLimiter = new RateLimiterCluster( {
    keyPrefix: 'auth-service-cluster',
    points: config.rateLimiter.points,
    duration: config.rateLimiter.duration,
    timeoutMs: config.rateLimiter.timeoutMs
} );

const error = Boom.tooManyRequests( 'Too Many Requests, please try again after a while.' );

const rateLimitWrapped = new RLWrapperBlackAndWhite( {
    limiter: rateLimiter,
    ...whiteListConfig
} );

const rateLimit = ( req, res, next ) =>
{
    rateLimitWrapped.consume( req.ip )
                    .then( () =>
                    {
                        next();
                    } )
                    .catch( () =>
                    {
                        res.status( error.output.statusCode ).send( error.output );
                    } );
};

module.exports = rateLimit;
