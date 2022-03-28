const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        required: true,
        unique: true,
        minlength: [5, 'Length must be greater than 5']
    }
})

const User = mongoose.model(userSchema)

module.exports = User