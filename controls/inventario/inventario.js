const db = require('../../config/db');

//Controlador Socket para ver el inventario

const inventarioSocket = async (socket) => {
    const query = 'SELECT * FROM inventario';

    try{
        const [rows] = await db.promise().query(query);
        if(!rows || rows.length === 0){
            return socket.emit('error', { message: "No se encontrarón productos en los almacenes"})
        }
        socket.emit('inventario', rows);
    }catch(err){
        console.error("Error al obtener inventario", err);
        socket.emit("error", { message: "Error al obtener inventario"})
    }
}; 


// controlador para insertar/actualizar inventario
const addInventario = async (req, res) => {
    try {
        const { id_motos, id_colormoto, id_sucursal, cantidad, stock_minimo } = req.body;

        if (!id_motos || !id_sucursal || !cantidad) {
            return res.status(400).json({ message: "Campos obligatorios: id_motos, id_sucursal, cantidad" });
        }

        // Verificar si ya existe registro en inventario para esa moto/color/sucursal
        const [existente] = await db.promise().query(
            `SELECT id_inventario, cantidad 
             FROM inventario 
             WHERE id_motos = ? 
               AND (id_colormoto = ? OR (? IS NULL AND id_colormoto IS NULL)) 
               AND id_sucursal = ?`,
            [id_motos, id_colormoto, id_colormoto, id_sucursal]
        );

        if (existente.length > 0) {
            // Ya existe → actualizar cantidad (sumar al stock actual)
            const nuevoStock = existente[0].cantidad + cantidad;
            await db.promise().query(
                `UPDATE inventario 
                 SET cantidad = ?, stock_minimo = ? 
                 WHERE id_inventario = ?`,
                [nuevoStock, stock_minimo || 0, existente[0].id_inventario]
            );

            return res.status(200).json({ message: "Stock actualizado correctamente", nuevoStock });
        } else {
            // No existe → crear nuevo registro en inventario
            await db.promise().query(
                `INSERT INTO inventario (id_motos, id_colormoto, id_sucursal, cantidad, stock_minimo) 
                 VALUES (?, ?, ?, ?, ?)`,
                [id_motos, id_colormoto, id_sucursal, cantidad, stock_minimo || 0]
            );

            return res.status(201).json({ message: "Inventario agregado correctamente" });
        }

    } catch (err) {
        console.error("Error al agregar al inventario", err);
        res.status(500).json({ message: "Error interno al agregar inventario" });
    }
};


module.exports = {
    inventarioSocket,
    addInventario
};