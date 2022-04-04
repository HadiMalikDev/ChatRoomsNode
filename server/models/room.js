const mongoose = require('mongoose')

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
                required:true,
                unique: true,
            }
        }
    ]
})
roomSchema.methods.isPartOfRoom = function (pid) {
    return this.participants.some(p => p.pid === pid)
}
const Room = mongoose.model('Room', roomSchema)

module.exports = Room