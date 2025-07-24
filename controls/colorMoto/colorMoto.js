const db = require('../../config/db');

//Controlador Socket para mostrar información de la tabla

const getcolorMotos = async (socket) => {
    const query = 'SELECT * FROM colormoto';

    try {
        const [rows] = await db.promise().query(query);

        if (!rows || rows.length === 0) {
            return socket.emit('error', { message: "No se encontró información en la tabla" });
        }

        const resultados = rows.map(row => {
            return {
                ...row,
                img_moto_url: row.img_moto 
                    ? `http://177.222.114.122:7001/imagen/${row.img_moto}` 
                    : null
            };
        });

        socket.emit('colormoto', resultados);
    } catch (err) {
        console.error("Error al obtener información de la tabla", err);
        socket.emit('error', { message: "Error al obtener información de la tabla" });
    }
};


//Controlador POST para agregar información a la tabla

const addColorMotos = async (req, res) => {
    const { id_motos, id_color, estado } = req.body;
    const img_moto = req.file ? req.file.filename : null;
    const fecha_registro = new Date();

    try {
        const query = 'INSERT INTO colormoto (id_motos, id_color, img_moto, estado, fecha_registro) VALUES (?, ?, ?, ?, ?)';
        const values = [id_motos, id_color, img_moto, estado, fecha_registro];

        await db.promise().query(query, values);
        res.status(201).json({ message: "Información ingresada correctamente" });
    } catch (err) {
        console.error("Error al ingresar información a la tabla", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

//Controlador PATCH para modificar información de la tabla

const updateColorMoto = async (req, res) => {
    const { id } = req.params;
    const { id_motos, id_color, estado } = req.body;
    const img_moto = req.file ? req.file.filename : null;

    try{
        const update = [];
        const values = [];

        if(id_motos){
            update.push('id_motos = ?');
            values.push(id_motos);
        }

        if(id_color){
            update.push('id_color = ?');
            values.push(id_color);
        }

        if(img_moto){
            update.push('img_moto = ?');
            values.push(img_moto);
        }

        if(estado){
            if(estado !== 'activo' && estado !== 'inactivo'){
                return res.status(400).json({ error: "Los valores de el campo 'estado' tienen que ser 'actvio' o 'inactivo'"});
            }
            update.push('estado = ?');
            values.push(estado)
        }

        if(update.length === 0){
            return res.status(400).json({ error: "No se proporcionaron campos para editar" });
        }

        const query = `UPDATE colormoto SET ${update.join(', ')} WHERE id_colormoto = ?`;
        values.push(id)

        const [result] = await db.promise().query(query, values);

        if(result.affectedRows === 0){
            return res.status(404).json({ error: "Información no encontrada" });
        }
        res.status(200).json({ message: "Información actualizada correctamente" });
    }catch(err){
        console.error("Error al actualizar información", err);
        res.status(500).json({ error: "Error interno del servidor" })
    }
};

//Controlador DELETE para eliminar información de la tabla

const deleteColorMoto = async (req, res) => {
    const {id} = req.params;
    const query = 'DELETE FROM colormoto WHERE id_colormoto = ?';
    const values = [id];

    db.query(query, values, (error, result) => {
        if(error){
            console.error("Error al eliminar información de la tabla", error);
            return res.status(500).json({error: "Error al eliminar información de la tabla"});
        } else {
            res.status(201).json({ message: "Información de la tabla eliminado correctamente"})
        }
    });

};

module.exports = {
    getcolorMotos,
    addColorMotos,
    updateColorMoto,
    deleteColorMoto
};