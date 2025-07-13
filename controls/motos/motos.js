const db = require('express');

//Controlador Socket para mostrar motos

const getMotos = async (socket) => {
    const query = 'SELECT * FROM motos';

    try{
        const [rows] = await db.promise().query(query);
        if( !rows || rows.length === 0 ){
            return socket.emit('error', { message: "No se encontraron motos" });
        }
        socket.emit('motos', rows);
    }catch(err){
        console.error("Error al obtener motos:", err);
        socket.emit('error', { message: "Error al obtener motos" });
    }
};

//Controlador POST para ingresar motos

const addMotos = async (req, res) => {
    const { motos } = req.body;
    const fecha_registro = new Date();
    
    try{
        const query = 'INSERT INTO motos (motos, fecha_registro) VALUES (?, ?)';
        const values = [motos, fecha_registro];

        db.query(query, values, (error, result) => {
            if(error){
                console.error("Error al ingresar motos", error);
                return res.status(500).json({ error: "Error al registrar motos" });
            }
            res.status(201).json({ message: "Moto ingresada correctamente" });
        });
    }catch(err){
        console.error("Error al ingresar motos", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = {
    getMotos,
    addMotos
};
