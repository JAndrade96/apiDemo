const io = require('socket.io-client');
const socket = io('http://127.0.0.1:3000');

socket.on('connect', () => {
    console.log('✅ Conectado al servidor WebSocket');
    socket.emit('obtenerMovimientoInventario');
});

socket.on('movimientos_inventario', (data) => {
    console.log('📦 Datos recibidos:', data);
});


socket.on('error', (error) => {
    console.error('❌ Error recibido:', error.message);
});

socket.on('disconnect', () => {
    console.log('🔌 Desconectado del servidor WebSocket');
});
