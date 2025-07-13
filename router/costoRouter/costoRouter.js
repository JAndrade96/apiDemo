const express = require('express');
const { addCosto, updateCosto, deleteCosto } = require('../../controls/costovarios/costovarios');

const costoRouter = express.Router();

//Ruta para agregar costo varios
costoRouter.post("/costo", addCosto);

// Ruta para modificar costos varios

costoRouter.patch('/costovarios/:id', updateCosto);


// Ruta para eliminar costos varios

costoRouter.delete('/costovarios/:id', deleteCosto);



module.exports = costoRouter;