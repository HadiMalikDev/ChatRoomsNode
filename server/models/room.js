const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    messages: [
        {
            message: {
                type: String,
                required: true
            },
            sender: {
                type: mongoose.SchemaTypes.ObjectId,
                required: true
            }
        }
    ]
})
const Room = mongoose.model(roomSchema)

module.exports = Room