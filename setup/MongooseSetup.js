const mongoose = require( 'mongoose' );
const encodeUrl = require( 'encodeurl' );
const { config } = global._;

async function run()
{
    const connectionString = getConnectionString( config.mongodb.config );
    await mongoose.connect( connectionString, config.mongodb.options );
}

function getConnectionString( config )
{
    const { username, password, hostname, port, replicaSetName, readPreference, maxStalenessSeconds, database, authDatabase } = config;
    let connectionString = `mongodb://${ username }:${ password }@${ hostname }:${ port }/`;

    if ( database ) {
        connectionString += `${ database }`;
    }

    if ( replicaSetName || readPreference || maxStalenessSeconds || authDatabase ) {
        connectionString += '?';
    }

    if ( authDatabase ) {
        connectionString += `authSource=${ authDatabase }`;
    }

    if ( replicaSetName ) {
        connectionString += `replicaSet=${ replicaSetName }`;
    }

    if ( readPreference ) {
        connectionString += `readPreference=${ readPreference }`;
    }

    if ( maxStalenessSeconds ) {
        connectionString += `maxStalenessSeconds=${ maxStalenessSeconds }`;
    }

    return encodeUrl( connectionString );
}

module.exports = {
    run
};
