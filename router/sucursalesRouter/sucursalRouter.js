const express = require('express');
const { addSucursal, updateSucursal, deleteSucursal } = require('../../controls/sucursales/sucursal');

const sucursalRouter = express.Router();

//Ruta para registrar nueva sucursal

sucursalRouter.post("/sucursal", addSucursal);

//Ruta para editar sucursales

sucursalRouter.patch("/sucursal/:id", updateSucursal);

//Ruta para eliminar sucursales

sucursalRouter.delete("/sucursal/:id", deleteSucursal);

module.exports = sucursalRouter;