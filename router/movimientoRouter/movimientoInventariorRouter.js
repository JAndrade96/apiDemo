const express = require('express');
const { registrarMovimientoInventario, updateTrasladoInventario } = require('../../controls/movimiento/movimientoInventario');

const movimientoRouter = express.Router();

//Ruta para registrar movimiento de inventario

movimientoRouter.post("/movimiento-inventario", registrarMovimientoInventario);

//Ruta para editar los movimientos de inventario

movimientoRouter.patch("/movimiento-inventario/:id_movimiento", updateTrasladoInventario);


module.exports = movimientoRouter;

