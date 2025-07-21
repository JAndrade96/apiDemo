const express = require('express');
const { addCliente } = require('../../controls/cliente/cliente');

const clienteRouter = express.Router();

//Ruta para agregar cliente

clienteRouter.post("/cliente", addCliente);


module.exports = clienteRouter