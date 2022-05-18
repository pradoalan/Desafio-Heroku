//Importamos librerías
const express = require('express');
const router = express.Router();
const path = require('path');

//Routes (api/productos-test)
router.get('/', async (req, res) => {
    const user = req.user;
    if (user) {
      return res.render('form', {nombreUsuario: user.email});
    }
    else {
      res.redirect('/login');
    }
});

module.exports = router;