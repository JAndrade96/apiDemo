const express = require('express');
const { addEtiquetaCliente, updateClienteEtiquetas } = require('../../controls/etiquetaCliente/etiquetaCliente');

const etiquetaClienteRouter = express.Router();

//Ruta para agregar etiqueta a los clientes

etiquetaClienteRouter.post("/etiqueta_cliente", addEtiquetaCliente);

//Ruta para editar las etiquetas a los clientes

etiquetaClienteRouter.patch("/etiqueta_cliente/:id_cliente", updateClienteEtiquetas);

module.exports = etiquetaClienteRouter;