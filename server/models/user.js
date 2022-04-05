const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Room = require('./room')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Length must be greater than 5']
    },
    password: {
        minlength: [8, 'Minimum length should be 8'],
        required: true,
        type: String,
    },
    rooms: [
        {
            room: {
                type: mongoose.Types.ObjectId,
                required: true,
                unique: true
            }
        }
    ]
})
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified("password")) {
        const encryptedPassword = await bcrypt.hash(user.password, 10)
        user.password = encryptedPassword
    }
    next()
})
//Deleting user deletes room a user was part of
userSchema.post('remove', async function (user) {
    user.rooms.forEach(async (r) => {
        const room = await Room.findById(r.room)
        if (room)
            await room.removeParticipant(user._id)
    })
})

userSchema.methods.leaveRoom = async function (roomId) {
    const user = this
    user.rooms=user.rooms.filter((room)=>room.room!=roomId)
    await user.save()
}

const User = mongoose.model('User', userSchema)

module.exports = User