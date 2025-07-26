const io = require('socket.io-client');
const socket = io('http://localhost:7001');

socket.on('connect', () => {
    console.log('✅ Conectado al servidor WebSocket');
    socket.emit('obtenerMotos');
});

socket.on('motos', (data) => {
    console.log('📦 Datos recibidos:', data);
});


socket.on('error', (error) => {
    console.error('❌ Error recibido:', error.message);
});

socket.on('disconnect', () => {
    console.log('🔌 Desconectado del servidor WebSocket');
});
