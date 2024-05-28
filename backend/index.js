const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("message", (data) => {
    console.log(`Received message: ${data} from ${socket.id}`);
    io.emit("message", data, socket.id);
  });
});
