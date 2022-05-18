//Importamos librerías
const express = require('express');
const { engine } = require("express-handlebars");
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dbConfig = require('./db/config');
const { formatMessage } = require('./utils/utils');
const { generateRandomArrayProducts } = require('./utils/faker');
const { normalizedMensajes } = require('./utils/normalizr');
const util = require('util');
const env = require('./env.config');
const passport = require('./middlewares/passport');
const yargs = require('yargs')(process.argv.slice(2));
const os = require('os');
const cluster = require('cluster');
const compression = require('compression');
const logger = require('./logger/index');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
//Para integrar Session con Mongo
const session = require('express-session');
const MongoStore = require('connect-mongo');

//Obtenemos parámetro recibido por línea de comando
//utilizando librería "yargs"
const args = yargs
  .default({
    PORT: 8080,
    MODE: 'FORK'
  })
  .alias({
    p: 'PORT',
    m: 'MODE'
  })
  .argv;

const PORT = args.PORT;
const MODE = args.MODE;
const CPU_NUMBERS = os.cpus().length;

if (MODE === 'CLUSTER' && cluster.isPrimary) {
  console.log(`I am the primary process with pid ${process.pid}!`);
  const WORK_NUMBERS = os.cpus().length;
  console.log(`Cores number => ${CPU_NUMBERS}`);

  for (let i = 0; i < WORK_NUMBERS; i++) {
    cluster.fork(); //para crear un proceso secundario
  }

  //Escuchamos cuando se detiene algún proceso y volvemos a levantar uno nuevo para seguir con 1 subproceso por núcleo
  cluster.on('exit', (worker, code) => {
    console.log(`Worker ${worker.process.pid} died :(`)
    cluster.fork();
  });
}

