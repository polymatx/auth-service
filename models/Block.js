const Sequelize = require ( 'sequelize' );
const Model = Sequelize.Model;

class Block extends Model
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
                userId: {
                    type: types.BIGINT,
                    allowNull: false,
                    references: {
                        model: "users",
                        key: "id"
                    }
                },
                description: {
                    type: types.TEXT,
                    allowNull: true
                },
                active: {
                    type: types.BOOLEAN,
                    allowNull: false
                },
                block_ends_at: {
                    type: types.DATE,
                    allowNull: true
                },
                createdAt: {
                    type: types.DATE,
                    allowNull: true
                },
                updatedAt: {
                    type: types.DATE,
                    allowNull: true
                },
                deletedAt: {
                    type: types.DATE,
                    allowNull: true
                }
            },
            {
                sequelize,
                underscored: true,
                tableName: 'blocks',
                timestamps: true
            } );
    }
}

module.exports = Block;
