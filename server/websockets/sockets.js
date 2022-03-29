const { WebSocket } = require('ws')
const websocket = require('ws')
const Room = require('../models/room')

const roomsMap = new Map();
//Key is name of room whilst value is array of websockets 
roomsMap.set("First", [])

const sendMessageToRoom = async (payload, conn) => {
    const { message, roomId, senderId } = payload
    const room = await Room.findOne({
        "name": roomId
    })
    if (!room) {
        return conn.send('Given room does not exist')
    }
    //Check if sender is part of room's participants
    if (!room.isPartOfRoom(senderId)) {
        //Sender does not exist in specified room
        return conn.send('Cannot send message to room')
    }
    //Everything checks out
    //Add message to storage first
    room.messages.push({
        "content": message,
        "sender": senderId
    })
    await room.save()
    roomsMap.get(roomId).forEach((e) => {
        console.log("clled")
        if (e.readyState === WebSocket.OPEN) {
            e.send(message)
        }
    })
}

const joinRoom = async (payload, conn) => {
    const { senderId, roomId } = payload
    try {
        const room = await Room.findOne({ name: roomId })

        if (!room) {
            return conn.send('Room does not exist')
        }
        //Add room to list of active rooms if not already done
        if (!roomsMap.has(roomId)) {
            roomsMap.set(roomId, [])
        }
        roomsMap.get(roomId).push(conn)
        if (!room.isPartOfRoom(senderId)) {
            //User is not part of room
            room.participants.push({
                pid: senderId
            })
            await room.save()
        }
        conn.send('Room joined!')
    } catch (error) {
        return conn.send("Could not join room. Maybe you're already in the room")
    }

}

module.exports = (server) => {

    const wss = new websocket.WebSocketServer({
        server: server,
    })
    wss.on('connection', (conn, request, client) => {
        conn.send('Send')
        conn.on('message', async (data) => {
            const { payload, type } = JSON.parse(data)
            if (type === 'sendRoomMessage') {
                sendMessageToRoom(payload, conn)
            }
            else if (type === 'joinRoom') {
                joinRoom(payload, conn)
            }
        })
    })
}

