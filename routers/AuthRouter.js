const AuthController = require('../controllers/AuthController');
const {UserRegisterValidator, GenerateClientValidator} = require('../helpers/validators');

module.exports = function ( router )
{
    router.post( '/register', UserRegisterValidator, AuthController.register );
    router.post( '/trusted/client', GenerateClientValidator, AuthController.internalAuthentication, AuthController.generateClient );
    router.get( '/trusted/client/:applicationName', AuthController.internalAuthentication, AuthController.getClientDetail );
    router.post( '/trusted/user/token', AuthController.internalAuthentication, AuthController.getUserToken );

    router.post( '/oauth/token', [ AuthController.clientPasswordStrategy, router.oauth2.token(), AuthController.tokenErrorHandler ] );
    router.get( '/check', AuthController.bearerStrategy, AuthController.check );
    router.get( '/user', AuthController.bearerStrategy, AuthController.user );
    router.post('/logout', AuthController.bearerStrategy, AuthController.logout);
};
