const HealthController = require( '../controllers/HealthController' );

module.exports = function ( router )
{
    router.get( '/health', HealthController.health );
};
