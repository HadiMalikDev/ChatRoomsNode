require('dotenv').config()
const connect = require('./db/connect')
const express = require('express')
const http = require('http')
const socketServer = require('./websockets/sockets')
const router = require('./routes/routes')
const path = require('path')

const app = express()
app.use(express.urlencoded({
    extended:true
}))
app.use(express.json())
app.use(router)

app.use(express.static(path.join(__dirname, '../public')))
console.log(path.join(__dirname, '../public'))
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


//TODO:
//Create frontend side
//And routes
//Then add authentication


/*
{
  "payload":{
    "roomId":"First",
    "message":"Hello 2121",
    "senderId":"fff_user"
  },
  "type":"sendRoomMessage"
}
*/