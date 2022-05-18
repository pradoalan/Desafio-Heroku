const dbconfig = require('./config');
const knex = require('knex')(dbconfig.mariaDB);

(async () => {
    try {

        //CREATE TABLE IF NOT EXIST...replica en Knex
        const tableExist = await knex.schema.hasTable('productos');
        if (!tableExist) {
            await knex.schema.createTable('productos', (table) => {
                table.increments('id');
                table.string('title').notNullable();
                table.decimal('price', 13, 2).unsigned();
                table.string('thumbnail');
            });
            console.log('Tabla "productos" creada!');
        } else {
            console.log('La tabla "productos" ya existe');
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
