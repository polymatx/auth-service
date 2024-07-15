const EnabledMiddlewares = require( '../middlewares/EnabledMiddlewares' );
const path = require( 'path' );
const { config } = global._;
const { debug } = config;

function run( app )
{
    EnabledMiddlewares.forEach( ( { name, enabled, condition } ) =>
    {
        if ( enabled )
        {
            if ( condition )
            {
                if ( !name.endsWith( '.js' ) )
                {
                    name = `${ name }.js`;
                }

                try
                {
                    const middlewarePath = path.join( config.rootDir, config.constants.middlewareDirectory, name );
                    const middlewareFile = require( middlewarePath );
                    return app.use( middlewareFile );
                }
                catch ( e )
                {
                    debug.error( 'Error is:', e );
                    throw new Error( `Middleware ${ name } not found in ${ config.constants.middlewareDirectory }` );
                }
            }
        }

    } );
}

module.exports = {
    run
};
