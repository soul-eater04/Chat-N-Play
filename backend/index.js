const dotenv = require("dotenv").config();
const http = require("http");
const port = process.env.PORT || 3000;
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const validateToken = require("./middleware/validateToken");
const server = http.createServer(app);
const connectDb = require("./config/connectDb");
const Chess = require("chess.js");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

connectDb();

let game = new Chess.Chess();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("message", (data) => {
    const { message, userName } = data;
    console.log(`Received message: ${message} from ${userName}`);
    io.emit("message", { message, userName });
  });
  socket.on("playerMove", (move) => {
    const moveResult = game.move(move);
    if (moveResult) {
      io.emit("newPosition", { position: game.fen() });
    } else {
      socket.emit("invalidMove");
    }
  });
});

const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/api", userRoutes);
app.post("/api/auth", validateToken, (req, res) => {
  console.log("validated the token");
  res.send({
    userId: req.userId,
    email: req.email,
    userName: req.username,
    isAuthenticated: true,
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
