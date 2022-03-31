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
        const err = makeFormattedError('Given room does not exist')
        return conn.send(JSON.stringify(err))
    }
    //Check if sender is part of room's participants
    if (!room.isPartOfRoom(senderId)) {
        const err = makeFormattedError('Cannot send message to room')
        //Sender does not exist in specified room
        return conn.send(JSON.stringify(err))
    }
    //Everything checks out
    //Add message to storage first
    room.messages.push({
        "content": message,
        "sender": senderId
    })
    await room.save()
    roomsMap.get(roomId).forEach((e) => {
        if (e.readyState === WebSocket.OPEN) {
            const jsonMessage = makeFormattedMessage(message, senderId)
            e.send(JSON.stringify(jsonMessage))
        }
    })
}

const joinRoom = async (payload, conn) => {
    const { senderId, roomId } = payload

    if (!senderId || !roomId) {
        const errorMessage = makeFormattedError('One or more required fields have not been specified')
        return conn.send(JSON.stringify(errorMessage))
    }

    try {
        const room = await Room.findOne({ name: roomId })

        if (!room) {
            const err = makeFormattedError('Room does not exist')
            return conn.send(JSON.stringify(err))
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
        const message = makeFormattedMessage(`Room ${roomId} joined!`, '')
        conn.send(JSON.stringify(message))
    } catch (error) {
        const err = makeFormattedError("Could not join room. Maybe you're already in the room")
        return conn.send(JSON.stringify(err))
    }

}
const makeFormattedError = (errorMessage) => {
    return {
        error: errorMessage
    }
}
const makeFormattedMessage = (message, senderId) => {
    return {
        message: {
            content: message,
            sender: senderId
        }
    }
}

function heartbeat() {
    this.isAlive = true
}

module.exports = (server) => {

    const wss = new websocket.WebSocketServer({
        server: server,
    })
    wss.on('connection', (conn, request, client) => {
        conn.isAlive = true
        conn.on('pong', heartbeat)
        const welcomeMessage = makeFormattedMessage('Websocket Connection established', '')
        conn.send(JSON.stringify(welcomeMessage))
        conn.on('message', async (data) => {
            const { payload, type } = JSON.parse(data)
            if (type === 'sendRoomMessage') {
                sendMessageToRoom(payload, conn)
            }
            else if (type === 'joinRoom') {
                joinRoom(payload, conn)
            }
            else {
                const err = makeFormattedError(`${type} is not a supported message type`)
                conn.send(JSON.stringify(err))
            }
        })

    })
    const interval = setInterval(() => {
        wss.clients.forEach((socket) => {
            if (socket.isAlive === false) {
                roomsMap.forEach((value,key)=>{
                    if(value.includes(socket)){
                        const index = value.indexOf(socket);
                        value.splice(index,1)
                    }
                })
                return socket.terminate()
            }
            socket.isAlive = false
            socket.ping()
        })
        
    }, 30000);
    wss.on('close', function () {
        clearInterval(interval);
    });
}

