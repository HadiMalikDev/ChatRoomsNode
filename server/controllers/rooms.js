const Room = require('../models/room')


const createRoom = async (req, res) => {
    const { name } = req.body
    const roomAlreadyExists = await Room.exists({ name })
    if (!roomAlreadyExists) {
        await Room.create({
            name,
        })
        return res.status(201).send('Room successfully created')
    }
    return res.status(400).send('Room already exists')
}

const getAllRooms = async (req, res) => {
    const rooms = await Room.find({})
    return res.json(rooms.map((room) => formatRoom(room)))
}
const getSpecificRoomMessages = async (req, res) => {
    const { name } = req.body
    const room = await Room.findOne({ name })
}
const formatRoom = (room) => {
    return {
        name: room.name,
        totalParticipants: room.participants.length
    }
}
module.exports = { createRoom, getAllRooms, getSpecificRoomMessages }