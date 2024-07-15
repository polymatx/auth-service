const { exec } = require( 'child_process' );
const sqlDriver = require( 'mysql2/promise' );

function checkKeys( obj, keys )
{
    const objKeys = Object.keys( obj );
    const result = keys.reduce( ( acc, cur ) =>
    {
        if ( objKeys.indexOf( cur ) <= -1 )
        {
            acc.push( cur );
        }
        return acc;
    }, [] );

    if ( result.length > 0 )
    {
        throw new Error( `${ result.length > 1 ? 'Properties' : 'Property' } ${ result } ${ result.length > 1 ? 'are' : 'is' } not present in response object` );
    }
    return true;
}

function getConnectionString( mysql )
{
    return `mysql://${ mysql.username }:${ mysql.password }@${ mysql.host }:${ mysql.port }`;
}

function migrateUp( mysql )
{
    const connString = getConnectionString( mysql );
    return new Promise( async ( resolve, reject ) =>
    {
        const conn = await sqlDriver
            .createConnection( {
                host: mysql.host,
                port: mysql.port,
                user: mysql.username,
                password: mysql.password
            } );
        const result = await conn.query( `CREATE DATABASE IF NOT EXISTS \`${ mysql.database }\`;` );
        await conn.end();

        const migrate = exec(
            `sequelize db:migrate --url ${ connString }/${ mysql.database }`,
            { env: process.env },
            ( err, stdout, stderr ) =>
            {
                if ( err )
                {
                    reject( err );
                }
                else
                {
                    resolve();
                }
            }
        );

        // Forward stdout+stderr to this process
        migrate.stdout.pipe( process.stdout );
        migrate.stderr.pipe( process.stderr );
    } );
}

async function migrateDown( mysql )
{
    const conn = await sqlDriver
        .createConnection( {
            host: mysql.host,
            port: mysql.port,
            user: mysql.username,
            password: mysql.password
        } );
    await conn.query( `DROP DATABASE IF EXISTS \`${ mysql.database }\`;` );
    await conn.end();
}

module.exports = {
    checkKeys,
    migrateUp,
    migrateDown
};
