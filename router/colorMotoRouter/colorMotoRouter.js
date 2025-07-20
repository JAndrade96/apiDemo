const express = require('express');
const upload = require('../../Middleware/multer');
const { addColorMotos, updateColorMoto, deleteColorMoto } = require('../../controls/colorMoto/colorMoto');


const colorMotoRouter = express.Router();

//Ruta para agregar información a la tabla

colorMotoRouter.post("/colormoto", upload.single('img_moto'), addColorMotos);

//Ruta para editar información de la tabla

colorMotoRouter.patch("/colormoto/:id", upload.single('img_moto'), updateColorMoto);

//Ruta para eliminar información de la tabla

colorMotoRouter.delete("/colormoto/:id", deleteColorMoto);


module.exports = colorMotoRouter;
