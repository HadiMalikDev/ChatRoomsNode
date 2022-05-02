const appendToRoomList = (room) => {
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
  document.getElementById("rooms-list").appendChild(div);
};

const getAllRooms = async () => {
  const res = await fetch("/rooms/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: localStorage.getItem("token"),
    },
  });
  const data = await res.json();
  data.forEach(room => appendToRoomList(room));
  console.log(data);
};
getAllRooms();
