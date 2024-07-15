const { omit } = require ( 'lodash' );
const bcrypt = require ( 'bcrypt' );
const Sequelize = require ( 'sequelize' );
const Model = Sequelize.Model;
const { config } = global._;
const { detectLoginType } = require ( '../helpers/Utility' );
const {ApiError} = require('../helpers/Errors');
const Block = require( './Block' );

class User extends Model
{
    static init ( sequelize, types )
    {
        return super.init ( {
                id: {
                    type: types.BIGINT,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                username: {
                    type: types.STRING ( 255 ),
                    allowNull: false,
                    unique: true
                },
                email: {
                    type: types.STRING ( 255 ),
                    allowNull: false
                },
                mobile: {
                    type: types.STRING ( 255 ),
                    allowNull: true
                },
                password: {
                    type: types.STRING ( 255 ),
                    allowNull: true
                },
                rememberToken: {
                    type: types.STRING ( 255 ),
                    allowNull: true
                },
                mobile_verified_at: {
                    type: types.STRING ( ),
                    allowNull: true,
                },
                email_verified_at: {
                    type: types.STRING ( ),
                    allowNull: true,
                },
                ip: {
                    type: types.STRING,
                    allowNull: true
                },
                country: {
                    type: types.STRING,
                    allowNull: true
                },
                platform: {
                    type: types.ENUM ( 'android', 'ios', 'other' ),
                    allowNull: true
                },
                verify: {
                    type: types.INTEGER ( 1 ),
                    allowNull: true,
                    defaultValue: '0'
                },
                block: {
                    type: types.INTEGER ( 1 ),
                    defaultValue: '0'
                },
                has_profile: {
                    type: types.INTEGER ( 1 ),
                    defaultValue: '0'
                }
            },
            {
                sequelize,
                underscored: true,
                tableName: 'users',
                timestamps: true,
                paranoid: true
            } );
    }

    static async createUser ( { username, email, mobile, password } )
    {
        const hashedPassword = await bcrypt.hash ( password, config.security.bcryptSaltRounds );
        const { id } = await this.create ( { username, email, mobile, password: hashedPassword, verify: 1 } );
        return { id, username, email, mobile };
    };

    static async findUserByEmail ( email )
    {
        const user = await this.findOne ( { where: { email } } );
        if ( !user )
        {
            throw ApiError.get("USER_NOT_FOUND");
            
        }
        return omit ( user.toJSON (), [ 'password' ] )
    };

    static async findUserById ( userId )
    {
        const user = await this.findByPk ( userId );
        if ( !user )
        {
            throw ApiError.get("USER_NOT_FOUND");
        }
        return omit ( user.toJSON (), [ 'password' ] )
    };

    static async authenticateUser ( { username, password } )
    {
        const identityType = detectLoginType ( username );
        const user = await this.findOne ( { where: { [ identityType ]: username } } );
        if ( !user )
        {
            throw ApiError.get("USER_NOT_FOUND");
        }

        const result = await bcrypt.compare ( password, user.password );
        if ( !result )
        {
            throw ApiError.get("WRONG_CREDENTIALS");
        }

        if ( !user.verify )
        {
            throw ApiError.get("USER_NOT_VERIFIED");
        }

        if ( user.block )
        {
            const block = await Block.findOne ( { where: { user_id: user.id, deleted_at: null } } );

            let message = 'Your SCOVR account has been suspended for the following reason: \n ' +
                            block.description +
                            ' \n ' +
                            'Please contact help@scovr.com to appeal that decision.'

            throw ApiError.get("USER_HAS_BEEN_BLOCK", message);
        }

        return omit ( user.toJSON (), [ 'password' ] )
    };
}

module.exports = User;
