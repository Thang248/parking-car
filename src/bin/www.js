const app = require('../apps/app');
const config = require('config');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
app.set('io', io);
app.use((req, res, next) => {
  req.io = io; // Gắn biến io vào request
  next();
});

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // Lắng nghe sự kiện từ thiết bị post cardId lên '/checkApi'
  socket.on('cardId', (cardId) => {
    // Gửi tin nhắn thông báo cho tất cả các trình duyệt đang kết nối
    io.emit('notification', cardId);
  });

  // Các sự kiện và xử lý khác (nếu cần)
});
server.listen(port = config.get('app.port'), ()=> {
    console.log(`App running in URL http://localhost:${port}`);
})