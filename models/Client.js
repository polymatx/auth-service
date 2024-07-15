const Sequelize = require( 'sequelize' );
const Model = Sequelize.Model;
const Crypter = require( '../helpers/Crypter' );
const { generateUniqueId } = require( '../helpers/Utility' );
const {ApiError} = require('../helpers/Errors');

class Client extends Model
{
    static init( sequelize, types )
    {
        return super.init( {
                id: {
                    type: types.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false
                },
                applicationName: {
                    type: types.STRING,
                    unique: true
                },
                clientId: {
                    type: types.STRING,
                    unique: true,
                    allowNull: false
                },
                clientSecret: {
                    type: types.STRING,
                    unique: true,
                    allowNull: false
                },
                grants: {
                    type: types.STRING
                }
            },
            {
                sequelize,
                underscored: true,
                tableName: 'clients',
                timestamps: true
            } );
    }

    static async authenticateClient( clientId, clientSecret )
    {
        const client = await this.findOne( { where: { clientId } } );
        if ( !client )
        {
            throw ApiError.get("INVALID_CLIENT");
        }
        const decryptedClientSecret = Crypter.decrypt( client.clientSecret );
        if ( clientSecret !== decryptedClientSecret )
        {
            throw ApiError.get("INVALID_CLIENT_CREDENTIALS");
        }
        const { applicationName, grants } = client;
        return { applicationName, grants: grants.split( ',' ) };
    }

    static async generateClient( { applicationName, grants } )
    {
        if ( grants.some( grant => grant !== 'password' ) )
        {
            throw ApiError.get("UNSUPPORTED_GRANT_TYPE");
        }
        const clientId = generateUniqueId();
        const clientSecret = generateUniqueId();
        const encryptedClientSecret = Crypter.encrypt( clientSecret );
        const stringifiedGrants = grants.length === 1 ? grants[ 0 ] : grants.join( ',' );
        await this.create( {
            applicationName,
            clientId,
            clientSecret: encryptedClientSecret,
            grants: stringifiedGrants
        } );
        return { applicationName, clientId, clientSecret, grants };
    };

    static async getClientDetail( { applicationName } )
    {
        const client = await this.findOne( { where: { applicationName } } );
        if ( client )
        {
            const decryptedClientSecret = Crypter.decrypt( client.clientSecret );
            return Object.assign( client, { clientSecret: decryptedClientSecret } );
        }
        throw ApiError.get("APPLICATION_NOT_FOUND")
    }

}

module.exports = Client;
