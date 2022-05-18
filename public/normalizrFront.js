//Esquema para entidad Author
const authorSchema = new normalizr.schema.Entity('author');

//Esquema para entidad Mensaje
const mensajeSchema = new normalizr.schema.Entity('mensaje', {
    author: authorSchema
});

//Esquema para entidad Mensajes
const mensajesSchema = new normalizr.schema.Entity('mensajes', {
    mensajes: [mensajeSchema]
});

//Objeto normalizado
export const normalizedMensajes = (objeto) => {
    return normalize(objeto, mensajesSchema);
}

//Objeto denormalizado
export const denormalizedMensajes = (objeto) => {
    return normalizr.denormalize(objeto.result, mensajesSchema, objeto.entities);
    
}