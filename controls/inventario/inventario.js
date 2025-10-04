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

        const [existente] = await db.promise().query(
            `SELECT id_inventario, cantidad 
             FROM inventario 
             WHERE id_motos = ? 
               AND (id_colormoto = ? OR (? IS NULL AND id_colormoto IS NULL)) 
               AND id_sucursal = ?`,
            [id_motos, id_colormoto, id_colormoto, id_sucursal]
        );

        if (existente.length > 0) {
            const nuevoStock = existente[0].cantidad + cantidad;
            await db.promise().query(
                `UPDATE inventario 
                 SET cantidad = ?, stock_minimo = ? 
                 WHERE id_inventario = ?`,
                [nuevoStock, stock_minimo || 0, existente[0].id_inventario]
            );

            return res.status(200).json({ message: "Stock actualizado correctamente", nuevoStock });
        } else {
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

//Controlador PATCH para editar los inventarios

const updateInventario = async (req, res) => {
    try{
        const { id } = req.params;
        const { id_colormoto, id_sucursal, cantidad, stock_minimo } = req.body;

        const update = [];
        const values = [];

        if(id_colormoto){
            update.push('id_colormoto= ?');
            values.push(id_colormoto);
        }

        if(id_sucursal){
            update.push('id_sucursal= ?');
            values.push(id_sucursal);
        }

        if(cantidad){
            update.push('cantidad= ?');
            values.push(cantidad);
        }

        if(stock_minimo){
            update.push('stock_minimo= ?');
            values.push(stock_minimo);
        }
        
        if(update.length === 0){
            return res.status(400).json({ error: "No se proporcionaron cambios"})
        }

        const query = `UPDATE inventario SET ${update.join(', ')} WHERE id_inventario = ?`;
        values.push(id);

        const [result] = await db.promise().query(query, values);

        if(result.affectedRows === 0){
            return res.status(404).json({ error: "Inventario no encontrado" });
        }
        res.status(200).json({ message: "Inventario actualizado correctamente" })
        
    }catch(err){
        console.error("Error al actualizar inventario", err)
        res.status(500).json({ error: "Error interno del servidor"})
    }
};

module.exports = {
    inventarioSocket,
    addInventario,
    updateInventario
};