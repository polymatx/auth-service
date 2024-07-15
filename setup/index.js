const { debug } = global._.config;
const sequelizeSetup = require( './SequelizeSetup' );
const passportSetup = require( './PassportSetup' );
const serverSetup = require( './ServerSetup' );

async function run()
{
    debug.log( 'Running Sequelize setup...' );
    const { sequelize, models } = await sequelizeSetup.run();
    debug.log( 'Running Passport setup...' );
    passportSetup.run();
    debug.log( 'Running Server setup...' );
    const { app, server } = await serverSetup.run();
    return {
        sequelize,
        models,
        app,
        server
    }
}

module.exports = { run };