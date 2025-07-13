const db = require('../../config/db');

//Controlador socket para mostrar las sucursales disponibles

const getSucursal = async (socket) => {
    const query = 'SELECT * FROM sucursal';
    try{
        const [rows] = await db.promise().query(query);
        if( !rows || rows.length === 0 ){
            return socket.emit('error', { menssage: "No se encontraron sucursales"});
        }
        socket.emit('sucursal', rows);
    }catch(err){
        console.error("Error al obtener sucursales:", err);
        socket.emit('error', { message: "Error al obtener sucursales" });
    }
};

//Controlador post para agregar nuevas sucursales

const addSucursal = async (req, res) => {
    const { sucursal, estado } = req.body;
    const fecha_registro = new Date();

    if (!sucursal || sucursal.trim() === "") {
        return res.status(400).json({ error: "El nombre de la sucursal es requerido" });
    }

    if (!estado || (estado !== 'activo' && estado !== 'inactivo')) {
        return res.status(400).json({ error: "El estado debe ser 'activo' o 'inactivo'" });
    }

    try {
        const [existente] = await db.promise().query(
            'SELECT id_sucursal FROM sucursal WHERE sucursal = ?',
            [sucursal]
        );
        if (existente.length > 0) {
            return res.status(409).json({ error: "Ya existe una sucursal con ese nombre" });
        }

        const query = 'INSERT INTO sucursal (sucursal, estado, fecha_registro) VALUES (?, ?, ?)';
        const values = [sucursal, estado, fecha_registro];

        await db.promise().query(query, values);

        res.status(201).json({ message: "Sucursal registrada correctamente" });

    } catch (err) {
        console.error("Error al registrar nueva sucursal:", err);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

//Controlador patch para editar sucursales

const updateSucursal = async (req, res) => {
    const { id } = req.params;
    const { sucursal, estado } = req.body;

    if (!sucursal || sucursal.trim() === "") {
        return res.status(400).json({ error: "El nombre de la sucursal es requerido" });
    }

    if (!estado || (estado !== 'activo' && estado !== 'inactivo')) {
        return res.status(400).json({ error: "El estado debe ser 'activo' o 'inactivo'" });
    }

    try {
        const [existente] = await db.promise().query(
            'SELECT * FROM sucursal WHERE id_sucursal = ?',
            [id]
        );

        if (existente.length === 0) {
            return res.status(404).json({ error: "Sucursal no encontrada" });
        }

        const [duplicado] = await db.promise().query(
            'SELECT * FROM sucursal WHERE sucursal = ? AND id_sucursal != ?',
            [sucursal, id]
        );

        if (duplicado.length > 0) {
            return res.status(409).json({ error: "Ya existe otra sucursal con ese nombre" });
        }

        await db.promise().query(
            'UPDATE sucursal SET sucursal = ?, estado = ? WHERE id_sucursal = ?',
            [sucursal, estado, id]
        );

        res.status(200).json({ message: "Sucursal actualizada correctamente" });

    } catch (err) {
        console.error("Error al actualizar sucursal:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


//Controlador delete para eliminar sucursales

const deleteSucursal = async (req, res) => {
    const { id } = req.params;

    try {
        const [sucursal] = await db.promise().query(
            'SELECT * FROM sucursal WHERE id_sucursal = ?',
            [id]
        );

        if (sucursal.length === 0) {
            return res.status(404).json({ error: "Sucursal no encontrada" });
        }

        const [usuarios] = await db.promise().query(
            'SELECT COUNT(*) AS total FROM usuario WHERE id_sucursal = ?',
            [id]
        );

        if (usuarios[0].total > 0) {
            return res.status(409).json({ error: "No se puede eliminar. La sucursal está asignada a usuarios." });
        }

        const [proformas] = await db.promise().query(
            'SELECT COUNT(*) AS total FROM proforma WHERE id_sucursal = ?',
            [id]
        );

        if (proformas[0].total > 0) {
            return res.status(409).json({ error: "No se puede eliminar. La sucursal está asignada a proformas." });
        }

        await db.promise().query(
            'DELETE FROM sucursal WHERE id_sucursal = ?',
            [id]
        );

        res.status(200).json({ message: "Sucursal eliminada correctamente" });

    } catch (err) {
        console.error("Error al eliminar sucursal:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


module.exports = {
    getSucursal,
    addSucursal,
    updateSucursal,
    deleteSucursal
};