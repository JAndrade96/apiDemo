const db = require('../../config/db');

//Controlador Socket para mostrar los clientes con las etiquetas asignadas

const getEtiquetaCliente = async (socket) => {
    const query = `SELECT
                        c.id_cliente,
                        c.nombre AS nombre_cliente,
                        e.nombre AS nombre_etiqueta,
                        e.color
                    FROM etiqueta_cliente ec
                    JOIN cliente c ON ec.id_cliente = c.id_cliente
                    JOIN etiquetas e ON ec.id_etiquetas = e.id_etiquetas
                    ORDER BY c.id_cliente, e.nombre`;

    try{
        const [rows] = await db.promise().query(query);
        
        if(!rows.length){
            return socket.emit("error", { message: "No se encontro ninguna etiqueta de clientes" });
        }
        socket.emit('etiquetaData', rows);
    }catch(err){
        console.error("Error al obtener etiquetas de clientes:", err.message);
        socket.emit("error", { message: "Error al obtener etiquetas de los clientes" });
    }
};

//Controlador POST para agregar etiqueta al cliente

const addEtiquetaCliente = async (req, res) => {
    const { id_cliente, id_etiquetas } = req.body;

    try{
        const query = 'INSERT INTO etiqueta_cliente (id_cliente, id_etiquetas) VALUES (?, ?)';
        const values = [ id_cliente, id_etiquetas ];
        
        db.query(query, values, (error, result) => {
            if(error){
                console.error("Error al insertar etiqueta al cliente", error);
                return res.status(500).json({ message: "Error al insertar etiqueta al cliente" });
            }
            res.status(201).json({ message: "Etiqueta insertada al cliente correctamente" });
        });
    }catch(err){
        console.error("Error al insertar etiqueta al cliente", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

//Controlador PATCH para editar etiquetas para los clientes

const updateClienteEtiquetas = async (req, res) => {
    const id_cliente = req.params.id_cliente;
    const { id_etiquetas } = req.body;

    if (!id_cliente || !Array.isArray(id_etiquetas)) {
        return res.status(400).json({ error: "Faltan datos o id_etiquetas no es un array" });
    }

    try {
        await db.promise().query(
            "DELETE FROM etiqueta_cliente WHERE id_cliente = ?",
            [id_cliente]
        );

        if (id_etiquetas.length > 0) {
            const valores = id_etiquetas.map(id_etiqueta => [id_cliente, id_etiqueta]);
            await db.promise().query(
                "INSERT INTO etiqueta_cliente (id_cliente, id_etiquetas) VALUES ?",
                [valores]
            );
        }

        res.status(200).json({ message: "Etiquetas del cliente actualizadas correctamente" });
    } catch (error) {
        console.error("Error en updateClienteEtiquetas:", error);
        res.status(500).json({ error: "Error al actualizar etiquetas", detalle: error.message });
    }
};




module.exports = {
    getEtiquetaCliente,
    addEtiquetaCliente,
    updateClienteEtiquetas
};