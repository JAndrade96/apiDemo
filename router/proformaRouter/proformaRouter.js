const express = require('express');
const { addProforma } = require('../../controls/proforma/proforma');

const proformaRouter = express.Router();

//Ruta para agregar proforma

proformaRouter.post("/proforma", addProforma);


module.exports = proformaRouter;