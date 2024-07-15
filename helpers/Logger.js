const {createLogger, format, transports, config} = require('winston');

const Logger = createLogger({
    transports: [
        new transports.Console()
    ]
});

module.exports = Logger;
