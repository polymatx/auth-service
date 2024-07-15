const Sequelize = require( 'sequelize' );
const Model = Sequelize.Model;
const {ApiError} = require('../helpers/Errors');

class Token extends Model
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
                accessId: {
                    type: types.STRING,
                    unique: true,
                    allowNull: false
                },
                refreshId: {
                    type: types.STRING,
                    unique: true,
                    allowNull: false
                },
                sessionId: {
                    type: types.STRING,
                    unique: true,
                    allowNull: false
                },
                userId: {
                    type: types.BIGINT,
                    allowNull: false,
                    references: {
                        model: 'User',
                        key: 'id'
                    }
                },
                clientId: {
                    type: types.STRING,
                    allowNull: false
                }
            },
            {
                sequelize,
                underscored: true,
                tableName: 'tokens',
                timestamps: true
            } );
    }

    static associate( models )
    {
        this.belongsTo( models.User );
    }

    static findAccessToken( accessId )
    {
        return this.findOne( { where: { accessId } } );
    };

    static findRefreshToken( refreshId )
    {
        return this.findOne( { where: { refreshId } } );
    };

    static findAllUserTokens( userId )
    {
        return this.find( { where: { userId } } );
    };

    static saveToken( { accessId, refreshId, sessionId, userId, clientId }, options = {} )
    {
        return this.create( { accessId, refreshId, sessionId, userId, clientId }, options );
    };

    static revokePreviousTokensAndSaveNewToken( { accessId, refreshId, sessionId, userId, clientId } )
    {
        return this.sequelize.transaction(async (transaction) => {
            await this.revokeAllTokens(userId, { transaction });
            return this.saveToken( { accessId, refreshId, sessionId, userId, clientId }, { transaction } );
        })
    }

    static async validateToken( { tokenId, type } )
    {
        let token;
        if ( type === 'refresh' )
        {
            token = await this.findOne( { where: { refreshId: tokenId } } );
        }
        else if ( type === 'access' )
        {
            token = await this.findOne( { where: { accessId: tokenId } } );
        }
        else
        {
            throw ApiError.get("INVALID_TOKEN_TYPE");
        }
        if ( !token )
        {
            throw ApiError.get("INVALID_TOKEN");
        }
        return token;
    };

    static revokeToken( refreshId, options = {} )
    {
        return this.destroy( { where: { refreshId }, ...options } );
    };

    static async revokeAllTokens( userId, options = {} )
    {
        const tokens = await this.findAll({ where: { userId }, attributes: [ 'id' ] });
        const ids = tokens.map( token => token.id );
        if (ids.length === 0)
        {
            return;
        }
        return this.destroy( { where: { id: { [ Sequelize.Op.in ]: ids } }, ...options } );
    };

    static revokeSession( sessionId, options = {} )
    {
        return this.destroy( { where: { sessionId }, ...options } );
    };

    static saveAndRevokeTokens( { prevRefreshId, accessId, refreshId, sessionId, userId, clientId } )
    {
        return this
            .sequelize
            .transaction( async ( transaction ) =>
            {
                await this.revokeToken(prevRefreshId, { transaction });
                return this
                    .saveToken({ accessId, refreshId, userId, sessionId, clientId }, { transaction }); 
            } )
    }
}

module.exports = Token;
