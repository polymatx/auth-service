const {debug} = global._.config;
const Express = require('express');
const bodyParser = require('body-parser');
const AuthRouter = require('../routers/AuthRouter');
const HealthRouter = require('../routers/HealthRouter');
const {OAuth2Server} = require('../oauth/OAuthServer');
const {config: {server: {config}}} = global._;
const middlewareSetup = require('./MiddlewareSetup');
const passport = require('passport');
const helmet = require('helmet');
const i18n = require( '../config/i18n' );

function run() {
    return new Promise(async (resolve) => {
        const dd_options = {
            'response_code': true,
            // 'tags': ['app:my_app']
        };

        const connect_datadog = require('connect-datadog')(dd_options);

        const app = Express();
        app.use(helmet());
        app.use(bodyParser.json());
        await middlewareSetup.run(app);
        const router = Express.Router();
        app.oauth2 = router.oauth2 = OAuth2Server;
        app.use(passport.initialize());
        AuthRouter(router);
        HealthRouter(router);

        app.use(connect_datadog);

        // i18n
        app.use(i18n.init)

        app.use(router);
        const server = app.listen(config.port, config.host, function () {
            debug.log(`Server listening on ${config.host}:${config.port}`);
            return resolve({app, server});
        });
    });
}

module.exports = {
    run
};
