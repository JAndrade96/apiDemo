const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/imagen/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    const ruta = path.join(__dirname, '..', '..', 'uploads', nombre);

    if (fs.existsSync(ruta)) {
        res.sendFile(ruta);
    } else {
        console.error('Archivo no encontrado:', ruta);
        res.status(404).json({ error: 'Imagen no encontrada' });
    }
});

module.exports = router;