const Room = require("../models/room");

const createRoom = async (req, res) => {
  const { name } = req.body;
  const roomAlreadyExists = await Room.exists({ name });
  if (!roomAlreadyExists) {
    await Room.create({
      name,
    });
    return res.status(201).send("Room successfully created");
  }
  return res.status(400).send("Room already exists");
};
const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    if (!roomId) return res.status(400).json({ error: "No id specified" });
    const room = await Room.findOne({ name: roomId });
    await room.remove()
    if (!room) return res.status(404).json({ error: "No such room exists" });
    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getAllRooms = async (req, res) => {
  const rooms = await Room.find();
  return res.json(rooms.map((room) => formatRoom(room)));
};
const getMyRooms = async (req, res) => {
  const x = await req.user.populate("rooms.room");
  const rooms = x.rooms.map((r) => formatRoom(r.room));
  return res.json(rooms);
};
const getSpecificRoomMessages = async (req, res) => {
  const name = req.params.roomId;
  const { pageNumber = 0, pageSize = 10 } = req.query;
  if (!name) return res.status(400).json({ error: "No room specified" });
  if (pageSize <= 0)
    return res
      .status(400)
      .json({ error: "Page size must be a non-zero integer" });

  const room = await Room.findOne({ name });
  if (!room) {
    return res
      .status(404)
      .json({ error: `Room ${name} does not exist anymore` });
  }
  const userRooms = req.user.rooms;

  const validRoom = userRooms.some(
    (r) => r.room.toString() === room._id.toString()
  );

  if (!validRoom)
    return res.status(400).json({ error: `User is not part of room ${name}` });

  //Implement Pagination
  const startingIndex = parseInt(pageNumber) * parseInt(pageSize);
  const endingIndex = startingIndex + parseInt(pageSize);
  let returnMessages;
  console.log(startingIndex);
  console.log(endingIndex);
  if (endingIndex === 0) {
    console.log("called");
    returnMessages = room.messages.slice(startingIndex);
  } else {
    returnMessages = room.messages.slice(startingIndex, endingIndex);
  }
  return res.status(200).json(returnMessages);
};
const joinRoom = async (req, res) => {
  const roomId = req.params.roomId;
  if (!roomId) return res.status(400).json({ error: "No id specified" });
  const room = await Room.findOne({ name: roomId });
  if (!room) {
    return res.status(404).json({ error: "Room does not exist" });
  }
  if (room.isPartOfRoom(req.user._id)) {
    return res.status(400).json({ error: "Already joined room" });
  }
  console.log(`Room id is ${room._id}`)
  try {
    room.participants.push({
      pid: req.user._id,
    });
    req.user.rooms.push({
      room: room._id,
    });
    await room.save();
    await req.user.save();
    return res.status(200).send();
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Could not complete action" });
  }
};
const leaveRoom = async (req, res) => {
  try {
    if (!req.params.roomId)
      return res.status(400).json({ error: "Please specify room id" });

    const room = await Room.findOne({ name: req.params.roomId });
    if (!room) return res.status(404).json({ error: "Room does not exist" });
    if (room.isPartOfRoom(req.user._id)) {
      await room.removeParticipant(req.user._id);
      await req.user.leaveRoom(room._id);
      return res.status(200).send();
    }
    return res.status(400).json({ error: "User is not part of room" });
  } catch (error) {
    console.log(error)
    if (error.message == 404)
      return res.status(404).json({ error: "Specified room does not exist" });
    return res.status(500).json({ error: error.message });
  }
};
const formatRoom = (room) => {
  return {
    name: room.name,
    totalParticipants: room.participants.length,
  };
};
module.exports = {
  createRoom,
  getAllRooms,
  getMyRooms,
  getSpecificRoomMessages,
  joinRoom,
  leaveRoom,
  deleteRoom,
};
