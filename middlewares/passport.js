const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { UsuariosMongooseDao } = require('../models/daos/UsuariosMongooseDao');
const usuariosDao = new UsuariosMongooseDao();

//Genera un Salt (elemento aleatorio utilizado para hashear)
const salt = () => bcrypt.genSaltSync(10);
//Se crea el hash con el salt creado anteriormente
const createHash = (pass) => bcrypt.hashSync(pass, salt());
//bcrypt encripta la información...luego se compara las cadenas encriptadas para verificar si son iguales o no
const isValidPassword = (user, pass) => bcrypt.compareSync(pass, user.password);

//Passport Local Strategy
//Se declara la siguiente estrategia llamada "login" (es un string que identifica la estrategia, es opcional)
//Tener en cuenta que el "done" es como el next del Middleware, para continuar la ejecución
passport.use('login', new LocalStrategy(async (username, password, done) => {
    try {
        const user = await usuariosDao.getByEmail(username);

        if (!isValidPassword(user, password)) {
            console.log('Invalid user or password');

            return done(null, false); //el 2do parámetro en false indica que se vaya a la redirección que se indica en el "failureRedirect"
        }

        return done(null, user); //acá Passport almacena el usuario en la session
    } catch (error) {

        return done(error);
    }
}));

//Passport Local Strategy
//Se declara la siguiente estrategia llamada "register" (es un string que identifica la estrategia, es opcional)
passport.use('register', new LocalStrategy({
    passReqToCallback: true,    //con esta propiedad, podemos usar el "req" de la llamada
    },
    async (req, username, password, done) => {
        try {
            const userObject = {
                email: username,
                password: createHash(password),
            };

            const user = await usuariosDao.save(userObject);
            if (user === -1) {
                return done(null, false);
            }
            
            console.log('User registration sucessful!');
            
            return done(null, user);
        } catch (error) {
            console.log('Error signing up >>> ', error);

            return done(error);
        }
}));

//Serializacion
//1ro Passport serializa el usuario y lo guarda en la session
passport.serializeUser((user, done) => {
    console.log('Inside serializer');
    done(null, user._id);
});

//Deserializacion
//2do Passport deserializa el usuario y lo utiliza
passport.deserializeUser(async (id, done) => {
    console.log('Inside deserializer');
    const user = await usuariosDao.getById(id);

    done(null, user);
});

module.exports = passport;