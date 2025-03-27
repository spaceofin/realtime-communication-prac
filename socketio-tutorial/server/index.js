import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { availableParallelism } from "node:os";
import cluster from "node:cluster";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";

// open the database file
const db = await open({
  filename: "chat.db",
  driver: sqlite3.Database,
});

// create our 'messages' table (you can ignore the 'client_offset' column for now)
await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT,
      nickname TEXT
  );
`);

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  // create one worker per available core
  let port;
  for (let i = 0; i < numCPUs; i++) {
    port = 3000 + i;
    cluster.fork({
      PORT: port,
    });
  }

  // console.log(
  //   `workers: ${Object.values(cluster.workers).forEach((worker) => {
  //     console.log(
  //       "worker id:",
  //       worker.id,
  //       ", worker process pid:",
  //       worker.process.pid
  //     );
  //   })}`
  // );

  // set up the adapter on the primary thread
  setupPrimary();
} else {
  // console.log(
  //   `cluster worker id: ${cluster.worker.id}, Worker process started with PID: ${process.pid}`
  // );
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    // set up the adapter on each worker thread
    adapter: createAdapter(),
  });

  const __dirname = dirname(fileURLToPath(import.meta.url));

  app.use(express.static(join(__dirname, "..", "client")));

  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "..", "client", "index.html"));
  });

  const userNicknames = {};

  io.on("connection", async (socket) => {
    console.log("socket id:", socket.id);
    console.log("a user connected");
    socket.emit("set nickname");
    socket.broadcast.emit(
      "chat message",
      `A ${port} user has connected.`,
      null
    );

    socket.on("disconnect", () => {
      console.log("user disconnected");
      socket.broadcast.emit("set offline", userNicknames[socket.id]);
      socket.broadcast.emit(
        "chat message",
        `A ${port} user has disconnected.`,
        null
      );
    });

    socket.on("set nickname", (newNickname, callback) => {
      // userNickname = newNickname;
      userNicknames[socket.id] = newNickname;
      // console.log(`userNicknames: ${JSON.stringify(userNicknames)}`);
      socket.broadcast.emit("set online", newNickname, socket.id);
      callback({
        status: "ok",
      });
    });

    socket.on("set online list", (newUserSocketID, callback) => {
      io.to(newUserSocketID).emit(
        "set online list",
        userNicknames[socket.id],
        socket.id
      );
      callback();
    });

    socket.on(
      "chat message private",
      (msg, senderNickname, receiverSocketId, callback) => {
        console.log(
          "sender:",
          senderNickname,
          " receiverSocketId:",
          receiverSocketId
        );
        io.to(receiverSocketId).emit(
          "chat message private",
          msg,
          senderNickname
        );
        callback();
      }
    );

    socket.on("chat message", async (msg, clientOffset, callback) => {
      let result;
      const nickname = userNicknames[socket.id];
      try {
        // store the message in the database
        result = await db.run(
          "INSERT INTO messages (content, client_offset, nickname) VALUES (?, ?, ?)",
          msg,
          clientOffset,
          nickname
        );
        callback({ status: "ok" });
      } catch (e) {
        if (e.errno === 19 /* SQLITE_CONSTRAINT */) {
          // the message was already inserted, so we notify the client
          callback({ status: "error" });
          return;
        } else {
          // nothing to do, just let the client retry
        }
        return;
      }
      // include the offset with the message
      socket.broadcast.emit("chat message", msg, result.lastID, nickname);
    });

    // console.log("socket.recovered:", socket.recovered);

    socket.on("typing", (user, callback) => {
      io.emit("typing", user);
      callback();
    });

    socket.on("typing end", (user, callback) => {
      io.emit("typing end", user);
      callback();
    });

    if (!socket.recovered) {
      // if the connection state recovery was not successful
      console.log("recover");
      try {
        await db.each(
          "SELECT id, content, nickname FROM messages WHERE id > ?",
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            socket.emit("chat message", row.content, row.id, row.nickname);
          }
        );
      } catch (e) {
        // something went wrong
      }
    }
  });

  // server.listen(3000, () => {
  //   console.log("server running at http://localhost:3000");
  // });

  // each worker will listen on a distinct port
  const port = process.env.PORT;

  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
}
