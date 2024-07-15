const agent = require( 'supertest' );
const { describe, it, before, after } = require( 'mocha' );
const { checkKeys, migrateUp, migrateDown } = require( '../helpers' );
const { sequelize: { config: mysqlConfig }, server: { config: server } } = require( '../../config' );
const setup = require( '../../app' );
const request = agent( `${ server.host }:${ server.port }` );

const TEST_USERNAME = 'username_test', TEST_PASSWORD = '12345678', TEST_EMAIL = 'test@test.test', TEST_PHONE_NUMBER = '+1234567890';

let clientId, clientSecret, accessToken, refreshToken, newAccessToken, newRefreshToken;

describe( 'auth controller tests', () =>
{
    before( async () =>
    {
        await migrateDown( mysqlConfig );
        await migrateUp( mysqlConfig );
        await setup.run();
    } );

    after( async () =>
    {
        await migrateDown( mysqlConfig );
    } );

    describe( 'client tests', () =>
    {
        it( 'should create client successfully', ( done ) =>
        {
            request
                .post( '/trusted/client' )
                .send( {
                    applicationName: 'test_application_name',
                    grants: [ 'password' ]
                } )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'applicationName', 'grants', 'clientId', 'clientSecret' ] ) )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    clientId = res.body.clientId;
                    clientSecret = res.body.clientSecret;
                    done();
                } )
        } );

        it( 'should error if application name is duplicate', ( done ) =>
        {
            request
                .post( '/trusted/client' )
                .send( {
                    applicationName: 'test_application_name',
                    grants: [ 'password' ]
                } )
                .expect( 409 )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should error if application name is missing', ( done ) =>
        {
            request
                .post( '/trusted/client' )
                .send( {
                    grants: [ 'password' ]
                } )
                .expect( 422 )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should error if grants is missing', ( done ) =>
        {
            request
                .post( '/trusted/client' )
                .send( {
                    applicationName: 'test_application_name'
                } )
                .expect( 422 )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should error if grants is wrong', ( done ) =>
        {
            request
                .post( '/trusted/client' )
                .send( {
                    applicationName: 'test_application_name',
                    grants: [ 'authorization_code' ]
                } )
                .expect( 400 )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );
    } );

    describe( 'user tests', () =>
    {
        it( 'should create user successfully.', ( done ) =>
        {
            request
                .post( '/register' )
                .send( {
                    username: TEST_USERNAME,
                    email: TEST_EMAIL,
                    mobile: TEST_PHONE_NUMBER,
                    password: TEST_PASSWORD,
                    passwordConfirmation: TEST_PASSWORD
                } )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'id', 'username', 'email' ] ) )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );
    } );

    describe( 'token tests', () =>
    {
        it( 'should get token with correct credentials successfully (with username).', ( done ) =>
        {
            request
                .post( '/oauth/token' )
                .send( {
                    grant_type: 'password',
                    username: TEST_USERNAME,
                    password: TEST_PASSWORD,
                    client_id: clientId,
                    client_secret: clientSecret
                } )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'access_token', 'refresh_token', 'expires_at' ] ) )
                .end( ( err, res ) =>
                {
                    accessToken = res.body.access_token;
                    refreshToken = res.body.refresh_token;
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should get token with correct credentials successfully (with email).', ( done ) =>
        {
            request
                .post( '/oauth/token' )
                .send( {
                    grant_type: 'password',
                    username: TEST_EMAIL,
                    password: TEST_PASSWORD,
                    client_id: clientId,
                    client_secret: clientSecret
                } )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'access_token', 'refresh_token', 'expires_at' ] ) )
                .end( ( err, res ) =>
                {
                    accessToken = res.body.access_token;
                    refreshToken = res.body.refresh_token;
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should get token with correct credentials successfully (with phone).', ( done ) =>
        {
            request
                .post( '/oauth/token' )
                .send( {
                    grant_type: 'password',
                    username: TEST_PHONE_NUMBER,
                    password: TEST_PASSWORD,
                    client_id: clientId,
                    client_secret: clientSecret
                } )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'access_token', 'refresh_token', 'expires_at' ] ) )
                .end( ( err, res ) =>
                {
                    accessToken = res.body.access_token;
                    refreshToken = res.body.refresh_token;
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should be able to get user with correct access token.', ( done ) =>
        {
            request
                .get( '/check' )
                .set( 'Authorization', `Bearer ${ accessToken }` )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'id', 'username', 'email' ] ) )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should be able to refresh token with correct refresh token.', ( done ) =>
        {
            request
                .post( '/oauth/token' )
                .send( {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: clientId,
                    client_secret: clientSecret
                } )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'access_token', 'refresh_token', 'expires_at' ] ) )
                .end( ( err, res ) =>
                {
                    newAccessToken = res.body.access_token;
                    newRefreshToken = res.body.refresh_token;

                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should not be able to get user with old access token.', ( done ) =>
        {
            request
                .get( '/check' )
                .set( 'Authorization', `Bearer ${ accessToken }` )
                .expect( 401 )
                .end( ( err, res ) =>
                {
                    console.log("ERR", err)
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should be able to get user with new access token.', ( done ) =>
        {
            request
                .get( '/check' )
                .set( 'Authorization', `Bearer ${ newAccessToken }` )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'id', 'username', 'email' ] ) )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should not be able to refresh token with revoked refresh token.', ( done ) =>
        {
            request
                .post( '/oauth/token' )
                .send( {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: clientId,
                    client_secret: clientSecret
                } )
                .expect( 401 )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );

        it( 'should be able to refresh token with new refresh token.', ( done ) =>
        {
            request
                .post( '/oauth/token' )
                .send( {
                    grant_type: 'refresh_token',
                    refresh_token: newRefreshToken,
                    client_id: clientId,
                    client_secret: clientSecret
                } )
                .expect( 200 )
                .expect( ( { body } ) => checkKeys( body, [ 'access_token', 'refresh_token', 'expires_at' ] ) )
                .end( ( err, res ) =>
                {
                    if ( err )
                    {
                        return done( err );
                    }
                    done();
                } )
        } );
    } )

} );
