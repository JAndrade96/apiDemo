const express = require('express');
const { addUsuario, updateUsuario, loginUsuario, changePassword } = require('../../controls/usuario/usuario');


const usuarioRouter = express.Router();

//Ruta para agregar usuarios

usuarioRouter.post("/usuario", addUsuario);

//Ruta para editar usuarios

usuarioRouter.patch("/usuario/:id", updateUsuario);

//Ruta de login para usuarios

usuarioRouter.post("/login", loginUsuario);

//Ruta para cambiar de contraseña

usuarioRouter.post("/password", changePassword);


module.exports = usuarioRouter;