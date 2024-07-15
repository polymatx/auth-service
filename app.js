global._ = {};
const config = global._.config = require(`./config`);
const {debug} = config;
// const Logger = require('./helpers/Logger');

debug.log('Booting app %s on environment %s', config.appName, config.environment);

const setup = require('./setup');

if (config.environment.toLowerCase() !== 'test') {
    setup.run().catch(e => {
        // Logger.error(e);
        debug.error('Error:', e);
        process.exit(1);
    });
}

module.exports = setup;
