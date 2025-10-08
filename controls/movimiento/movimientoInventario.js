const db = require('../../config/db');

//Controlador Socket para mostrar todos los movimientos de inventario

const movimientoInventarioSocket = async (socket) => {
    const query = `
        SELECT 
            mi.id_movimiento,
            mi.tipo,
            mi.cantidad,
            mi.descripcion,
            mi.fecha_registro,
            u.nombre AS usuario,
            s.sucursal AS sucursal,
            m.modelo AS moto,
            c.nombre_color AS color
        FROM movimiento_inventario mi
        INNER JOIN inventario i ON mi.id_inventario = i.id_inventario
        INNER JOIN usuario u ON mi.id_usuario = u.id_usuario
        INNER JOIN sucursal s ON i.id_sucursal = s.id_sucursal
        INNER JOIN motos m ON i.id_motos = m.id_motos
        LEFT JOIN colormoto cm ON i.id_colormoto = cm.id_colormoto
        LEFT JOIN color c ON cm.id_color = c.id_color
        ORDER BY mi.fecha_registro DESC
    `;

    try {
        const [rows] = await db.promise().query(query);

        if (!rows || rows.length === 0) {
            return socket.emit("error", { message: "No se encontraron movimientos en inventario" });
        }

        socket.emit("movimientos_inventario", rows);

    } catch (err) {
        console.error("Error al obtener movimientos de inventario:", err);
        socket.emit("error", { message: "Error al obtener movimientos de inventario" });
    }
};

//Controlador POST para registrar los movimientos en inventario

const registrarMovimientoInventario = async (req, res) => {
    try {
        const { id_inventario, tipo, cantidad, descripcion, id_usuario, id_sucursal_destino } = req.body;

        if (!id_inventario || !tipo || !cantidad || !id_usuario) {
            return res.status(400).json({ message: "Campos obligatorios: id_inventario, tipo, cantidad, id_usuario" });
        }

        const connection = await db.promise();

        const [inventario] = await connection.query(
            `SELECT * FROM inventario WHERE id_inventario = ?`,
            [id_inventario]
        );

        if (inventario.length === 0) {
            return res.status(404).json({ message: "Inventario no encontrado" });
        }

        const item = inventario[0];

        await connection.query('START TRANSACTION');

        if (tipo === "entrada") {
            await connection.query(
                `UPDATE inventario SET cantidad = cantidad + ? WHERE id_inventario = ?`,
                [cantidad, id_inventario]
            );
        } else if (tipo === "salida") {
            if (item.cantidad < cantidad) {
                await connection.query('ROLLBACK');
                return res.status(400).json({ message: "Stock insuficiente para realizar la salida" });
            }
            await connection.query(
                `UPDATE inventario SET cantidad = cantidad - ? WHERE id_inventario = ?`,
                [cantidad, id_inventario]
            );
        } else if (tipo === "traslado") {
            if (!id_sucursal_destino) {
                await connection.query('ROLLBACK');
                return res.status(400).json({ message: "Debe indicar la sucursal destino para un traslado" });
            }

            if (item.cantidad < cantidad) {
                await connection.query('ROLLBACK');
                return res.status(400).json({ message: "Stock insuficiente para traslado" });
            }

            await connection.query(
                `UPDATE inventario SET cantidad = cantidad - ? WHERE id_inventario = ?`,
                [cantidad, id_inventario]
            );

            const [destinoExistente] = await connection.query(
                `SELECT id_inventario FROM inventario 
                 WHERE id_motos = ? 
                 AND (id_colormoto = ? OR (? IS NULL AND id_colormoto IS NULL)) 
                 AND id_sucursal = ?`,
                [item.id_motos, item.id_colormoto, item.id_colormoto, id_sucursal_destino]
            );

            if (destinoExistente.length > 0) {
                await connection.query(
                    `UPDATE inventario SET cantidad = cantidad + ? WHERE id_inventario = ?`,
                    [cantidad, destinoExistente[0].id_inventario]
                );
            } else {
                await connection.query(
                    `INSERT INTO inventario (id_motos, id_colormoto, id_sucursal, cantidad, stock_minimo)
                     VALUES (?, ?, ?, ?, 0)`,
                    [item.id_motos, item.id_colormoto, id_sucursal_destino, cantidad]
                );
            }
        } else if (tipo === "ajuste") {
            await connection.query(
                `UPDATE inventario SET cantidad = ? WHERE id_inventario = ?`,
                [cantidad, id_inventario]
            );
        }

        await connection.query(
            `INSERT INTO movimiento_inventario (id_inventario, tipo, cantidad, descripcion, id_usuario)
             VALUES (?, ?, ?, ?, ?)`,
            [id_inventario, tipo, cantidad, descripcion || null, id_usuario]
        );

        await connection.query('COMMIT');

        res.status(201).json({ message: "Movimiento registrado correctamente" });

    } catch (err) {
        console.error("Error al registrar movimiento:", err);
        await db.promise().query('ROLLBACK');
        res.status(500).json({ message: "Error interno al registrar movimiento" });
    }
};

