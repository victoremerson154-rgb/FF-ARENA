const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

app.get("/", (req, res) => {
  res.send("FF Arena Server online!");
});

wss.on("connection", (ws) => {
  let room = null;
  let user = null;

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === "join") {
        room = String(message.room);
        user = {
          id: Math.random().toString(36).slice(2),
          name: message.name || "Usuário",
          camera: false,
          screen: false,
          muted: false
        };

        if (!rooms.has(room)) {
          rooms.set(room, new Map());
        }

        rooms.get(room).set(user.id, {
          ws,
          user
        });

        broadcastUsers(room);
      }

      if (message.type === "status" && room && user) {
        user.camera = !!message.camera;
        user.screen = !!message.screen;
        user.muted = !!message.muted;

        broadcastUsers(room);
      }
    } catch (error) {
      console.log("Mensagem inválida");
    }
  });

  ws.on("close", () => {
    if (!room || !user) return;

    const roomUsers = rooms.get(room);

    if (roomUsers) {
      roomUsers.delete(user.id);

      if (roomUsers.size === 0) {
        rooms.delete(room);
      } else {
        broadcastUsers(room);
      }
    }
  });
});

function broadcastUsers(room) {
  const roomUsers = rooms.get(room);

  if (!roomUsers) return;

  const users = [...roomUsers.values()]
    .map(item => item.user);

  const message = JSON.stringify({
    type: "users",
    users
  });

  roomUsers.forEach(item => {
    if (item.ws.readyState === WebSocket.OPEN) {
      item.ws.send(message);
    }
  });
}

const PORT = process.env.PORT || 10000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`FF Arena Server rodando na porta ${PORT}`);
});
