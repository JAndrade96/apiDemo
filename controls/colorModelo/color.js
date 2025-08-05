const db = require('../../config/db');

//Controlador Socket para obtener los colores

const getColor = async (socket) => {
    const query = 'SELECT * FROM color';
    try{
        const [rows] = await db.promise().query(query);
        if(!rows || rows.length === 0){
            return socket.emit('error', { message: "No se encontraron colores" });
        }
        socket.emit('color', rows);
    }catch(err){
        console.error("Error al obtener colores", err);
        socket.emit("error", { message: "Error al obtener colores" });
    }
};

//Controlador POST para agregar motos

const addColor = async (req, res) => {
    const { nombre_color } = req.body;
    const fecha_registro = new Date();
    
    if(!nombre_color){
        return res.status(400).json({ error: "El campo color obligatorio" });
    }

    try{
        const query = "INSERT INTO color (nombre_color, fecha_registro) VALUES (?, ?)";
        const values = [nombre_color, fecha_registro];

        db.query(query, values, (error, result) => {
            if(error){
                console.error("Error al ingresar color", error);
                return res.status(500).json({ error: "Error al ingresar color" });
            }
            const id_color = result.insertId;
            console.log(id_color)
            res.status(201).json({ message: "Color ingresado correctamente", id_color });
        });
    }catch(err){
        console.error("Error al ingresar color", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Controlador PATCH para actualizar motos

const updateColor = async (req, res) => {
    const { id } = req.params;;
    const { nombre_color } = req.body;

    const update = [];
    const values = [];

    if(nombre_color){
        update.push('nombre_color = ?');
        values.push(nombre_color)
    }

    if(update.length === 0){
        return res.status(400).json({ error: "No se proporcionaron cambios para actualizar" });
    }

    const query = `UPDATE color SET ${update.join(', ')} WHERE id_color = ?`;
    values.push(id);

    db.query(query, values, (error, result) => {
        if(error){
            console.error("Error al actualizar color", error);
            return res.status(500).json({ error: "Error al actualizar color"});
        }
        res.status(200).json({ message: "Color actualizado correctamente" });
    });
};

//Controlador DELETE para eliminar motos

const deleteColor = async (req, res) => {
    const {id} = req.params;
    const query = 'DELETE FROM color WHERE id_color = ?';
    const values = [id];

    db.query(query, values, (error, result) => {
        if(error){
            console.error("Error al eliminar color", error);
            return res.status(500).json({error: "Error al eliminar color"});
        } else{
            res.status(200).json({ message: "Color eliminado correctamente" });
        }
    });
};


module.exports = {
    getColor,
    addColor,
    updateColor,
    deleteColor
};