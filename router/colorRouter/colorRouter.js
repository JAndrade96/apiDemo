const express = require('express');
const { addColor, updateColor, deleteColor } = require('../../controls/colorModelo/color');

const colorRouter = express.Router();

//Ruta para agregar color

colorRouter.post("/color", addColor);

//Ruta para editar color

colorRouter.patch("/color/:id", updateColor);

//Ruta para eliminar color

colorRouter.delete("/color/:id", deleteColor);


module.exports = colorRouter;