const dotenv = require("dotenv").config();
const http = require("http");
const port = process.env.PORT || 3000;
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const validateToken = require("./middleware/validateToken");
const Chess = require("chess.js").Chess;
const connectDb = require("./config/connectDb");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

connectDb();

let game = new Chess();
let users = [];
function findSocketByUsername(username) {
  const user = users.find(user => user.username === username);
  return user ? io.sockets.sockets.get(user.socketId) : null;
}

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);



  socket.on("message",(data) => {
    io.emit("message",data);
  })

  socket.on("setUsername", (username) => {
    users.push({ username: username, socketId: socket.id });
    console.log(users)
    console.log(`Username set for ${socket.id}: ${username}`);
  });

  socket.on('chess-challenge-request', ({ challenger, opponent }) => {
    const opponentSocket = findSocketByUsername(opponent);
    if (opponentSocket) {
      opponentSocket.emit('chess-challenge', { challenger });
    }
  });

  socket.on('chess-challenge-response', ({ challenger, accepted }) => {
    const challengerSocket = findSocketByUsername(challenger);
    if (challengerSocket) {
      challengerSocket.emit('chess-challenge-result', { accepted });
    }
  });

  // Assign color to the new user
  socket.on("requestColor", () => {
    const color = users.length === 0 ? "w" : "b";
    const userIndex = users.findIndex(user => user.socketId === socket.id);
    if (userIndex !== -1) {
      users[userIndex].color = color;
    }
    socket.emit("assignColor", color);
  });
  socket.on("move", (move) => {
    try {
      const moveResult = game.move(move);
      if (moveResult) {
        io.emit("newPosition", {
          position: game.fen(),
          color: moveResult.color,
        });
      } else {
        socket.emit("invalidMove");
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", () => {
    const index = users.findIndex(user => user.socketId === socket.id);
    if (index !== -1) {
      console.log(`User ${users[index].username} disconnected`);
      users.splice(index, 1);
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
