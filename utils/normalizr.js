const { normalize, denormalize, schema } = require('normalizr');

//Esquema para entidad Author
const authorSchema = new schema.Entity('author');

//Esquema para entidad Mensaje
const mensajeSchema = new schema.Entity('mensaje', {
    author: authorSchema
});

//Esquema para entidad Mensajes
const mensajesSchema = new schema.Entity('mensajes', {
    mensajes: [mensajeSchema]
});

//Objeto normalizado
const normalizedMensajes = (objeto) => {
    return normalize(objeto, mensajesSchema);
}

//Objeto denormalizado
const denormalizedMensajes = (objeto) => {
    return denormalize(objeto.result, mensajesSchema, objeto.entities);
    
}

module.exports = {
    normalizedMensajes,
    denormalizedMensajes
}