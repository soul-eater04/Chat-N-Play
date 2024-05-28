const dotenv = require("dotenv").config();
const http = require("http");
const port = process.env.PORT || 3000;
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();

const server = http.createServer(app);
const connectDb = require("./config/connectDb")
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

connectDb();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("message", (data) => {
    console.log(`Received message: ${data} from ${socket.id}`);
    io.emit("message", data, socket.id);
  });
});

const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/api", userRoutes);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
