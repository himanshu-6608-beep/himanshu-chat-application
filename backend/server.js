import express from "express";
import http from "http";
import { Server } from "socket.io";
import AuthRoutes from "./routes/authRoutes.js";
import SocketRoutes from "./routes/socketRoutes.js";
import { applyMiddleware } from "./middlewares/user.js";
import { connectDB } from "./config/connect.js";
import Messages from "./models/messages.js";

const app = express();
const server = http.createServer(app);

applyMiddleware(app);
connectDB();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`${userId} joined room`);
  });

  socket.on("send-message", async (data) => {
    try {
      const { sender, receiver, message } = data;

      const savedMessage = await Messages.create({
        sender,
        receiver,
        message,
      });

      io.to(sender).emit("receive-message", savedMessage);
      io.to(receiver).emit("receive-message", savedMessage);

    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

app.use("/api", AuthRoutes);
app.use("/api", SocketRoutes);

const PORT = 1222;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});