const db = require('../../config/db');

// Controlador Socket para ver el inventario
const inventarioSocket = async (socket) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM inventario');
        if (!rows || rows.length === 0) {
            return socket.emit('error', { message: "No se encontraron productos en los almacenes" });
        }
        socket.emit('inventario', rows);
    } catch (err) {
        console.error("Error al obtener inventario", err);
        socket.emit("error", { message: "Error al obtener inventario" });
    }
};

// Controlador para insertar o actualizar inventario
const addInventario = async (req, res) => {
    try {
        const { id_motos, id_colormoto, id_sucursal, cantidad, stock_minimo } = req.body;

        if (!id_motos || !id_sucursal || cantidad === undefined) {
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
            const nuevoStock = cantidad;
            await db.promise().query(
                `UPDATE inventario 
                 SET cantidad = ?, stock_minimo = ? 
                 WHERE id_inventario = ?`,
                [nuevoStock, stock_minimo || 0, existente[0].id_inventario]
            );

            // Devuelve el id_inventario actualizado
            return res.status(200).json({ 
                message: "Stock actualizado correctamente", 
                id_inventario: existente[0].id_inventario,
                nuevoStock
            });
        } else {
            const [result] = await db.promise().query(
                `INSERT INTO inventario (id_motos, id_colormoto, id_sucursal, cantidad, stock_minimo) 
                 VALUES (?, ?, ?, ?, ?)`,
                [id_motos, id_colormoto, id_sucursal, cantidad, stock_minimo || 0]
            );

            // Devuelve el id_inventario recién creado
            return res.status(201).json({ 
                message: "Inventario agregado correctamente", 
                id_inventario: result.insertId 
            });
        }
    } catch (err) {
        console.error("Error al agregar al inventario", err);
        res.status(500).json({ message: "Error interno al agregar inventario" });
    }
};

// Controlador PATCH para editar inventarios
const updateInventario = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_colormoto, id_sucursal, cantidad, stock_minimo } = req.body;

        const update = [];
        const values = [];

        if (id_colormoto !== undefined) {
            update.push('id_colormoto = ?');
            values.push(id_colormoto);
        }
        if (id_sucursal !== undefined) {
            update.push('id_sucursal = ?');
            values.push(id_sucursal);
        }
        if (cantidad !== undefined) {
            update.push('cantidad = ?');
            values.push(cantidad);
        }
        if (stock_minimo !== undefined) {
            update.push('stock_minimo = ?');
            values.push(stock_minimo);
        }

        if (update.length === 0) {
            return res.status(400).json({ error: "No se proporcionaron cambios" });
        }

        const query = `UPDATE inventario SET ${update.join(', ')} WHERE id_inventario = ?`;
        values.push(id);

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Inventario no encontrado" });
        }

        // Devuelve el id_inventario actualizado
        res.status(200).json({ 
            message: "Inventario actualizado correctamente",
            id_inventario: id
        });

    } catch (err) {
        console.error("Error al actualizar inventario", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Controlador específico para seguimiento de clientes - inventario con datos completos
const inventarioCompletoSocket = async (socket) => {
    try {
        const query = `
            SELECT 
                i.id_inventario,
                i.id_motos,
                i.id_colormoto,
                i.id_sucursal,
                i.cantidad,
                i.stock_minimo,
                m.modelo,
                c.nombre_color,
                s.nombre_sucursal
            FROM inventario i
            INNER JOIN motos m ON i.id_motos = m.id_motos
            LEFT JOIN colormoto cm ON i.id_colormoto = cm.id_colormoto
            LEFT JOIN color c ON cm.id_color = c.id_color
            INNER JOIN sucursal s ON i.id_sucursal = s.id_sucursal
            ORDER BY m.modelo, c.nombre_color
        `;

        const [rows] = await db.promise().query(query);
        
        if (!rows || rows.length === 0) {
            return socket.emit('error', { message: "No se encontraron productos en los almacenes" });
        }
        
        //console.log("📦 Inventario completo para seguimiento:", rows.length, "registros");
        socket.emit('inventarioCompleto', rows);
    } catch (err) {
        console.error("Error al obtener inventario completo", err);
        socket.emit("error", { message: "Error al obtener inventario completo" });
    }
};

module.exports = {
    inventarioSocket,
    inventarioCompletoSocket, 
    addInventario,
    updateInventario
};
