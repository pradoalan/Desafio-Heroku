const logger = require('../../logger/index');

class Contenedor {
  constructor(configDB, tabla) {
    this.configDB = configDB;
    this.tabla = tabla;
    this.knex = require('knex')(configDB);
  }

  async getAll() {
    const regs = await this.knex.from(this.tabla).select('*');
    return regs;
  }

  async getById(objetoId) {
    const data = await this.knex.from(this.tabla).select('*').where('id', '=', objetoId)
    return data;
  }

  async saveProduct(title, price, thumbnail) {
    if (!title || !price || !thumbnail) {
      //console.log('No es posible agregar el producto. Parámetros incorrectos.');
      logger.error('No es posible agregar el producto. Parámetros incorrectos.');
      return false;
    }

    const newProduct = {
      title,
      price,
      thumbnail
    }

    try {
      await this.knex(this.tabla).insert(newProduct);
      return true;
    } catch (error) {
      //console.log(`No es posible agregar el producto. Error: ${error}`);
      logger.error(`No es posible agregar el producto. Error: ${error}`);
      return false;
    }
  }

  async saveMessage(msj) {

    if (!msj.email || !msj.mensaje || !msj.time) {
      //console.log('No es posible agregar el mensaje. Parámetros incorrectos.');
      logger.error('No es posible agregar el mensaje. Parámetros incorrectos.');
      return false;
    }

    try {
      await this.knex(this.tabla).insert(msj);
      return true;
    } catch (error) {
      //console.log(`No es posible agregar el mensaje. Error: ${error}`);
      logger.error(`No es posible agregar el mensaje. Error: ${error}`);
      return false;
    }
  }

  async updateProduct(producto, productoIndex) {
    if (!productoIndex) {
      //console.log('No es posible actualizar el producto. Indice nulo.');
      logger.error('No es posible actualizar el producto. Indice nulo.');
      return false;
    }

    const { title, price, thumbnail } = producto;

    if (!title || !price || !thumbnail) {
      //console.log('No es posible actualizar el producto. Parámetros incorrectos.');
      logger.error('No es posible actualizar el producto. Parámetros incorrectos.');
      return false;
    }

    try {
      await this.knex.from(this.tabla).where({id: productoIndex}).update(producto);
      return true;
    } catch (error) {
      //console.log(`No es posible actualizar el producto. Error: ${error}`);
      logger.error(`No es posible actualizar el producto. Error: ${error}`);
      return false;
    }
  }

  async updateMessage(msj, mensajeIndex) {
    if (!mensajeIndex) {
      //console.log('No es posible actualizar el mensaje. Indice nulo.');
      logger.error('No es posible actualizar el mensaje. Indice nulo.');
      return false;
    }

    const { email, mensaje, time } = msj;

    if (!email || !mensaje || !time) {
      //console.log('No es posible actualizar el mensaje. Parámetros incorrectos.');
      logger.error('No es posible actualizar el mensaje. Parámetros incorrectos.');
      return false;
    }

    try {
      await this.knex.from(this.tabla).where({id: mensajeIndex}).update(msj);
      return true;
    } catch (error) {
      //console.log(`No es posible actualizar el mensaje. Error: ${error}`);
      logger.error(`No es posible actualizar el mensaje. Error: ${error}`);
      return false;
    }
  }

  async delete(objetoIndex) {
    if (objetoIndex < 0) {
      //console.log('No es posible eliminar el elemento. Indice nulo.');
      logger.error('No es posible eliminar el elemento. Indice nulo.');
      return false;
    }
    
    try {
      await this.knex.from(this.tabla).where({id: objetoId}).del();
      return true;
    } catch (error) {
      //console.log(`No es posible eliminar el elemento. Error: ${error}`);
      logger.error(`No es posible eliminar el elemento. Error: ${error}`);
      return false;
    }
  }
}

module.exports = Contenedor