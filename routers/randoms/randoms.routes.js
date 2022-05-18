//Importamos librerías
const express = require('express');
const router = express.Router();
const { fork } = require('child_process');
const path = require('path');

//Routes (api/randoms)
router.get('/', async (req, res) => {
  const { cant } = req.query;
  const cantidad = isNaN(cant) ? 100000000 : +cant;

  const generaObjetoAleatorio = fork(path.resolve(__dirname, '../../utils/generaObjetoAleatorio.js')); //Definimos el fork en un subproceso
  generaObjetoAleatorio.send(cantidad); //Mensaje de inicio para que se procese el trabajo pesado. Emite el mensaje

  generaObjetoAleatorio.on('message', (data) => { //Escuchamos el resultado del subproceso
      res.json({ objetoGenerado: data});
  });
});

module.exports = router;