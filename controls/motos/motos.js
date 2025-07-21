const db = require('../../config/db');

//Controlador Socket para obtener las motos

const getMotos = async (socket) => {
    const query = 'SELECT * FROM motos';
    try{
        const [rows] = await db.promise().query(query);
        if(!rows || rows.length === 0){
            return socket.emit('error', { message: "No se encontraron motos" });
        }
        socket.emit('motos', rows);
    }catch(err){
        console.error("Error al obtener motos", err);
        socket.emit("error", { message: "Error al obtener motos" });
    }
};

//Controlador POST para agregar motos

const addMotos = async (req, res) => {
    const { modelo } = req.body;
    const fecha_registro = new Date();
    
    if(!modelo){
        return res.status(400).json({ error: "El campo modelo de moto es obligatorio" });
    }

    try{
        const query = "INSERT INTO motos (modelo, fecha_registro) VALUES (?, ?)";
        const values = [modelo, fecha_registro];

        db.query(query, values, (error, result) => {
            if(error){
                console.error("Error al ingresar motos", error);
                return res.status(500).json({ error: "Error al ingresar motos" });
            }
            res.status(201).json({ message: "Motos ingresada correctamente" });
        });
    }catch(err){
        console.error("Error al ingresar motos", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Controlador PATCH para actualizar motos

const updateMotos = async (req, res) => {
    const { id } = req.params;;
    const { modelo } = req.body;

    const update = [];
    const values = [];

    if(modelo){
        update.push('modelo = ?');
        values.push(modelo)
    }

    if(update.length === 0){
        return res.status(400).json({ error: "No se proporcionaron cambios para actualizar la moto" })
    }

    const query = `UPDATE motos SET ${update.join(', ')} WHERE id_motos = ?`;
    values.push(id);

    db.query(query, values, (error, result) => {
        if(error){
            console.error("Error al actualizar el modelo de motos", error);
            return res.status(500).json({ error: "Error al actualizar el modelo de la moto"});
        }
        res.status(200).json({ message: "Modelo de moto actualizado correctamente" });
    });
};

//Controlador DELETE para eliminar motos

const deleteMotos = async (req, res) => {
    const {id} = req.params;
    const query = 'DELETE FROM motos WHERE id_motos = ?';
    const values = [id];

    db.query(query, values, (error, result) => {
        if(error){
            console.error("Error al eliminar una moto", error);
            return res.status(500).json({error: "Error al eliminar los modelos de las motos"});
        } else{
            res.status(200).json({ message: "Modelo de motos eliminada correctamente" });
        }
    });
};


module.exports = {
    getMotos,
    addMotos,
    updateMotos,
    deleteMotos
};