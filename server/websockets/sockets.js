const { WebSocket } = require("ws");
const websocket = require("ws");
const Room = require("../models/room");
const User = require("../models/user");

const roomsMap = new Map();
//Key is name of room whilst value is array of websockets
const sendMessageToRoom = async (payload, conn) => {
  const { message, roomId, senderId } = payload;
  const room = await Room.findOne({
    name: roomId,
  });
  if (!room) {
    const err = makeFormattedError("Given room does not exist");
    return conn.send(JSON.stringify(err));
  }
  const user = await User.findByToken(senderId);
  if (!user) {
    const err = makeFormattedError("Authentication failed");
    return conn.send(JSON.stringify(err));
  }
  //Check if sender is part of room's participants
  if (!room.isPartOfRoom(user._id)) {
    const err = makeFormattedError("Cannot send message to room");
    //Sender does not exist in specified room
    return conn.send(JSON.stringify(err));
  }
  //Everything checks out
  //Add message to storage first
  room.messages.push({
    content: message,
    sender: user.name,
  });
  await room.save();
  roomsMap.get(roomId).forEach((e) => {
    if (e.readyState === WebSocket.OPEN) {
      const jsonMessage = makeFormattedMessage(message, user.name, roomId);
      e.send(JSON.stringify(jsonMessage));
    }
  });
};

const joinRoom = async (payload, conn) => {
  const { senderId, roomId } = payload;

  if (!senderId || !roomId) {
    const errorMessage = makeFormattedError(
      "One or more required fields have not been specified"
    );
    return conn.send(JSON.stringify(errorMessage));
  }

  try {
    const room = await Room.findOne({ name: roomId });

    if (!room) {
      const err = makeFormattedError("Room does not exist");
      return conn.send(JSON.stringify(err));
    }
    const user = await User.findByToken(senderId);
    if (!user) {
      const err = makeFormattedError("Token verification failed");
      return conn.send(JSON.stringify(err));
    }

    //Add room to list of active rooms if not already done
    if (!roomsMap.has(roomId)) {
      roomsMap.set(roomId, []);
    }
    console.log(roomsMap.get(roomId).length);
    console.log(roomsMap.get(roomId).includes(conn));
    roomsMap.get(roomId).push(conn);

    //Check if user is joining room for first time
    if (!room.isPartOfRoom(user._id)) {
      const err=makeFormattedError("Room not joined yet. Join room before entering");
      return conn.send(JSON.stringify(err));
    }
    const message = makeFormattedMessage(
      `Room ${roomId} joined!`,
      "roomJoinConfirmation",
      roomId
    );
    console.log(roomsMap.get(roomId).length);
    conn.send(JSON.stringify(message));
  } catch (error) {
    console.log(error);
    const err = makeFormattedError(
      "Could not join room. Maybe you're already in the room"
    );
    return conn.send(JSON.stringify(err));
  }
};
const makeFormattedError = (errorMessage) => {
  return {
    error: errorMessage,
  };
};
const makeFormattedMessage = (message, senderId, roomName) => {
  return {
    message: {
      content: message,
      sender: senderId,
      room: roomName,
    },
  };
};
const leaveRoomSubscription = async (payload, conn) => {
  const { senderId, roomId } = payload;
  if (!senderId || !roomId) {
    const errorMessage = makeFormattedError(
      "One or more required fields are missing"
    );
    return conn.send(JSON.stringify(errorMessage));
  }
  const user = await User.findByToken(senderId);
  if (!user) {
    const errorMessage = makeFormattedError("No such user exists.");
    return conn.send(JSON.stringify(errorMessage));
  }
  if (!roomsMap.has(roomId)) {
    const errorMessage = makeFormattedError(
      "Specified room is not active right now"
    );
    return conn.send(JSON.stringify(errorMessage));
  }
  //Remove ws object from room
  const index = roomsMap.get(roomId).indexOf(conn);
  const removedConn = roomsMap.get(roomId).splice(index, 1);
  const message = makeFormattedMessage(
    `Room ${roomId} left`,
    "leaveRoomConfirmation",
    roomId
  );
  return conn.send(JSON.stringify(message));
};
function heartbeat() {
  this.isAlive = true;
}

module.exports = (server) => {
  const wss = new websocket.WebSocketServer({
    server: server,
  });
  wss.on("connection", (conn, request, client) => {
    conn.isAlive = true;
    conn.on("pong", heartbeat);
    const welcomeMessage = makeFormattedMessage(
      "Websocket Connection established",
      "",
      ""
    );
    conn.send(JSON.stringify(welcomeMessage));
    conn.on("message", async (data) => {
      const { payload, type } = JSON.parse(data);
      if (type === "sendRoomMessage") {
        sendMessageToRoom(payload, conn);
      } else if (type === "joinRoom") {
        joinRoom(payload, conn);
      } else if (type === "leaveRoom") {
        leaveRoomSubscription(payload, conn);
      } else {
        const err = makeFormattedError(
          `${type} is not a supported message type`
        );
        conn.send(JSON.stringify(err));
      }
    });
  });
  const interval = setInterval(() => {
    roomsMap.forEach((value, key) => {
      value.forEach((socket) => {
        if (!socket.isAlive || socket.readyState===socket.CLOSED) {
          const index = value.indexOf(socket);
          value.splice(index, 1);
          socket.terminate()
        }
      });
    });
    wss.clients.forEach((socket)=>{
      if(!socket.isAlive){
        socket.terminate();
      }
    })
    // wss.clients.forEach((socket) => {
    //   if (socket.isAlive === false) {
    //     console.log("called");
    //     roomsMap.forEach((value, key) => {
    //       if (value.includes(socket)) {
    //         const index = value.indexOf(socket);
    //         value.splice(index, 1);
    //       }
    //     });
    //     return socket.terminate();
    //   }
    //   socket.isAlive = false;
    //   socket.ping();
    // });
  }, 1000);
  wss.on("close", function () {
    clearInterval(interval);
  });
};
