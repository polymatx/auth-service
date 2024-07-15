const i18n = require( 'i18n' );
const path = require( 'path' );

i18n.configure( {
    locales: [ 'en', 'de' ],
    defaultLocale: 'en',
    queryParameter: 'locale',
    directory: path.join( __dirname, '../locales' )
} );

module.exports = i18n;