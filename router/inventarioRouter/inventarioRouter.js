const express = require('express');
const { addInventario, updateInventario } = require('../../controls/inventario/inventario');

const inventarioRouter = express.Router();

//Ruta para agregar al inventario

inventarioRouter.post("/inventario", addInventario);

//Ruta para editar inventario

inventarioRouter.patch("/inventario/:id", updateInventario);


module.exports = inventarioRouter;