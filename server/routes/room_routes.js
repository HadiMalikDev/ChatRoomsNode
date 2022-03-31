const express = require('express')
const { getAllRooms, createRoom, getSpecificRoomMessages } = require('../controllers/rooms')

const router = express.Router()



router.get('/rooms', getAllRooms)
router.get('/rooms/:roomId', getSpecificRoomMessages)
router.post('/rooms', createRoom)


module.exports = router