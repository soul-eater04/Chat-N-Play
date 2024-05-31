const dotenv = require("dotenv").config();
const http = require("http");
const port = process.env.PORT || 3000;
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const validateToken = require("./middleware/validateToken")
const Chess = require("chess.js").Chess;
const connectDb = require("./config/connectDb")
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

connectDb()

let game = new Chess();
let users = [];

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Assign color to the new user
  socket.on("requestColor", () => {
    const color = users.length === 0 ? "w" : "b";
    users.push({ id: socket.id, color: color });
    socket.emit("assignColor", color);
  });
  socket.on("move", (move) => {
    const moveResult = game.move(move);
    if (moveResult) {
      io.emit("newPosition", { position: game.fen(), color: moveResult.color });
    } else {
      socket.emit("invalidMove");
    }
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.id !== socket.id);
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware and routes setup (as is)
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
