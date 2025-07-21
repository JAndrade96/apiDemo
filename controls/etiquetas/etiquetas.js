const db = require('../../config/db');

//Controlador Socket para mostrar

const getEtiqueta = async (socket) => {
    const query = 'SELECT * FROM etiquetas';
    try{
        const [rows] = await db.promise().query(query);
        if(!rows || rows.length === 0){
            return socket.emit('error', { message:"No se encontrarón etiquetas" });
        }
        socket.emit('etiqueta', rows);
    }catch(err){
        console.error("Error al obtener etiquetas", err);
        socket.emit("error", { message: "Error al obtener etiquetas" })
    }
};

//Controlador PSOT para ingresar etiquetas

const addEtiqueta = async (req, res) => {
    const {id_usuario, nombre, color} = req.body;
    const fecha_registro = new Date();

    if(!nombre || !color){
        return res.status(400).json({ error: "El campo 'nombre' y 'color' en etiquetas es obligatorio" })
    }

    try{
        const query = "INSERT INTO etiquetas (id_usuario, nombre, color, fecha_registro) VALUES (?, ?, ?, ?)";
        const values = [id_usuario, nombre, color, fecha_registro];

        db.query(query, values, (error, result) => {
            if(error){
                console.error("Error al ingresar etiquetas", error);
                return res.status(500).json({ error: "Error al ingresar etiquetas"});
            }
            res.status(201).json({ message: "Etiqueta ingresada correctamente" });
        });
    }catch(err){
        console.error("Error al ingresar etiqueta", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

//Controlador PATCH para editar etiquetas

const updateEtiqueta = async (req, res) => {
    const { id } = req.params;
    const { id_usuario, nombre, color } = req.body;
    
    try{
        const update = [];
        const values = [];

        if(id_usuario){
            update.push('id_usuario = ?');
            values.push(id_usuario);
        }

        if(nombre){
            update.push('nombre = ?');
            values.push(nombre);
        }

        if(color){
            update.push('color = ?');
            values.push(color);
        }

        if(update.length === 0){
            return res.status(400).json({ error: "No se proporcionaron cambios "})
        }

        const query = `UPDATE etiquetas SET ${update.join(', ')} WHERE id_etiquetas = ?`;
        values.push(id);

        const [result] = await db.promise().query(query, values);
        
        if(result.affectedRows === 0){
            return res.status(404).json({ error: "Etiqueta no encontrada" });
        }
        res.status(200).json({ message: "Etiqueta actualizada correctamente" });
    }catch(err){
        console.error("Error al actualizar etiqueta", err)
        res.status(500).json({ error: "Error interno del servidor" })
    }
};

//Controlador DELETE para eliminar etiquetas

const deleteEtiqueta = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM etiquetas WHERE id_etiquetas = ?';
    const values = [ id ];

    db.query(query, values, (error, result) => {
        if(error){
            console.error("Error al eliminar etiqueta", error);
            return res.status(500).json({ error: "Error al eliminar etiquetas"});
        } else{
            res.status(200).json({ message: "Etiqueta eliminada correctamente"})
        }
    });
};

module.exports = {
    getEtiqueta,
    addEtiqueta,
    updateEtiqueta,
    deleteEtiqueta
};