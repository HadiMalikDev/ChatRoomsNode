const ws = new WebSocket("ws://localhost:3000/");
const messagesList = document.getElementById("messages");

let currentRoom;
let pageNumber = -1,
  pageSize = 10; //Page Number and page size needs to be negative we want the LAST x messages

const makeRoomTile = (room, isUserRoom) => {
  const div = document.createElement("div");
  div.className = "bg-slate-600 rounded p-[8px] m-[10px]";
  const h1Tag = document.createElement("h1");
  h1Tag.textContent = room.name;
  h1Tag.className = "text-white font-bold text-lg";
  const h4Tag = document.createElement("h4");
  h4Tag.className = "text-slate-200";
  h4Tag.textContent = room.totalParticipants + " participants";
  div.appendChild(h1Tag);
  div.appendChild(h4Tag);
  if (isUserRoom) {
    const joinButton = document.createElement("button");
    joinButton.id = `room-join-${room.name}`;
    joinButton.className =
      "p-[5px] b-[0px] bg-cyan-500 text-white rounded-lg disabled:bg-slate-500";
    joinButton.textContent = "Join";
    joinButton.addEventListener("click", () => joinRoomClickListener(room));
    div.appendChild(joinButton);

    const removeButton = document.createElement("button");
    removeButton.id = `room-remove-${room.name}`;
    removeButton.className =
      "p-[5px] b-[0px] mx-[4px] bg-red-500 text-white rounded-lg";
    removeButton.textContent = "Leave As Room Participant";
    removeButton.addEventListener("click", () => leaveRoomClickListener(room));
    div.appendChild(removeButton);
  }
  return div;
};
const appendToLogs = (message) => {
  const logDOM = document.getElementById("logs");
  const pTag = document.createElement("p");
  pTag.textContent = message;
  logDOM.appendChild(pTag);
};
const becomeRoomParticipant = async () => {
  const roomId = document.getElementById("room-id").value;
  const res = await fetch(`/rooms/join/${roomId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: localStorage.getItem("token"),
    },
  });
  if (res.ok) {
    getAllRooms();
    getSelfRooms();
  } else {
    const body = await res.json();
    alert(`Could not join room ${roomId}. ${body.error}`);
  }
};
const setUserName = async () => {
  const user = await fetch("/users/me", {
    headers: {
      "Content-Type": "application/json",
      authorization: localStorage.getItem("token"),
    },
  });
  const json = await user.json();
  const userName = json.name;
  document.getElementById("username").textContent = userName || "";
};
const clearMessagesScreen = () => {
  const messages = document.getElementById("messages");
  while (messages.firstChild) {
    messages.removeChild(messages.firstChild);
  }
};
const createRoom = async () => {
  const errorMessage = document.getElementById("create-room-error");
  errorMessage.textContent = "";
  const roomId = document.getElementById("create-room").value;
  const res = await fetch("/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: localStorage.getItem("token"),
    },
    body: JSON.stringify({
      name: roomId,
    }),
  });
  if (res.ok) {
    getAllRooms();
    getSelfRooms();
  } else {
    const err = await res.json();
    errorMessage.textContent = err.error || "An unexpected error occured";
  }
};

const getAllRooms = async () => {
  const list = document.getElementById("all-rooms-list");
  removeAllChildNodes(list);
  const res = await fetch("/rooms/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: localStorage.getItem("token"),
    },
  });
  if (res.ok) {
    const data = await res.json();
    data.forEach((room) => list.appendChild(makeRoomTile(room, false)));
  }
};
const getSelfRooms = async () => {
  const list = document.getElementById("rooms-list");
  removeAllChildNodes(list);
  const res = await fetch("/rooms/self", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: localStorage.getItem("token"),
    },
  });
  if (res.ok) {
    const data = await res.json();
    data.forEach((room) => list.appendChild(makeRoomTile(room, true)));
  }
};
//Handles updating buttons whenever user joins a new room
const handleRoomChange = (new_room) => {
  if (currentRoom) {
    const button = document.getElementById(`room-join-${currentRoom}`);
    button.disabled = false;
    button.textContent = "Join";
  }
  const button = document.getElementById(`room-join-${new_room}`);
  button.disabled = true;
  button.textContent = "Joined";
  currentRoom = new_room;
  clearMessagesScreen();
};
const joinRoomClickListener = (room) => {
  const token = localStorage.getItem("token");
  const roomId = room.name;

  //Unsubscribe to previous room messages before joining current room
  if (ws.readyState === ws.OPEN && currentRoom) {
    const dataToSend = {
      type: "leaveRoom",
      payload: {
        senderId: token,
        roomId: currentRoom,
      },
    };
    ws.send(JSON.stringify(dataToSend));
  }
  if (ws.readyState === ws.OPEN) {
    const dataToSend = {
      type: "joinRoom",
      payload: {
        senderId: token,
        roomId,
      },
    };
    ws.send(JSON.stringify(dataToSend));
  }
};
const leaveRoomClickListener = async (room) => {
  const roomId = room.name;
  if (currentRoom == roomId)
    return alert("Cannot remove room that you have joined");
  const res = await fetch(`/rooms/leave/${roomId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: localStorage.getItem("token"),
    },
  });
  if (res.ok) {
    getAllRooms();
    getSelfRooms();
  } else {
    const err = await res.json();
    alert(err.error || "Could not leave room");
  }
};
const loadMessages = async () => {
  const res = await fetch(
    `/rooms/${currentRoom}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
    }
  );
  if (res.ok) {
    const data = await res.json();
    if (data.length != 0) pageNumber += 1;
    for (var i = data.length - 1; i >= 0; i--) {
      prependMessagesToDOM(data[i], true);
    }
  } else {
    const x = await res.json();
  }
};
const logout = () => {
  ws.close();
  localStorage.removeItem("token");
  window.location.replace("http://localhost:3000/html/login.html");
};
const prependMessagesToDOM = (message, prepend = false) => {
  const para = document.createElement("div");
  para.className = "bg-slate-700 border-[2px] bg-slate-900 my-[5px]";
  const messageSender = document.createElement("h2");
  messageSender.textContent = message.sender;
  messageSender.style.marginRight = "10px";
  para.appendChild(messageSender);
  const messageContent = document.createElement("p");
  messageContent.textContent = message.content;
  para.appendChild(messageContent);
  if (prepend) messagesList.prepend(para);
  else messagesList.appendChild(para);
  messagesList.scrollTop=messagesList.scrollHeight;
};

const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};
const sendMessage = () => {
  const messageContent = document.getElementById("text-bar").value;
  const message = {
    type: "sendRoomMessage",
    payload: {
      message: messageContent,
      senderId: localStorage.getItem("token"),
      roomId: currentRoom,
    },
  };
  ws.send(JSON.stringify(message));
};

getAllRooms();
getSelfRooms();
setUserName();
document.getElementById("logout").addEventListener("click", () => logout());
document
  .getElementById("ld-messages")
  .addEventListener("click", () => loadMessages());
document
  .getElementById("send-message-button")
  .addEventListener("click", () => sendMessage());
document
  .getElementById("become-participant")
  .addEventListener("click", () => becomeRoomParticipant());
document
  .getElementById("create-room-button")
  .addEventListener("click", () => createRoom());

//websocket logic
ws.onopen = function () {};
ws.onmessage = function messageHandler(msg) {
  const { error, message } = JSON.parse(msg.data);
  if (error) {
    return alert(message);
  }
  if (message.sender === "roomJoinConfirmation") {
    handleRoomChange(message.room);
    appendToLogs(message.content);
  } else if (message.sender === "leaveRoomConfirmation") {
    appendToLogs(message.content);
  } else if (!message.sender || message.sender === "") {
    //Bot message
    appendToLogs(message.content);
  } else {
    //Append to main window only if messages received are of current room
    if (message.room === currentRoom) {
      prependMessagesToDOM(message);
    }
  }
};