//Controlador PATCH para editar movimientos de inventario

const updateTrasladoInventario = async (req, res) => {
    const connection = await db.promise();
    try {
        const { id_movimiento } = req.params;
        const { cantidad, id_sucursal_destino, descripcion, id_usuario } = req.body;

        if (!id_movimiento || !cantidad || !id_sucursal_destino || !id_usuario) {
            return res.status(400).json({ message: "Campos obligatorios: cantidad, id_sucursal_destino, id_usuario" });
        }

        
        const [movimiento] = await connection.query(
            `SELECT * FROM movimiento_inventario WHERE id_movimiento = ? AND tipo = 'traslado'`,
            [id_movimiento]
        );

        if (movimiento.length === 0) {
            return res.status(404).json({ message: "Movimiento de traslado no encontrado" });
        }

        const mov = movimiento[0];

        
        const [inventarioOrigen] = await connection.query(
            `SELECT * FROM inventario WHERE id_inventario = ?`,
            [mov.id_inventario]
        );

        if (inventarioOrigen.length === 0) {
            return res.status(404).json({ message: "Inventario origen no encontrado" });
        }

        const itemOrigen = inventarioOrigen[0];

        await connection.query('START TRANSACTION');

        await connection.query(
            `UPDATE inventario SET cantidad = cantidad + ? WHERE id_inventario = ?`,
            [mov.cantidad, itemOrigen.id_inventario]
        );

        const [inventarioDestinoPrevio] = await connection.query(
            `SELECT * FROM inventario 
             WHERE id_motos = ? 
             AND (id_colormoto = ? OR (? IS NULL AND id_colormoto IS NULL)) 
             AND id_sucursal = ?`,
            [itemOrigen.id_motos, itemOrigen.id_colormoto, itemOrigen.id_colormoto, id_sucursal_destino]
        );

        if (inventarioDestinoPrevio.length > 0) {
            await connection.query(
                `UPDATE inventario SET cantidad = cantidad - ? WHERE id_inventario = ?`,
                [mov.cantidad, inventarioDestinoPrevio[0].id_inventario]
            );
        }

        if (itemOrigen.cantidad < cantidad) {
            await connection.query('ROLLBACK');
            return res.status(400).json({ message: "Stock insuficiente en la sucursal origen" });
        }

        await connection.query(
            `UPDATE inventario SET cantidad = cantidad - ? WHERE id_inventario = ?`,
            [cantidad, itemOrigen.id_inventario]
        );

        const [destinoNuevo] = await connection.query(
            `SELECT id_inventario FROM inventario 
             WHERE id_motos = ? 
             AND (id_colormoto = ? OR (? IS NULL AND id_colormoto IS NULL)) 
             AND id_sucursal = ?`,
            [itemOrigen.id_motos, itemOrigen.id_colormoto, itemOrigen.id_colormoto, id_sucursal_destino]
        );

        if (destinoNuevo.length > 0) {
            await connection.query(
                `UPDATE inventario SET cantidad = cantidad + ? WHERE id_inventario = ?`,
                [cantidad, destinoNuevo[0].id_inventario]
            );
        } else {
            await connection.query(
                `INSERT INTO inventario (id_motos, id_colormoto, id_sucursal, cantidad, stock_minimo)
                 VALUES (?, ?, ?, ?, 0)`,
                [itemOrigen.id_motos, itemOrigen.id_colormoto, id_sucursal_destino, cantidad]
            );
        }

        await connection.query(
            `UPDATE movimiento_inventario 
             SET cantidad = ?, descripcion = ?, id_usuario = ?, fecha_registro = CURRENT_TIMESTAMP 
             WHERE id_movimiento = ?`,
            [cantidad, descripcion || mov.descripcion, id_usuario, id_movimiento]
        );

        await connection.query('COMMIT');

        res.status(200).json({ message: "Traslado editado correctamente" });

    } catch (err) {
        console.error("Error al editar traslado:", err);
        await db.promise().query('ROLLBACK');
        res.status(500).json({ message: "Error interno al editar traslado" });
    }
};


module.exports = {
    movimientoInventarioSocket,
    registrarMovimientoInventario,
    updateTrasladoInventario
};