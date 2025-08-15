const db = require('../../config/db');

//Controlador Socket para obtener proformas

const getProformas = async (socket) => {
    const query = 'SELECT * FROM proforma';

    try{
        const [rows] = await db.promise().query(query);
        
        if(!rows || rows.length === 0){
            return socket.emit('error', { message: "No se encontró ninguna proforma" });
        }
        socket.emit('proforma', rows);
    }catch(err){
        console.error("Error al obtener proformas:", err);
        socket.emit('error', {message: "Error al obtener proformas" });
    }
};

//Controlador POST para agregar proformas

const addProforma = async (req, res) => {
    const {id_cliente, id_motos, id_colormoto, id_usuario, id_sucursal, plazo, precio_usd, inicial_bs, cuota_mes} = req.body
    const fecha_registro = new Date();

    try{
        const query = 'INSERT INTO proforma (id_cliente, id_motos, id_colormoto, id_usuario, id_sucursal, plazo, precio_usd, inicial_bs, cuota_mes, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [id_cliente, id_motos, id_colormoto, id_usuario, id_sucursal, plazo, precio_usd, inicial_bs, cuota_mes, fecha_registro];

        db.query(query, values, (error, result) => {
            if(error){
                console.error("Error al ingresar la proforma", error);
                return res.status(500).json({ error: "Error al registrar la proforma" });
            }
            res.status(201).json({ message: "Proforma ingresada correctamente" });
        });
    }catch(err){
        console.error("Error al ingresar la proforma", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

//Controlador para obtener las proforma detallada

const getCotizacion = async (socket) => {
    const query = `SELECT 
                c.id_cliente,
                c.nombre AS nombre_cliente,
                c.telefono,
                p.plazo,
                p.precio_usd,
                p.inicial_bs,
                p.fecha_registro,
                p.cuota_mes,
                m.modelo AS modelo,
                a.nombre AS nombre,
                s.sucursal AS sucursal,
                cm.img_moto AS img_moto,
                clr.nombre_color AS color
            FROM 
                cliente AS c
            INNER JOIN 
                proforma AS p ON c.id_cliente = p.id_cliente
            INNER JOIN 
                motos AS m ON p.id_motos = m.id_motos
            INNER JOIN 
                colormoto AS cm ON p.id_colormoto = cm.id_colormoto
            INNER JOIN 
                color AS clr ON cm.id_color = clr.id_color
            INNER JOIN 
                usuario AS a ON p.id_usuario = a.id_usuario
            INNER JOIN 
                sucursal AS s ON p.id_sucursal = s.id_sucursal
            LIMIT 0, 25`;
            
            try{
                const [rows] =await db.promise().query(query);
                if(!rows || rows.length === 0){
                    return socket.emit('error', {message: "No se encontró ninguna cotización"})
                }
                const resultados = rows.map(rows => {
                    return{
                        ...rows,
                        img_moto_url: rows.img_moto
                        ? `http://177.222.114.122:7001/imagen/${rows.img_moto}`
                        : null
                    };
                });
                socket.emit('proformaData', resultados);
            }catch(err){
                console.error("Error al obtener cotización:", err);
                socket.emit('error', { message: "Error al obtener cotización" });
            }
};

//Controlador para mostrar proformar en base a los id de los usuarios 'asesores'

const getCotizacionAsesor = async (socket, id_usuario) => {
    const query = `SELECT 
            c.id_cliente,
            c.nombre AS nombre_cliente,
            c.telefono,
            p.plazo,
            p.precio_usd,
            p.inicial_bs,
            p.fecha_registro,
            p.cuota_mes,
            m.modelo AS modelo,
            a.nombre AS nombre,
            s.sucursal AS sucursal,
            cm.img_moto AS img_moto,
            clr.nombre_color AS color
        FROM 
            cliente AS c
        INNER JOIN 
            proforma AS p ON c.id_cliente = p.id_cliente
        INNER JOIN 
            motos AS m ON p.id_motos = m.id_motos
        INNER JOIN 
            colormoto AS cm ON p.id_colormoto = cm.id_colormoto
        INNER JOIN 
            color AS clr ON cm.id_color = clr.id_color
        INNER JOIN 
            usuario AS a ON p.id_usuario = a.id_usuario
        INNER JOIN 
            sucursal AS s ON p.id_sucursal = s.id_sucursal
        WHERE
            p.id_usuario = ?`;

        try{
            const [rows] = await db.promise().query(query, [id_usuario]);
            if(!rows || rows.length === 0){
                return socket.emit('error', { message: "No se encontró ninguna cotización" });
            }
            const resultados = rows.map(rows => {
                return {
                    ...rows,
                    img_moto_url: rows.img_moto
                    ? `http://177.222.114.122:7001/imagen/${rows.img_moto}`
                    : null
                }
            });
            socket.emit('proformaUsuario', resultados);
        }catch(err){
            console.error("Error al obtener cotización:", err);
            socket.emit('error', { message: "Error al obtener cotización" });
        }
};

module.exports = {
    getProformas,
    addProforma,
    getCotizacion,
    getCotizacionAsesor
};