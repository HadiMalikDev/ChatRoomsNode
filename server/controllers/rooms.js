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
    if (!name) return res.status(400).send('No room specified')
    const userRooms = req.user.rooms

    const validRoom = false
    for (const room of userRooms) {
        if (room.room === name.toLowerCase()) {
            validRoom = true
            break
        }
    }
    if (!validRoom) return res.status(400).send(`User is not part of room ${room}`)

    const room = await Room.findOne({ name })
    if (!room) {
        return res.status(404).send(`Room ${name} does not exist anymore`)
    }
    return res.status(200).json(room.messages)
}
const joinRoom = async (req, res) => {
    const roomId = req.params.id
    const room = await Room.findById(roomId)
    if (!room) {
        return res.status(404).send('Room does not exist')
    }
    if (room.isPartOfRoom(req.user._id)) {
        return res.status(400).send('Already joined room')
    }

    try {
        room.participants.push({
            pid: req.user._id
        })
        req.user.rooms.push({
            room: room._id
        })
        await room.save()
        await req.user.save()
        return res.status(200).send('Operation successful')
    } catch (error) {
        return res.status(500).send('Could not complete action')
    }

}

const formatRoom = (room) => {
    return {
        name: room.name,
        totalParticipants: room.participants.length
    }
}
module.exports = { createRoom, getAllRooms, getSpecificRoomMessages, joinRoom }