if (!cluster.isPrimary || MODE === 'FORK') {
  const app = express();
  const httpServer = http.createServer(app);
  const io = socketIo(httpServer);
  const nombreArchivo = "mensajesNuevoFormato.txt";

  //Importación de clase Contenedor
  const ClaseContenedorSQL = require('./models/contenedores/ContenedorSQL');
  const contenedorProductos = new ClaseContenedorSQL(dbConfig.mariaDB, 'productos');
  const ClaseContenedorFileSystem = require('./models/contenedores/ContenedorFileSystem');
  const contenedorMensajes = new ClaseContenedorFileSystem(nombreArchivo);

  //Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('./public'));
  app.use(session({
    name: 'session-desafio-34', //nombre que le doy a la cookie que utiliza la session para identificarla (por defecto se genera una cookie "connect-id" o algo así...) 
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    //Defino el Store con Mongo
    store: MongoStore.create({
      mongoUrl: dbConfig.mongodb.connectTo('sesiones')
    }),
    ttl: 600,
    //rolling: true,  //Para que el tiempo de expiración (maxAge) se refresque con cada request
    cookie: {
      maxAge: 600000
    }
  }));
  app.use(loggerMiddleware); //Implementación de loggerMiddleware a nivel aplicación

  //Para poder utilizar passport
  app.use(passport.initialize());
  app.use(passport.session());

  //Importamos index del router
  const apiRoutes = require('./routers/index')

  //Template engines
  app.engine('hbs', engine({
    //Objeto de configuración para el engine
    extname: 'hbs', //extension de la plantilla
    defaultLayout: 'main.hbs', //en donde se define el layout inicial
    layoutDir: path.resolve(__dirname, './public/layouts') //ruta absoluta donde están las vistas principales
  }));
  app.set('views', './public');
  app.set('view engine', 'hbs');

  // Routes
  app.use('/api', apiRoutes);

  //Inicio
  app.get('/', async (req, res) => {
    const user = req.user;
    if (user) {
      res.redirect('/api/productos-test');
    }
    else {
      res.redirect('/login');
    }
  });

  //Login GET
  app.get('/login', (req, res) => {
    return res.sendFile(__dirname + '/public/login.html');
  });

  //Login POST
  app.post(
    '/login',
    //Definimos la estrategia definida en middlewares/passport.js para el login
    passport.authenticate('login', { failureRedirect: '/login-error' }),
    async (_req, res, _next) => res.redirect('/api/productos-test')
  );

  //Logout
  app.post('/logout', async (req, res) => {
    try {
      const user = req.user;

      //El req.logOut() no elimina la cookie ni el registro de sesión en MongoDB
      //Se usa el session.destroy que realiza la eliminación ok 
      req.session.destroy(err => {
        res.clearCookie('session-desafio-26'); //al eliminar la cookie, se eliminan todos los datos de la session. El nombre de la cookie es la que definí en el Middleware de la Session 
        if (err) {
          console.log(err);
        }
        else {
          return res.render('logout', { nombreUsuario: user.email });
        }
      });
    }
    catch (err) {
      console.log(err);
    }
  });

  //Register GET
  app.get('/register', (req, res) => {

    return res.sendFile(__dirname + '/public/register.html');
  });

  //Register POST
  app.post(
    '/register',
    //Definimos la estrategia definida en middlewares/passport.js para el register
    passport.authenticate('register', { failureRedirect: '/register-error' }),
    async (_req, res, _next) => res.redirect('/api/productos-test')
  );

  app.get('/login-error', (req, res) => {
    return res.render('error', { textoError: 'USER ERROR LOGIN' });
  });

  app.get('/register-error', (req, res) => {
    return res.render('error', { textoError: 'USER ERROR SIGNUP' });
  });

  //Info
  app.get('/info', async (req, res) => {

    console.log(`
      * Argumentos de entrada => ${process.argv.slice(2)}
      * Path de ejecución => ${process.execPath}
      * Nombre de la plataforma (sistema operativo) => ${process.platform}
      * Process id => ${process.pid}
      * Versión de Node.js => ${process.version}
      * Carpeta del proyecto => ${process.cwd()}
      * Memoria total reservada (rss) => ${process.memoryUsage().rss}
      * Número de procesadores => ${CPU_NUMBERS}

    `);

    return res.render('info',
      {
        argsEntrada: process.argv.slice(2),
        pathEjecucion: process.execPath,
        nombrePlataforma: process.platform,
        processId: process.pid,
        versionNode: process.version,
        carpetaProyecto: process.cwd(),
        rss: process.memoryUsage().rss,
        nroProcesadores: CPU_NUMBERS
      });
  });

  //Info con gzip
  app.get('/info_zip', compression(), async (req, res) => {

    return res.render('info',
      {
        argsEntrada: process.argv.slice(2),
        pathEjecucion: process.execPath,
        nombrePlataforma: process.platform,
        processId: process.pid,
        versionNode: process.version,
        carpetaProyecto: process.cwd(),
        rss: process.memoryUsage().rss,
        nroProcesadores: CPU_NUMBERS
      });
  });

  //Logueamos warn cuando no existe la ruta solicitada
  app.get('*', function (req, res) {
    logger.warn(`[${req.method}] => ${req.originalUrl}`);
    return res.status(404).json({ error: -2, descripcion: `Método: ${req.method} y Ruta: ${req.originalUrl} no implementados` });
  });
  app.post('*', function (req, res) {
    logger.warn(`[${req.method}] => ${req.url}`);
    return res.status(404).json({ error: -2, descripcion: `Método: ${req.method} y Ruta: ${req.originalUrl} no implementados` });
  });
  app.put('*', function (req, res) {
    logger.warn(`[${req.method}] => ${req.url}`);
    return res.status(404).json({ error: -2, descripcion: `Método: ${req.method} y Ruta: ${req.originalUrl} no implementados` });
  });
  app.delete('*', function (req, res) {
    logger.warn(`[${req.method}] => ${req.url}`);
    return res.status(404).json({ error: -2, descripcion: `Método: ${req.method} y Ruta: ${req.originalUrl} no implementados` });
  });

  //Creamos escuchador
  const connectedServer = httpServer.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
  });

  //Definimos manejo de errores
  connectedServer.on('error', (error) => {
    console.error('Error: ', error);
  });

  //Sockets events
  io.on('connection', async (socket) => {
    console.log(`New client connection! Id: ${socket.id}`);

    // //Compartimos al nuevo cliente conectado los productos cargados
    // const productos = await contenedorProductos.getAll();
    // socket.emit('actualiza-productos', productos);

    //Compartimos al nuevo cliente conectado los productos Fakers
    const productosFaker = generateRandomArrayProducts(5);
    socket.emit('actualiza-productos', productosFaker);

    //Compartimos al nuevo cliente conectado los mensajes cargados
    const mensajes = await contenedorMensajes.getAll();
    const mensajesConId = {
      id: 'mensajes',
      mensajes
    };
    const mensajesNormalizado = normalizedMensajes(mensajesConId);
    socket.emit('actualiza-mensajes', mensajesNormalizado);

    //Escuchamos cuando el cliente envía un nuevo producto
    socket.on('nuevo-producto', async (prod) => {
      //await contenedorProductos.saveProduct(prod.title, +prod.price, prod.thumbnail);

      //Emitimos el mensaje recibido a TODOS los clientes (incluído el que lo envió)
      //const productos = await contenedorProductos.getAll();
      //io.emit('actualiza-productos', productos);
    });

    //Escuchamos cuando el cliente envía un nuevo mensaje
    socket.on('nuevo-mensaje', async (msj) => {
      await contenedorMensajes.save(msj)

      // //Emitimos el mensaje recibido a TODOS los clientes (incluído el que lo envió)
      const mensajes = await contenedorMensajes.getAll();
      const mensajesConId = {
        id: 'mensajes',
        mensajes
      };
      const mensajesNormalizado = normalizedMensajes(mensajesConId);
      io.emit('actualiza-mensajes', mensajesNormalizado);
    });

    //Escuchamos cuando el cliente se desconecta
    socket.on('disconnect', () => {
      console.log(`Client has left! Id: ${socket.id}`);
    });
  });
}