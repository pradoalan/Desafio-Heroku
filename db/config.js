const path = require('path');
const env = require('../env.config');

module.exports = {
    mariaDB: {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'test'
        }
    },
    sqlite: {
        client: 'sqlite3',
        connection: {
            filename: path.resolve(__dirname, './ecommerce.sqlite')
        }
    },
    mongodb: {
        connectTo: (database) => `mongodb+srv://alanprado:${env.DB_PASSWORD}@cluster0.avtxj.mongodb.net/${database}?retryWrites=true&w=majority`, 
    }
}