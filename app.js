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
const app = express();
app.use(express.json());

app.use(cors ({
    origin: [
        'http://localhost:3000',
        'http://localhost'
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true
}));

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on('obtenerUsuario', () => getUsuarios(socket));
    socket.on('obtenerSucursal', () => getSucursal(socket));
    socket.on('obtenerCliente', ()=> getCliente(socket));
    socket.on('obtenerCostoVarios', () => getCostoVarios(socket));
    socket.on('obtenerMotos', () => getMotos(socket));

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


const PORT = process.env.API_PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
});