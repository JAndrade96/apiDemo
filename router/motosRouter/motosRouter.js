const express = require('express');
const { addMotos, updateMotos, deleteMotos } = require('../../controls/motos/motos');

const motosRouter = express.Router();

//Ruta para agregar motos

motosRouter.post("/motos", addMotos);

//Ruta para actualizar motos

motosRouter.patch("/motos/:id", updateMotos)

//Ruta para eliminar modelo de motos

motosRouter.delete("/motos/:id", deleteMotos);

module.exports = motosRouter;

