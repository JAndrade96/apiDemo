const db  = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;

//Controlador Socket para mostrar todos los usuarios

const getUsuarios = async (socket) => {
    const query = `
        SELECT 
            u.id_usuario,
            u.nombre,
            u.usuario,
            u.correo,
            u.telefono,
            u.roles,
            u.estado,
            u.fecha_registro,
            s.sucursal
        FROM usuario u
        LEFT JOIN sucursal s ON u.id_sucursal = s.id_sucursal
        ORDER BY u.nombre ASC;
    `;

    try {
        const [rows] = await db.promise().query(query);

        if (!rows.length) {
            return socket.emit('error', { message: "No se encontró ningún usuario" });
        }

        socket.emit('usuario', rows);

    } catch (err) {
        console.error("Error al obtener usuarios:", err.message);
        socket.emit("error", { message: "Error al obtener usuarios" });
    }
};

//Controlador POST para agregar usuarios

const addUsuario = async (req, res) => {
    const { id_sucursal, nombre, usuario, contraseña, correo, telefono, roles, estado } = req.body;
    const fecha_registro = new Date();

    if (!nombre || !usuario || !contraseña || !correo || !telefono || !roles) {
        return res.status(400).json({ error: "Falta campos requerido"});
    }

    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const query = `INSERT INTO usuario (id_sucursal, nombre, usuario, contraseña, correo, telefono, roles, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [ id_sucursal, nombre, usuario, hashedPassword, correo, telefono, roles, estado || 'activo', fecha_registro];

        db.query(query, values, (error, result) => {
            if(error){
                console.error("Error al ingresar usuario:", error);
                return res.status(500).json({ error: "Error al registrar usuario"})
            }
            res.status(201).json({ message: "Usuario registrado correctamente" });
        });
    }catch(err){
        console.error("Error interno:", err);
        res.status(500).json({error: "Error interno del servidor"});
    }
};

// Controlador PATCH para actualizar campos del usuario

const updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { id_sucursal, nombre, usuario, contraseña, correo, telefono, roles, estado} = req.body;

    try {
        const update = [];
        const values = [];

        if(id_sucursal){
            update.push('id_sucursal = ?');
            values.push(id_sucursal);
        }

        if(nombre){
            update.push('nombre = ?');
            values.push(nombre);
        }

        if(usuario){
            update.push('usuario = ?');
            values.push(usuario);
        }

        if(contraseña){
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            update.push('contraseña = ?');
            values.push(hashedPassword);
        }

        if(correo){
            update.push('correo = ?');
            values.push(correo);
        }

        if(telefono){
            update.push('telefono = ?');
            values.push(telefono);
        }

        if(roles){
            if(roles !== 'administrador' && roles !== 'editor' && roles !== 'asesor'){
                return res.status(400).json({error: "Los valores de el campo 'roles' tiene que ser 'administrador', 'editor' o 'asesor'"});
            }
            update.push('roles = ?');
            values.push(roles);
        }

        if(estado){
            if(estado !== 'activo' && estado !== 'inactivo'){
                return res.status(400).json({error: "Los valores de el campo 'estado' tiene que ser 'activo' o 'inactivo'"});
            }
            update.push('estado = ?');
            values.push(estado);
        }

        if(update.length == 0){
            return res.status(400).json({error: "No se proporcionó ningún campo para actualizar"});
        }

        const query = `UPDATE usuario SET ${update.join(', ')} WHERE id_usuario = ?`;
        values.push(id);

        const [result] = await db.promise().query(query, values);

        if(result.affectedRows === 0){
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json({ message: "Usuario actualizado correctamente" });
    }catch(err){
        console.error("Error al actualizar usuario:", err);
        res.status(500).json({error: "Error interno del servidor"});
    }
};


//Controlador Login para la autenticación de los usuarios

const loginUsuario = async (req, res) => {
    const {usuario, contraseña } = req.body;

    if(!usuario || !contraseña) {
        return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
    }

    try{
        const query = 'SELECT * FROM usuario WHERE usuario = ? LIMIT 1';
        const [rows] = await db.promise().query(query, [usuario]);

        if(rows.length === 0) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }
        const user = rows[0];

        if(user.estado !== 'activo') {
            return res.status(403).json({ error: "Usuario inactivo" });
        }

        const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);
        if(!passwordMatch) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        const token = jwt.sign (
        {
            id_usuario: user.id_usuario,
            usuario: user.usuario,
            roles: user.roles,
            sucursal: user.id_sucursal
        },
        SECRET_KEY,
        { expiresIn: '4h'}
    );
    const { contraseña: _, ...userData } = user;

    res.status(200).json({
        message: "Autenticación exitosa",
        token,
        user: userData
    });

    }catch(err){
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

//Controlador para realizar los cambios de contraseña

const changePassword = async (req, res) => {
    const { correo, nuevaContraseña } = req.body;

    if(!correo || !nuevaContraseña) {
        return res.status(400).json({ error: "Correo y nueva contraseña son requeridos"});
    }

    try{
        const query = 'SELECT * FROM usuario WHERE correo = ? LIMIT 1';
        const [rows] = await db.promise().query(query, [correo]);

        if(rows.length === 0) {
            return res.status(404).json({ error: "No existe un usuario con ese correo" });
        }

        const usuario = rows[0];

        if(usuario.estado !== 'activo'){
            return res.status(403).json({ error: "Usuario inactivo, no puede cambiar la contraseña" });
        }

        const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);

        const queryUpdate = 'UPDATE usuario SET contraseña = ? WHERE correo = ?';
        await db.promise().query(queryUpdate, [hashedPassword, correo]);

        res.status(200).json({ message: "Contraseña actualizada correctamente" });

    }catch(err){
        console.error("Error al cambiar contraseña:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = {
    getUsuarios,
    addUsuario,
    updateUsuario,
    loginUsuario,
    changePassword
};