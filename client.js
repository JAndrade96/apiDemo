/*const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket');
    socket.emit('obtenerUsuario');
});

socket.on('proformaUsuario', (data) => {
    console.log('Datos mostrados:', data);
});

socket.on('error', (error) => {
    console.error('Error:', error.message);
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor WebSocket');
});*/

const io = require('socket.io-client');
const socket = io('http://localhost:3000');

// Al conectarse, solicitar las cotizaciones
socket.on('connect', () => {
    console.log('✅ Conectado al servidor WebSocket');
    socket.emit('obtenerUsuario'); // Asegúrate que este sea el evento que el servidor escucha
});

// Recibir los datos de cotización
socket.on('proformaUsuario', (data) => {
    console.log('📦 Cotizaciones recibidas:');
    
    data.forEach((cotizacion, index) => {
        console.log(`\n🧾 Cotización ${index + 1}:`);
        console.log(`Cliente: ${cotizacion.nombre_cliente}`);
        console.log(`Teléfono: ${cotizacion.telefono}`);
        console.log(`Plazo: ${cotizacion.plazo}`);
        console.log(`Precio (USD): ${cotizacion.precio_usd}`);
        console.log(`Inicial (Bs): ${cotizacion.inicial_bs}`);
        console.log(`Fecha: ${cotizacion.fecha_registro}`);
        console.log(`Cuota mensual: ${cotizacion.cuota_mes}`);
        console.log(`Modelo: ${cotizacion.modelo}`);
        console.log(`Color: ${cotizacion.color}`);
        console.log(`Sucursal: ${cotizacion.sucursal}`);
        console.log(`Asesor: ${cotizacion.nombre}`);
        console.log(`Imagen URL: ${cotizacion.img_moto_url}`);
    });
});

// Manejo de errores
socket.on('error', (error) => {
    console.error('❌ Error recibido:', error.message);
});

// Desconexión del servidor
socket.on('disconnect', () => {
    console.log('🔌 Desconectado del servidor WebSocket');
});
