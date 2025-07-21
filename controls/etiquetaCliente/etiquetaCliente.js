const db = require('../../config/db');

//Controlador Socket para mostrar los clientes con las etiquetas asignadas

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

module.exports = {
    addEtiquetaCliente
};