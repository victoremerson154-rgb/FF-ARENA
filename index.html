const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 10000;
const ADMIN_CODE = process.env.ADMIN_CODE || "troque-este-codigo";

const rooms = new Map();

function createId() {
  return crypto.randomBytes(8).toString("hex");
}

function cleanName(name) {
  return String(name || "Usuário")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 30) || "Usuário";
}

function send(ws, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  return rooms.get(roomId);
}

function publicUser(client) {
  return {
    id: client.id,
    name: client.name,
    role: client.role,
    camera: client.camera,
    screen: client.screen,
    muted: client.muted
  };
}

function broadcastRoomUsers(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const users = [...room.values()].map(publicUser);

  for (const client of room.values()) {
    send(client.ws, {
      type: "users",
      users
    });
  }
}

wss.on("connection", (ws) => {
  const client = {
    ws,
    id: createId(),
    name: "Usuário",
    room: null,
    role: "MEMBRO",
    camera: false,
    screen: false,
    muted: false
  };

  ws.on("message", (raw) => {
    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (message.type) {
      case "join":
        joinRoom(client, message);
        break;

      case "status":
        updateStatus(client, message);
        break;

      case "offer":
        relayToPeer(client, message, "offer");
        break;

      case "answer":
        relayToPeer(client, message, "answer");
        break;

      case "ice-candidate":
        relayToPeer(client, message, "ice-candidate");
        break;

      case "owner-login":
        ownerLogin(client, message);
        break;

      case "set-role":
        setRole(client, message);
        break;

      case "mute-user":
        muteUser(client, message);
        break;

      case "unmute-user":
        unmuteUser(client, message);
        break;
    }
  });

  ws.on("close", () => leaveRoom(client));
  ws.on("error", () => leaveRoom(client));
});

function joinRoom(client, message) {
  const roomId = String(message.room || "1");

  if (client.room) {
    leaveRoom(client);
  }

  const room = getRoom(roomId);

  if (room.size >= 8) {
    send(client.ws, {
      type: "room-full",
      message: "Esta análise já está cheia."
    });

    return;
  }

  client.room = roomId;
  client.name = cleanName(message.name);

  room.set(client.id, client);

  const peers = [...room.values()]
    .filter(peer => peer.id !== client.id)
    .map(publicUser);

  send(client.ws, {
    type: "joined",
    id: client.id,
    room: roomId,
    role: client.role,
    peers
  });

  for (const peer of room.values()) {
    if (peer.id === client.id) continue;

    send(peer.ws, {
      type: "peer-joined",
      user: publicUser(client)
    });
  }

  broadcastRoomUsers(roomId);
}

function leaveRoom(client) {
  if (!client.room) return;

  const roomId = client.room;
  const room = rooms.get(roomId);

  if (!room) {
    client.room = null;
    return;
  }

  room.delete(client.id);

  for (const peer of room.values()) {
    send(peer.ws, {
      type: "peer-left",
      id: client.id
    });
  }

  if (room.size === 0) {
    rooms.delete(roomId);
  } else {
    broadcastRoomUsers(roomId);
  }

  client.room = null;
}

function updateStatus(client, message) {
  if (!client.room) return;

  client.camera = Boolean(message.camera);
  client.screen = Boolean(message.screen);
  client.muted = Boolean(message.muted);

  broadcastRoomUsers(client.room);
}

function relayToPeer(client, message, type) {
  if (!client.room) return;

  const room = rooms.get(client.room);
  if (!room) return;

  const target = room.get(String(message.target || ""));
  if (!target) return;

  send(target.ws, {
    type,
    from: client.id,
    data: message.data || null
  });
}

function ownerLogin(client, message) {
  const code = String(message.code || "");

  if (code !== ADMIN_CODE) {
    send(client.ws, {
      type: "owner-login-result",
      success: false,
      message: "Código incorreto."
    });

    return;
  }

  client.role = "DONO";

  send(client.ws, {
    type: "owner-login-result",
    success: true,
    role: "DONO"
  });

  if (client.room) {
    broadcastRoomUsers(client.room);
  }
}

function canManageRoles(client) {
  return client.role === "DONO";
}

function canModerate(client) {
  return (
    client.role === "DONO" ||
    client.role === "ADM" ||
    client.role === "TELADOR"
  );
}

function setRole(client, message) {
  if (!canManageRoles(client)) {
    send(client.ws, {
      type: "error",
      message: "Somente o Dono pode alterar cargos."
    });

    return;
  }

  if (!client.room) return;

  const room = rooms.get(client.room);
  if (!room) return;

  const target = room.get(String(message.target || ""));
  if (!target) return;

  const allowedRoles = [
    "MEMBRO",
    "TELADOR",
    "ADM"
  ];

  const role = String(message.role || "MEMBRO");

  if (!allowedRoles.includes(role)) return;

  target.role = role;

  send(target.ws, {
    type: "role-changed",
    role
  });

  broadcastRoomUsers(client.room);
}

function muteUser(client, message) {
  if (!canModerate(client)) {
    send(client.ws, {
      type: "error",
      message: "Você não tem permissão para mutar."
    });

    return;
  }

  if (!client.room) return;

  const room = rooms.get(client.room);
  if (!room) return;

  const target = room.get(String(message.target || ""));
  if (!target) return;

  target.muted = true;

  send(target.ws, {
    type: "force-mute",
    by: client.id
  });

  broadcastRoomUsers(client.room);
}

function unmuteUser(client, message) {
  if (!canModerate(client)) return;
  if (!client.room) return;

  const room = rooms.get(client.room);
  if (!room) return;

  const target = room.get(String(message.target || ""));
  if (!target) return;

  target.muted = false;

  send(target.ws, {
    type: "force-unmute",
    by: client.id
  });

  broadcastRoomUsers(client.room);
}

app.get("/", (req, res) => {
  res.status(200).send("FF Arena Server online!");
});

app.get("/health", (req, res) => {
  res.json({
    online: true,
    rooms: rooms.size
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`FF Arena Server rodando na porta ${PORT}`);
});
