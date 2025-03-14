import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
// import { getReceiverSocketId } from "./socket";
dotenv.config();

const app = express();
const server = http.createServer(app);

// io = input/output
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
  },
});
const userSocketMap = {}; //{userId: socketId}
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId; //เช็คว่ามี userId ไหม

  //ถ้ามี userId ให้เก็บ socketId ของ user นั้น
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  // console.log("The user is connected :", userId, "=", socket.id);
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); //ส่ง userSocketMap ไปทุกคนที่เชื่อมต่อ

  socket.on("friendRequestSent", (friendId) => {
    const receiverSocketId = getReceiverSocketId(friendId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestReceived", userId);
    }
  });

  socket.on("friendRequestAccepted", (friendId) => {
    const getReceiverSocketId = getReceiverSocketId(friendId);
    // not
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId]; //ลบ socketId ของ user ที่ disconnect
    console.log("The user is disconnected :", socket.id);
  });
});

export { app, server, io };
