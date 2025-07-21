const express = require('express');
const { addEtiqueta, updateEtiqueta, deleteEtiqueta } = require('../../controls/etiquetas/etiquetas');

const etiquetaRouter = express.Router();

//Ruta para agregar etiqueta

etiquetaRouter.post("/etiqueta", addEtiqueta);

//Ruta para editar etiqueta

etiquetaRouter.patch("/etiqueta/:id", updateEtiqueta);

//Ruta para eliminar etiqueta

etiquetaRouter.delete("/etiqueta/:id", deleteEtiqueta);

module.exports = etiquetaRouter;