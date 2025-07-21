const express = require('express');
const { addEtiquetaCliente } = require('../../controls/etiquetaCliente/etiquetaCliente');

const etiquetaClienteRouter = express.Router();

//Ruta para agregar etiqueta a los clientes

etiquetaClienteRouter.post("/etiqueta_cliente", addEtiquetaCliente);

module.exports = etiquetaClienteRouter;