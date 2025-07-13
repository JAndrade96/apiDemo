const db = require('../../config/db');

//Controlador Socket para mostrar todos los clientes

const getCliente = async (socket) => {
    const query = 'SELECT * FROM cliente';
    try{
        const [rows] = await db.promise().query(query);
        if(!rows || rows.length === 0){
            return socket.emit('error', { message: "No se encontraron clientes" });
        }
        socket.emit('cliente', rows);
    }catch(err){
        console.error("Error al obtener clientes", err);
        socket.emit('error', { message: "Error al obtener sucursales" });
    }
};

//Controlador POST para agregar nuevos clientes

const addCliente = async (req, res) => {
    const { nombre, telefono } = req.body;

    if (!nombre || !telefono) {
        return res.status(400).json({ error: "Nombre y teléfono son obligatorios" });
    }

    try {
        const checkQuery = "SELECT * FROM cliente WHERE nombre = ? OR telefono = ?";
        db.query(checkQuery, [nombre, telefono], (error, results) => {
            if (error) {
                console.error("Error al verificar el cliente", error);
                return res.status(500).json({ error: "Error al verificar el cliente" });
            }

            if (results.length > 0) {
                const coincidenciaExacta = results.find(
                    cliente => cliente.nombre === nombre && cliente.telefono === telefono
                );
                
                const coincidenciaNombre = results.find(
                    cliente => cliente.nombre === nombre && cliente.telefono !== telefono
                );

                const coincidenciaTelefono = results.find(
                    cliente => cliente.telefono === telefono && cliente.nombre !== nombre
                );

                if (coincidenciaExacta) {
                    return res.status(200).json({
                        message: "Cliente ya registrado",
                        id_cliente: coincidenciaExacta.id_cliente
                    });
                }

                if (coincidenciaNombre) {
                    return res.status(200).json({
                        error: "Ya existe un cliente con ese nombre pero con diferente teléfono",
                        id_cliente: coincidenciaNombre.id_cliente
                    });
                }

                if (coincidenciaTelefono) {
                    return res.status(200).json({
                        error: "Ya existe un cliente con ese teléfono pero con diferente nombre",
                        id_cliente: coincidenciaTelefono.id_cliente
                    });
                }
            }

            const insertQuery = "INSERT INTO cliente (nombre, telefono) VALUES (?, ?)";
            db.query(insertQuery, [nombre, telefono], (insertError, result) => {
                if (insertError) {
                    console.error("Error al insertar el cliente", insertError);
                    return res.status(500).json({ error: "Error al registrar el cliente" });
                }

                return res.status(201).json({
                    message: "Cliente registrado correctamente",
                    id_cliente: result.insertId
                });
            });
        });
    } catch (err) {
        console.error("Error inesperado", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = {
    getCliente,
    addCliente,
};