require('dotenv').config()
const connect = require('./db/connect')
const express = require('express')
const http = require('http')
const socketServer = require('./websockets/sockets')

const app = express()
const PORT = process.env.PORT || 3000
const server = http.createServer(app)

const startApplication = async () => {
    await connect(process.env.MONGO_URI)
    socketServer(server)
    server.listen(PORT, () => {
        console.log("Server up")
    })
}

startApplication()
