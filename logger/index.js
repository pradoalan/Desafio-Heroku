const winston = require('winston');

//Para filtrar sólo los mensajes "error"
const errorFilter = winston.format((info, opts) => { 
	return info.level === 'error' ? info : false 
});

//Para filtrar sólo los mensajes "warn"
const warnFilter = winston.format((info, opts) => { 
	return info.level === 'warn' ? info : false 
});

const logger = winston.createLogger({
    level: 'info',  //nivel por defecto, luego se puede definir un nivel por cada "transport"
    transports: [   //definición de las salidas de los distintos logs por nivel
        new winston.transports.Console({
            level: 'info', //niveles: Silly, Debug, Verbose, Info, Warn, Error (de menor a mayor)
            format: winston.format.combine( //Para darle formato de texto a las salidas. Combina múltiples formatos
            winston.format.colorize({   //Para dar color a la salida por nivel
                all: true,
                colors: {
                    info: 'blue',
                    warn: 'yellow',
                    error: 'red'
                }
            }),
            winston.format.align(),     //Para alinear el texto de salida
            winston.format.timestamp(), //Para guardar el timestamp
            winston.format.printf(info => `${info.timestamp} [${info.level}] => ${info.message}`) //Para setear el formato de la salida
        ),
        }),
        new winston.transports.File({
            level: 'warn',
            filename: './logger/warn.log',
            format: winston.format.combine(
                warnFilter(),
                winston.format.align(),
                winston.format.timestamp(),
                winston.format.printf(i => `${i.timestamp} [${i.level}] => ${i.message}`)
            ),
        }),
        new winston.transports.File({
            level: 'error',
            filename: './logger/error.log',
            format: winston.format.combine(
                errorFilter(),
                winston.format.align(),
                winston.format.timestamp(),
                winston.format.printf(i => `${i.timestamp} [${i.level}] => ${i.message}`)
            ),
        })
    ]
});

module.exports = logger;