const db = require('../../config/db');

//Controlador Socket para obtener las motos

const getMotos = async (socket) => {
    const query = `SELECT 
                m.id_motos,
                m.modelo AS modelo,
                m.precio_usd,
                m.inicial_bs,
                m.cilindrada,
                m.combustible,
                m.rendimiento,
                m.fecha_registro,
                c.nombre_color AS color,
                cm.img_moto AS img_moto
            FROM motos m
                LEFT JOIN colormoto cm ON cm.id_motos = m.id_motos
                LEFT JOIN color c ON cm.id_color = c.id_color
                ORDER BY m.modelo, cm.fecha_registro DESC
                LIMIT 25;`;

            try{
                const [rows] = await db.promise().query(query);
                if(!rows || rows.length === 0){
                    return socket.emit('error', {message: "No se encontraron motos"});
                }
                const resultados = rows.map(rows => {
                    return{
                        ...rows,
                        img_moto_url: rows.img_moto
                        ? `http://177.222.114.122:7001/imagen/${rows.img_moto}`
                        : null
                    };
                });
                socket.emit('motos', resultados);
            }catch(err){
                console.error("Error al obtener motos:", err);
                socket.emit('error', { message: "Error al obtener motos"});
            }
};

//Controlador POST para agregar motos

const addMotos = async (req, res) => {
    const { modelo, precio_usd, inicial_bs, cilindrada, combustible, rendimiento } = req.body;
    const fecha_registro = new Date();

    try{
        const query = "INSERT INTO motos (modelo, precio_usd, inicial_bs, cilindrada, combustible, rendimiento, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [modelo, precio_usd, inicial_bs, cilindrada, combustible, rendimiento, fecha_registro];

        db.query(query, values, (error, result) => {
            if(error){
                console.error("Error al ingresar motos", error);
                return res.status(500).json({ error: "Error al ingresar motos" });
            }
            const id_moto = result.insertId;
            console.log(id_moto); 
            res.status(201).json({ message: "Motos ingresada correctamente", id_moto });
        });
    }catch(err){
        console.error("Error al ingresar motos", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Controlador PATCH para actualizar motos

const updateMotos = async (req, res) => {
    const { id } = req.params;;
    const { modelo, precio_usd, inicial_bs, cilindrada, combustible, rendimiento } = req.body;

    const update = [];
    const values = [];

    if(modelo){
        update.push('modelo = ?');
        values.push(modelo);
    }

    if(precio_usd){
        update.push('precio_usd = ?');
        values.push(precio_usd);
    }

    if(inicial_bs){
        update.push('inicial_bs = ?');
        values.push(inicial_bs);
    }

    if(cilindrada){
        update.push('cilindrada = ?');
        values.push(cilindrada);
    }

    if(combustible){
        update.push('combustible = ?');
        values.push(combustible);
    }

    if(rendimiento){
        update.push('rendimiento = ?');
        values.push(rendimiento);
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