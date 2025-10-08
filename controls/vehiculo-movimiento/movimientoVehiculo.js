const db = require('../../config/db');

//Controlador Socket para mostrar los movimientos de vehiculos vendidos

const vehiculosVendidosSocket = async (socket) => {
    const query = `
        SELECT 
            vv.id_vendido,
            vv.cantidad,
            vv.fecha_venta,
            p.id_proforma,
            p.nombre_cliente,
            p.ci_nit,
            i.id_inventario,
            i.id_sucursal,
            s.nombre_sucursal,
            m.id_motos,
            m.modelo,
            m.marca,
            cm.color
        FROM vehiculos_vendidos vv
        INNER JOIN proforma p ON vv.id_proforma = p.id_proforma
        INNER JOIN inventario i ON vv.id_inventario = i.id_inventario
        INNER JOIN motos m ON i.id_motos = m.id_motos
        LEFT JOIN colormoto cm ON i.id_colormoto = cm.id_colormoto
        INNER JOIN sucursal s ON i.id_sucursal = s.id_sucursal
        ORDER BY vv.fecha_venta DESC;
    `;

    try {
        const [rows] = await db.promise().query(query);

        if (!rows || rows.length === 0) {
            return socket.emit("error", { message: "No se encontraron vehículos vendidos" });
        }

        socket.emit("vehiculosVendidos", rows);
    } catch (err) {
        console.error("Error al obtener vehículos vendidos:", err);
        socket.emit("error", { message: "Error al obtener vehículos vendidos" });
    }
};

//Controlador POST para registrar los vehiculos vendidos

const addVehiculoVendido = async (req, res) => {
    try {
        const { id_proforma, id_inventario, cantidad } = req.body;

        if (!id_proforma || !id_inventario || !cantidad) {
            return res.status(400).json({ message: "Campos obligatorios: id_proforma, id_inventario, cantidad" });
        }

        const [inventario] = await db.promise().query(
            `SELECT cantidad FROM inventario WHERE id_inventario = ?`,
            [id_inventario]
        );

        if (inventario.length === 0) {
            return res.status(404).json({ message: "Inventario no encontrado" });
        }

        const stockActual = inventario[0].cantidad;

        if (stockActual < cantidad) {
            return res.status(400).json({ message: "Stock insuficiente para realizar la venta" });
        }

        await db.promise().query(
            `INSERT INTO vehiculos_vendidos (id_proforma, id_inventario, cantidad) VALUES (?, ?, ?)`,
            [id_proforma, id_inventario, cantidad]
        );

        const nuevoStock = stockActual - cantidad;

        await db.promise().query(
            `UPDATE inventario SET cantidad = ? WHERE id_inventario = ?`,
            [nuevoStock, id_inventario]
        );

        await db.promise().query(
            `INSERT INTO movimiento_inventario (id_inventario, tipo, cantidad, descripcion, id_usuario)
             VALUES (?, 'salida', ?, 'Venta realizada', ?)`,
            [id_inventario, cantidad, req.user?.id_usuario || 1]
        );

        res.status(201).json({
            message: "Vehículo vendido registrado correctamente",
            nuevoStock,
        });
    } catch (err) {
        console.error("Error al registrar vehículo vendido:", err);
        res.status(500).json({ message: "Error interno al registrar la venta" });
    }
};

//Controlador PATCH para anular venta

const anularVenta = async (req, res) => {
  try {
    const { id_vendido } = req.params;
    const { motivo_anulacion, id_usuario } = req.body;

    if (!motivo_anulacion || motivo_anulacion.trim() === "") {
      return res.status(400).json({ message: "Debe especificar un motivo de anulación" });
    }

    const [venta] = await db.promise().query(
      `SELECT id_inventario, cantidad, estado FROM vehiculos_vendidos WHERE id_vendido = ?`,
      [id_vendido]
    );

    if (venta.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    const { id_inventario, cantidad, estado } = venta[0];

    if (estado === "anulado") {
      return res.status(400).json({ message: "La venta ya se encuentra anulada" });
    }

    await db.promise().query(
      `UPDATE vehiculos_vendidos 
       SET estado = 'anulado', motivo_anulacion = ? 
       WHERE id_vendido = ?`,
      [motivo_anulacion, id_vendido]
    );

    await db.promise().query(
      `UPDATE inventario 
       SET cantidad = cantidad + ? 
       WHERE id_inventario = ?`,
      [cantidad, id_inventario]
    );

    await db.promise().query(
      `INSERT INTO movimiento_inventario (id_inventario, tipo, cantidad, descripcion, id_usuario)
       VALUES (?, 'ajuste', ?, ?, ?)`,
      [
        id_inventario,
        cantidad,
        `Venta anulada. Motivo: ${motivo_anulacion}`,
        id_usuario || 1,
      ]
    );

    res.status(200).json({ message: "Venta anulada correctamente y stock restaurado" });

  } catch (err) {
    console.error("Error al anular la venta:", err);
    res.status(500).json({ message: "Error interno al anular la venta" });
  }
};

module.exports = {
    vehiculosVendidosSocket,
    addVehiculoVendido,
    anularVenta
};
