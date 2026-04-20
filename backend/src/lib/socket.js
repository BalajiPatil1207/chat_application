import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";

const userSocketMap = {}; 

let io;

export function initializeSocket(server, allowedOrigins) {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    // console.log("A user connected", socket.user.fullName);

    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      // console.log("A user disconnected", socket.user.fullName);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    // --- WebRTC Signaling ---
    socket.on("call:user", ({ to, offer, type }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incoming:call", {
          from: userId,
          offer,
          type,
          fromInfo: socket.user,
        });
      }
    });

    socket.on("call:accepted", ({ to, ans }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:accepted", { from: userId, ans });
      }
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("peer:nego:needed", { from: userId, offer });
      }
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("peer:nego:done", { from: userId, ans });
      }
    });

    socket.on("ice:candidate", ({ to, candidate }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("ice:candidate", { from: userId, candidate });
      }
    });

    socket.on("call:ended", ({ to }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:ended", { from: userId });
      }
    });
  });

  return io;
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io };
