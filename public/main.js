import { denormalizedMensajes } from "./normalizrFront.js";
const socket = io();
const divProductos = document.getElementById('divProductos');
const formProducto = document.getElementById('formProducto');
const inputNombreProducto = document.getElementById('nombre');
const inputPrecioProducto = document.getElementById('precio');
const inputFotoUrlProducto = document.getElementById('fotoUrl');
const divMensajes = document.getElementById('divMensajes');
const formMensajes = document.getElementById('formMensajes');
const inputEmail = document.getElementById('email');
const inputNombre = document.getElementById('nombreAutor');
const inputApellido = document.getElementById('apellido');
const inputEdad = document.getElementById('edad');
const inputAlias = document.getElementById('alias');
const inputAvatar = document.getElementById('avatar');
const inputMensaje = document.getElementById('mensaje');
const h4TextCompresion = document.getElementById('textCompresion');

//Renderiza los productos recibidos en el HTML
const renderProductos = (data) => {
    let html = `
                {{#if productos }}
                    <div class="table-responsive">
                        <table class="table table-dark">
                            <tr class="text-warning">
                                <th class="font-weight-bold">Nombre</th>
                                <th class="font-weight-bold">Precio</th>
                                <th class="font-weight-bold">Foto</th>
                            </tr>
                            {{#each productos }}
                                <tr>
                                    <td> {{ title }}</td>
                                    <td> {{ price }}</td>
                                    <td> <img src="{{ thumbnail }}" alt="{{ title }}" width="100" height="100"> </td>
                                </tr>
                            {{/each }}
                        </table>
                    </div>
                {{else }}
                    <h3 class="alert alert-warning">No se encontraron productos</h3>
                {{/if}}
    `;
    const template = Handlebars.compile(html);
    if (divProductos) {
        divProductos.innerHTML = template({ productos: data });
    }
};

//Renderiza los mensajes recibidos en el HTML
const renderMensajes = (data) => {
    let html = `
                <div>
                {{#each mensajes }}
                    <div>
                        <span style="font-weight: bold;color: blue;">{{ author.id }}</span>
                        <span style="color: brown;"> [{{ time }}]: </span>
                        <span style="font-style: italic;color: green;"> {{ text }}</span>
                        <span><img src="{{ author.avatar }}" style="clip-path: circle();" alt="{{ author.avatar }}" width="50" height="50"></span>
                    </div>
                {{/each }}
                </div>
    `;
    const template = Handlebars.compile(html);
    if (divMensajes) {
        divMensajes.innerHTML = template({ mensajes: data });
    }
};

//Renderiza el porcentaje de compresión en el HTML
const renderPorcentajeCompresion = (data) => {
    let html = `(compresión: {{ porcentaje }}%)`
    const template = Handlebars.compile(html);
    if (h4TextCompresion) {
        h4TextCompresion.innerHTML = template({ porcentaje: data });
    }
}

//Escuchamos cuando hay una actualización de la tabla productos y renderizamos el HTML
socket.on('actualiza-productos', (productos) => {
    renderProductos(productos);
});

//Escuchamos cuando hay una actualización de mensajes y renderizamos el HTML
socket.on('actualiza-mensajes', (mensajesNormalizado) => {
    const mensajes = denormalizedMensajes(mensajesNormalizado);

    const porcentajeCompresion = JSON.stringify(mensajesNormalizado).length * 100 / JSON.stringify(mensajes).length;
    renderPorcentajeCompresion(porcentajeCompresion.toFixed(2));

    renderMensajes(mensajes.mensajes);
});

//Enviamos el nuevo producto al servidor a través del submit
if (formProducto) {
    formProducto.addEventListener('submit', (e) => {
        e.preventDefault(); //para que no se recargue la página cuando enviamos el mensaje
        const nuevoProducto = { title: inputNombreProducto.value, price: inputPrecioProducto.value, thumbnail: inputFotoUrlProducto.value }; //Creamos objeto con los datos cargados en el form
        socket.emit('nuevo-producto', nuevoProducto); //Enviamos mensaje al server

        inputNombreProducto.value = ""; //Blanqueamos el campo una vez enviado el mensaje
        inputPrecioProducto.value = "";
        inputFotoUrlProducto.value = "";
    });
}

//Enviamos el nuevo mensaje al servidor a través del submit
if (formMensajes) {
    formMensajes.addEventListener('submit', (e) => {
        e.preventDefault(); //para que no se recargue la página cuando enviamos el mensaje

        //Creamos objeto con los datos cargados en el form
        const nuevoMensaje = {
            author: {
                id: inputEmail.value,
                nombre: inputNombre.value,
                apellido: inputApellido.value,
                edad: inputEdad.value,
                alias: inputAlias.value,
                avatar: inputAvatar.value
            },
            text: inputMensaje.value
        };
        socket.emit('nuevo-mensaje', nuevoMensaje); //Enviamos mensaje al server

        inputMensaje.value = ""; //Blanqueamos el campo una vez enviado el mensaje
    });
}