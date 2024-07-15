module.exports = {
    apps: [
        {
            name: `auth-service-${ process.env.NODE_ENV || 'env' }-master`,
            script: "./app-master.js",
            instances: 1,
            autorestart: true
        },
        {
            name: `auth-service-${ process.env.NODE_ENV || 'env' }-worker`,
            script: "./app.js",
            instances: 1,
            exec_mode: 'cluster',
            autorestart: true
        }
    ]
};
