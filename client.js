const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('✅ Conectado al servidor WebSocket');
    socket.emit('obtenerEtiqueta');
});

socket.on('etiqueta', (data) => {
    console.log('📦 Cotizaciones recibidas:', data);
});


socket.on('error', (error) => {
    console.error('❌ Error recibido:', error.message);
});

socket.on('disconnect', () => {
    console.log('🔌 Desconectado del servidor WebSocket');
});
