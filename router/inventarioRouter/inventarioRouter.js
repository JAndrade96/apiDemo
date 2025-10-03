const express = require('express');
const { addInventario } = require('../../controls/inventario/inventario');

const inventarioRouter = express.Router();

//Ruta para agregar al inventario

inventarioRouter.post("/inventario", addInventario);


module.exports = inventarioRouter;