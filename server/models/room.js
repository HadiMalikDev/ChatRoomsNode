const mongoose = require('mongoose')
const User = require('./user')
const roomSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    messages: [
        {
            content: {
                type: String,
                trim: true,
                required: true
            },
            sender: {
                type: String,
                required: true
            }
        }
    ],
    participants: [
        {
            pid: {
                type: mongoose.Types.ObjectId,
                required: true,
            }
        }
    ]
})
roomSchema.methods.isPartOfRoom = function (user) {
    const stringId=user.toString()
    return this.participants.some(p => p.pid.toString() === stringId)
}
roomSchema.methods.removeParticipant = async function (pid) {
    const room = this
    const id=pid.toString()
    room.participants = room.participants.filter(p => p.pid.toString() != id)
    await room.save()
}

roomSchema.post('remove', function (room) {
    room.participants.forEach(async (p) => {
        const user = await User.findById(p.pid)
        if (user) {
            await user.leaveRoom(room)
        }
    })
})

const Room = mongoose.model('Room', roomSchema)

module.exports = Room