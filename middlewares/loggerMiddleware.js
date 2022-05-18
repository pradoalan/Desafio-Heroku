const logger = require('../logger/index');

const loggerMiddleware =  (req, res, next) => {
    logger.info(`[${req.method}] => ${req.originalUrl}`);

    next();//para que se ejecute la siguiente instrucción
};

module.exports = loggerMiddleware;