const Sequelize = require( 'sequelize' );
const fs = require( 'fs' );
const path = require('path');
const { sequelize: { config } } = global._.config;
const baseFolder = path.join(global._.config.rootDir, 'models');

async function run()
{
    const { database, username, password, ...rest } = config;
    const sequelize = new Sequelize( database, username, password, rest );
    const loaded = {};
    fs.readdirSync( baseFolder )
      .filter( ( file ) =>
      {
          return file.indexOf( '.' ) !== 0 && file.slice( -3 ) === '.js';
      } )
      .forEach( ( file ) =>
      {
          const ModelClass = require(path.join( baseFolder, file ));
          const model = ModelClass.init(sequelize, Sequelize);
          loaded[ model.name ] = model;
      } );
    return { sequelize, models: loaded };
}

module.exports = {
    run
};
