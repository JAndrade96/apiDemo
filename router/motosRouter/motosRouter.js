const express = require('express');
const { addMotos } = require('../../controls/motos/motos');

const motosRouter = express.Router();

//Ruta para agregar motos

motosRouter.post("/motos", addMotos);

module.exports = motosRouter;