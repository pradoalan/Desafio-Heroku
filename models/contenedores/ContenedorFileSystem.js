const logger = require('../../logger/index');

class ContenedorFileSystem {
    constructor(nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
        this.fs = require('fs');
    }

    async save(objeto) {
        //Recibe un objeto, lo guarda en el archivo y devuelve el item creado
        let id = 1;

        try {
            const objetosTxt = await this.fs.promises.readFile(`./models/${this.nombreArchivo}`, 'utf-8');
            let arrayObjetos = [];

            if (objetosTxt.length > 0 && objetosTxt != '[]') {
                arrayObjetos = JSON.parse(objetosTxt);
                id = arrayObjetos[arrayObjetos.length - 1].id + 1;
            }

            objeto.time = new Date();
            objeto.id = id;
            arrayObjetos.push(objeto);
            await this.fs.promises.writeFile(`./models/${this.nombreArchivo}`, JSON.stringify(arrayObjetos, null, 2));

        } catch (err) {
            //console.log(`Hubo un error al guardar: ${err.message}`);
            logger.error(`Hubo un error al guardar: ${err.message}`);
            return -1;
        }

        return objeto;
    }

    async update(id, objeto) {
        //Recibe un id y objeto, lo busca en el archivo, actualiza y devuelve el item actualizado
        objeto.timestamp = new Date();
        objeto.id = +id;

        try {
            const objetosTxt = await this.fs.promises.readFile(`./models/${this.nombreArchivo}`, 'utf-8');
            let arrayObjetos = [];

            if (objetosTxt.length > 0 && objetosTxt != '[]') {
                arrayObjetos = JSON.parse(objetosTxt);

                const itemIndex = arrayObjetos.findIndex(item => item.id === +id);
                arrayObjetos[itemIndex] = objeto;

                await this.fs.promises.writeFile(`./models/${this.nombreArchivo}`, JSON.stringify(arrayObjetos, null, 2));
            }
        } catch (err) {
            //console.log(`Hubo un error al modificar: ${err.message}`);
            logger.error(`Hubo un error al modificar: ${err.message}`);
            return -1;
        }

        return objeto;
    }

    async getById(id) {
        //Recibe un id y devuelve el objeto con ese id o null si no está
        let objeto = null;

        try {
            const objetosTxt = await this.fs.promises.readFile(`./models/${this.nombreArchivo}`, 'utf-8');
            let arrayObjetos = [];

            if (objetosTxt.length > 0 && objetosTxt != '[]') {
                arrayObjetos = JSON.parse(objetosTxt);

                for (const obj of arrayObjetos) {
                    if (obj.id == id) {
                        objeto = obj;
                    }
                }
            }
        } catch (err) {
            //Si entra al catch porque no existe el archivo, no muestro error...devuelve array vacío
            //Sólo muestro el error si se debe a otro problema
            if (err.code != 'ENOENT') {
                //console.log(`Hubo un error al obtener el objeto: ${err.message}`);
                logger.error(`Hubo un error al obtener el objeto: ${err.message}`);
                return -1;
            }
        }

        return objeto;
    }

    async getAll() {
        //Devuelve un array con los objetos presentes en el archivo
        let arrayObjetos = [];

        try {
            const objetosTxt = await this.fs.promises.readFile(`./models/${this.nombreArchivo}`, 'utf-8');

            if (objetosTxt.length > 0 && objetosTxt != '[]') {
                arrayObjetos = JSON.parse(objetosTxt);
            }
        } catch (err) {
            //Si entra al catch porque no existe el archivo, no muestro error...devuelve array vacío
            //Sólo muestro el error si se debe a otro problema
            if (err.code != 'ENOENT') {
                //console.log(`Hubo un error al obtener todos los objetos: ${err.message}`);
                logger.error(`Hubo un error al obtener todos los objetos: ${err.message}`);
                return -1;
            }
        }

        return arrayObjetos;
    }

    async deleteById(id) {
        //Elimina del archivo el objeto con el id buscado
        let eliminado = false;
        
        try {
            const objetosTxt = await this.fs.promises.readFile(`./models/${this.nombreArchivo}`, 'utf-8');
            let arrayObjetos = [];

            if (objetosTxt.length > 0 && objetosTxt != '[]') {
                arrayObjetos = JSON.parse(objetosTxt);

                for (let i = 0; i < arrayObjetos.length; i++) {
                    if (arrayObjetos[i].id == id) {
                        arrayObjetos.splice(i, 1);
                        await this.fs.promises.writeFile(`./models/${this.nombreArchivo}`, JSON.stringify(arrayObjetos, null, 2));
                        eliminado = true;
                    }
                }
            }
        } catch (err) {
            //console.log(`Hubo un error al eliminar el objeto: ${err.message}`);
            logger.error(`Hubo un error al eliminar el objeto: ${err.message}`);
        }

        return eliminado;
    }

    async addItemToArray(nombreArray, objeto, item) {
        //Agrega item a un array del objeto, devuelve true/false si el item fue agregado o no

        try {

            objeto[nombreArray].push(item);
            
            const objetosTxt = await this.fs.promises.readFile(`./models/${this.nombreArchivo}`, 'utf-8');
            let arrayObjetos = [];

            if (objetosTxt.length > 0 && objetosTxt != '[]') {
                arrayObjetos = JSON.parse(objetosTxt);

                const itemIndex = arrayObjetos.findIndex(elemento => elemento.id === objeto.id);
                arrayObjetos[itemIndex] = objeto;

                await this.fs.promises.writeFile(`./models/${this.nombreArchivo}`, JSON.stringify(arrayObjetos, null, 2));
            }
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

            const itemIndexEliminar = objeto[nombreArray].findIndex(elemento => elemento.id === item.id);
            if (itemIndexEliminar === -1) {
                return -1;
            }
            objeto[nombreArray].splice(itemIndexEliminar, 1);
            
            const objetosTxt = await this.fs.promises.readFile(`./models/${this.nombreArchivo}`, 'utf-8');
            let arrayObjetos = [];

            if (objetosTxt.length > 0 && objetosTxt != '[]') {
                arrayObjetos = JSON.parse(objetosTxt);

                const itemIndex = arrayObjetos.findIndex(elemento => elemento.id === objeto.id);
                arrayObjetos[itemIndex] = objeto;

                await this.fs.promises.writeFile(`./models/${this.nombreArchivo}`, JSON.stringify(arrayObjetos, null, 2));
            }
        } catch (err) {
            //console.log(`Hubo un error al eliminar el item del array: ${err.message}`);
            logger.error(`Hubo un error al eliminar el item del array: ${err.message}`);
            return false;
        }

        return true;
    }
}

module.exports = ContenedorFileSystem;