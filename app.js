const express = require('express');
require('dotenv').config();
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { getUsuarios } = require('./controls/usuario/usuario');
const usuarioRouter = require('./router/usuarioRouter/usuarioRouter');
const { getSucursal } = require('./controls/sucursales/sucursal');
const sucursalRouter = require('./router/sucursalesRouter/sucursalRouter');
const { getCliente } = require('./controls/cliente/cliente');
const clienteRouter = require('./router/clienteRouter/clienteRouter');
const { getCostoVarios } = require('./controls/costovarios/costovarios');
const costoRouter = require('./router/costoRouter/costoRouter');
const { getMotos } = require('./controls/motos/motos');
const motosRouter = require('./router/motosRouter/motosRouter');
const { getColor } = require('./controls/colorModelo/color');
const colorRouter = require('./router/colorRouter/colorRouter');
const { getcolorMotos } = require('./controls/colorMoto/colorMoto');
const colorMotoRouter = require('./router/colorMotoRouter/colorMotoRouter');
const imagenRouter = require('./router/colorMotoRouter/imagenRouter');
const { getProformas, getCotizacion, getCotizacionAsesor } = require('./controls/proforma/proforma');
const proformaRouter = require('./router/proformaRouter/proformaRouter');
const { getEtiqueta } = require('./controls/etiquetas/etiquetas');
const etiquetaRouter = require('./router/etiquetaRouter/etiquetaRouter');
const etiquetaClienteRouter = require('./router/etiquetaCliente/etiquetaCliente');
const { getEtiquetaCliente } = require('./controls/etiquetaCliente/etiquetaCliente');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
      origin: [
        'http://localhost:7001',
        'http://177.222.114.122',
        'http://localhost',
        'http://localhost:5173',
        'http://localhost:5174'
      ],
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
      credentials: true
    }
  });

/*app.use(cors ({
    origin: [
        'http://localhost:7001',
        'http://177.222.114.122',
        'http://localhost',
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true
}));*/

/*const io = socketIo(server);*/

io.on('connection', (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on('obtenerUsuario', () => getUsuarios(socket));
    socket.on('obtenerSucursal', () => getSucursal(socket));
    socket.on('obtenerCliente', ()=> getCliente(socket));
    socket.on('obtenerCostoVarios', () => getCostoVarios(socket));
    socket.on('obtenerMotos', () => getMotos(socket));
    socket.on('obtenerColor', () => getColor(socket));
    socket.on('obtenerColorMoto', () => getcolorMotos(socket));
    socket.on('obtenerProforma', () => getProformas(socket));
    socket.on('obtenerCotizacion', () => getCotizacion(socket));
    socket.on('obtenerUsuario', ({id_usuario}) => getCotizacionAsesor(socket, id_usuario));
    socket.on('obtenerEtiqueta', () => getEtiqueta(socket));
    socket.on('obtenerEtiquetaCliente', () => getEtiquetaCliente(socket));

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.end("Servidor funcionando correctamente");
});

app.use('/', usuarioRouter);
app.use('/', sucursalRouter);
app.use('/', clienteRouter);
app.use('/', costoRouter);
app.use('/', motosRouter);
app.use('/', colorRouter);
app.use('/', colorMotoRouter);
app.use('/', imagenRouter);
app.use('/', proformaRouter);
app.use('/', etiquetaRouter);
app.use('/', etiquetaClienteRouter);

const PORT = process.env.API_PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
});