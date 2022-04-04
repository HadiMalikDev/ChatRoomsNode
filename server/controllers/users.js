const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const getCurrentUser = (req, res) => {
    res.send(req.user)
}

const loginUser = async (req, res) => {
    try {
        const { name, password } = req.body
        if (!(name && password)) {
            return res.status(400).send('All fields are required by the server')
        }
        const user = await User.findOne({ name })
        if (user && await bcrypt.compare(password, user.password)) {
            const jwtToken=jwt.sign(user._id.toString(),process.env.SECRET)
            return res.status(200).send(jwtToken)
        }
        return res.status(400).send('Login authentication failed')
    } catch (error) {
        return res.status(500).send('Please try again later')
    }
}

const registerUser = async (req, res) => {
    try {
        const { name, password } = req.body
        if (!(name && password)) {
            return res.status(400).send('All fields are required by the server')
        }
        const user = new User({
            name,
            password
        })
        await user.save()
        const jwtToken = jwt.sign(user._id.toString(), process.env.SECRET)
        return res.status(200).send(jwtToken)
    } catch (error) {
        console.log(error)
        let message = ' '
        if (error instanceof mongoose.Error) {
            message += error._message || ''
        }
        res.status(500).send(`Could not register user.${message}`)
    }
}
const deleteUser = async (req, res) => {
    try {
        const user = req.user
        await user.delete()
        res.status(204).send()
    } catch (error) {
        res.status(500).send('Could not complete operation')
    }
}

module.exports = { getCurrentUser, loginUser, registerUser, deleteUser }