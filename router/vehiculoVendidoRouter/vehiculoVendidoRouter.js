const express = require('express');
const { addVehiculoVendido, anularVenta } = require('../../controls/vehiculo-movimiento/movimientoVehiculo');

const vehiculoVendidoRouter = express.Router();

//Ruta para agregar vehiculos vendidos

vehiculoVendidoRouter.post("/vehiculo-vendido", addVehiculoVendido);

//Ruta para realizar la anulacion de una venta

vehiculoVendidoRouter.patch("/vehiculo-vendido/:id_vendido", anularVenta);

module.exports = vehiculoVendidoRouter;