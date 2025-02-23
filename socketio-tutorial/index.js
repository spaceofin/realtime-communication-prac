import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  // console.log("a user connected");
  // socket.on("disconnect", () => {
  //   console.log("user disconnected");
  // });
  socket.on("chat message", (msg, callback) => {
    // console.log("message: " + msg);
    io.emit("chat message", msg, "1", "2", {
      3: "4",
      5: Buffer.from([6, 7, 8]),
    });
    // socket.emit("server received", msg);
    socket.broadcast.emit("broadcast emit", msg);
    callback({ status: "server received" });
  });

  socket.onAnyOutgoing((eventName, ...args) => {
    console.log("onAnyOutgoing eventName:", eventName);
    console.log("onAnyOutgoing args:", args);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
