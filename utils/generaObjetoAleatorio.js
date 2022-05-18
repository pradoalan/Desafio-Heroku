const { generaNroAleatorio } = require('./utils');

const generaObjetoAleatorio = (cantidad) => {
    const objetoDevuelto = {};

    for (let i = 0; i < cantidad; i++) {
      const nroAleatorio = generaNroAleatorio(1, 1000);
    
      if (objetoDevuelto.hasOwnProperty(nroAleatorio)) {
        objetoDevuelto[nroAleatorio]++;
      } else {
        objetoDevuelto[nroAleatorio] = 1;
      }
    }

    return objetoDevuelto;
};

//Para escuchar el evento del subproceso 
process.on('message', (data) => { //en "data" viene lo que paso en el send()
    const objeto = generaObjetoAleatorio(+data);
    process.send(objeto); //envío la finalización del mensaje al subproceso
});