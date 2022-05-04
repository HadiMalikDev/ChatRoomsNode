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
    joinButton.id = `room-${room.name}`;
    joinButton.className =
      "p-[5px] b-[0px] bg-cyan-500 text-white rounded-lg disabled:bg-slate-500";
    joinButton.textContent = "Join";
    joinButton.addEventListener("click", () => joinRoomClickListener(room));
    div.appendChild(joinButton);
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
    console.log("room joined");
    getAllRooms();
    getSelfRooms();
  } else {
    const body = await res.json();
    alert(`Could not join room ${roomId}. ${body.error}`);
  }
};

const clearMessagesScreen = () => {
  const messages = document.getElementById("messages");
  while (messages.firstChild) {
    messages.removeChild(messages.firstChild);
  }
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
  const data = await res.json();
  data.forEach((room) => list.appendChild(makeRoomTile(room, false)));
  console.log(data);
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
  const data = await res.json();
  data.forEach((room) => list.appendChild(makeRoomTile(room, true)));
  console.log(data);
};
//Handles updating buttons whenever user joins a new room
const handleRoomChange = (new_room) => {
  if (currentRoom) {
    const button = document.getElementById(`room-${currentRoom}`);
    button.disabled = false;
    button.textContent = "Join";
  }
  const button = document.getElementById(`room-${new_room}`);
  button.disabled = true;
  button.textContent = "Joined";
  currentRoom = new_room;
  clearMessagesScreen();
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
    console.log(x);
  }
};
const logout=()=>{
  ws.close()
  localStorage.removeItem('token')
  window.location.replace('localhost:3000/html/login.html')
}
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
//websocket logic

const joinRoomClickListener = (room) => {
  const token = localStorage.getItem("token");
  const roomId = room.name;

  //Unsubscribe to previous room messages before joining current room
  if (ws.readyState === ws.OPEN && currentRoom) {
    console.log(currentRoom);
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

ws.onopen = function () {
  console.log("Connected to the server");
};
ws.onmessage = function messageHandler(msg) {
  const { error, message } = JSON.parse(msg.data);
  console.log(JSON.parse(msg.data));
  if (error) {
    console.log(error);
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
