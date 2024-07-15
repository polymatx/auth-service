const fs = require( 'fs' );
const path = require( 'path' );

const envFilePath = path.join( __dirname, '../env.json' );

let envFile;
if ( fs.existsSync( envFilePath ) )
{
    envFile = require( envFilePath );
}

function read( valueName, ...defaults )
{
    if ( _notNull( process.env[ valueName ] ) )
    {
        return process.env[ valueName ];
    }

    else if ( envFile && _notNull( envFile[ valueName ] ) )
    {
        return envFile[ valueName ];
    }
    else
    {
        for ( let value of defaults )
        {
            if ( _notNull( value ) )
            {
                return value;
            }

        }
    }
}

/**
 * @return {number}
 */
function num( valueName, ...defaults )
{
    return Number( read( valueName, ...defaults ) );
}

/**
 * @return {boolean}
 */
function bool( valueName, ...defaults )
{
    const value = read( valueName, ...defaults );
    if ( _notNull( value ) )
    {
        const stringValue = value.toString();
        if ( [ '0', 'false' ].includes( stringValue ) )
        {
            return false;
        }
        if ( [ '1', 'true' ].includes( stringValue ) )
        {
            return true;
        }
    }
    return value;
}

/**
 * @return {string}
 */
function str( valueName, ...defaults )
{
    const value = read( valueName, ...defaults );
    return _notNull( value ) ? value.toString() : '';
}

function any( valueName, ...defaults )
{
    return read( valueName, ...defaults );
}

function array( valueName, ...defaults )
{
    const value = read( valueName, ...defaults );
    if ( Array.isArray( value ) )
    {
        return value;
    }

    if ( typeof value === 'string' )
    {
        return value.split( ',' ).map( item => item.trim() );
    }

    return value;
}

function _notNull( value )
{
    return value !== null && value !== undefined;
}

module.exports = {
    num, bool, str, any, array
};
