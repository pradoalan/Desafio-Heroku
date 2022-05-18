const mongoose = require('mongoose');
const configDB = require('../../db/config');
const logger = require('../../logger/index');

const DATABASE = 'desafioClase26';
const URI = configDB.mongodb.connectTo(DATABASE);

class ContenedorMongoose {
    constructor(collection, schema) {
        this.model = mongoose.model(collection, schema);
    }

    async conectarDB () {
        await mongoose.connect(URI);
    }

    async desconectarDB () {
        await mongoose.disconnect();
    }

    async save(objeto) {
        //Recibe un objeto, lo guarda en la BD y devuelve el item generado
        let newItem = {};

        if (objeto['productos'] != undefined && objeto['productos'].length === 0) {
            objeto = {};
        }
        
        try {
            await this.conectarDB();
            newItem = await this.model.create(objeto);
            await this.desconectarDB();
        } catch (err) {
            //console.log(`Hubo un error al guardar: ${err.message}`);
            logger.error(`Hubo un error al guardar: ${err.message}`);
            return -1;
        }

        return newItem;
    }

    async update(id, objeto) {
        //Recibe un id y objeto, lo actualiza y devuelve el item actualizado
        let updatedItem = {};

        try {
            await this.conectarDB();
            updatedItem = await this.model.findByIdAndUpdate({_id: id}, objeto, {new: true});
            await this.desconectarDB();
        } catch (err) {
            //console.log(`Hubo un error al modificar: ${err.message}`);
            logger.error(`Hubo un error al modificar: ${err.message}`);
            return -1;
        }

        return updatedItem;
    }

    async getById(id) {
        //Recibe un id y devuelve el objeto con ese id o null si no está
        let objeto = null;

        //Verifica que el id recibido sea un ObjectId válido
        if (!mongoose.isValidObjectId(id)) {
            return null;
        }

        try {
            await this.conectarDB();
            objeto = await this.model.findOne({_id: id}, {__v: 0});
            await this.desconectarDB();
        } catch (err) {
            //console.log(`Hubo un error al obtener el item: ${err.message}`);
            logger.error(`Hubo un error al obtener el item: ${err.message}`);
            return -1;
        }

        return objeto;
    }

    async getAll() {
        //Devuelve un array con los objetos presentes en la BD
        let arrayObjetos = [];

        try {
            await this.conectarDB();
            arrayObjetos = await this.model.find({}, {__v: 0}).lean();
            await this.desconectarDB();
        } catch (err) {
            //console.log(`Hubo un error al obtener todos los items: ${err.message}`);
            logger.error(`Hubo un error al obtener todos los items: ${err.message}`);
            return -1;
        }

        return arrayObjetos;
    }

    async deleteById(id) {
        //Elimina del archivo el objeto con el id buscado

        try {
            await this.conectarDB();
            await this.model.deleteOne({_id: id});
            await this.desconectarDB();
        } catch (err) {
            //console.log(`Hubo un error al eliminar: ${err.message}`);
            logger.error(`Hubo un error al eliminar: ${err.message}`);
            return false;
        }

        return true;
    }

    async addItemToArray(nombreArray, objeto, item) {
        //Agrega item a un array del objeto, devuelve true/false si el item fue agregado o no

        try {
            objeto[nombreArray].push(item);

            await this.conectarDB();
            await this.model.findByIdAndUpdate({_id: objeto.id}, objeto, {new: true});
            await this.desconectarDB();
        } catch (err) {
            //console.log(`Hubo un error al agregar el item al array: ${err.message}`);
            logger.error(`Hubo un error al agregar el item al array: ${err.message}`);
            return false;
        }

        return true;
    }

    async removeItemFromArray(nombreArray, objeto, item) {
        //Elimina item de un array del objeto, devuelve true/false si el item fue eliminado o no
        //Si no existe el item en el array devuelve -1

        try {

            const itemIndexEliminar = objeto[nombreArray].findIndex(elemento => elemento._id.toString() == item._id.toString());
            if (itemIndexEliminar === -1) {
                return -1;
            }
            objeto[nombreArray].splice(itemIndexEliminar, 1);
            
            await this.conectarDB();
            await this.model.findByIdAndUpdate({_id: objeto.id}, objeto, {new: true});
            await this.desconectarDB();
        } catch (err) {
            //console.log(`Hubo un error al eliminar el item del array: ${err.message}`);
            logger.error(`Hubo un error al eliminar el item del array: ${err.message}`);
            return false;
        }

        return true;
    }
}

module.exports = ContenedorMongoose;