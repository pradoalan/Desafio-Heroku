const moment = require('moment');

const formatMessage = (email, mensaje) => {
    return {
        email,
        mensaje,
        time: moment().format('DD/MM/YYYY HH:mm:ss') 
    }
};

const generaNroAleatorio = (min, max) => {
    return Math.floor(Math.random() * (max+1 - min)) + min;
};

module.exports = {
    formatMessage,
    generaNroAleatorio
};