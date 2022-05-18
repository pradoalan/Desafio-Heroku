const dbconfig = require('./config');
const knex = require('knex')(dbconfig.sqlite);

(async () => {
    try {

        //CREATE TABLE IF NOT EXIST...replica en Knex
        const tableExist = await knex.schema.hasTable('mensajes');
        if (!tableExist) {
            await knex.schema.createTable('mensajes', (table) => {
                table.increments('id');
                table.string('email').notNullable();
                table.string('mensaje').notNullable();
                table.datetime('time').notNullable();
            });
            console.log('Tabla "mensajes" creada!');
        } else {
            console.log('La tabla "mensajes" ya existe');
        }
        
    } catch (error) {
        console.log(error);
        throw error;
    }
    finally {
        //Finaliza la conexión con la BD
        knex.destroy();
    }
})();
