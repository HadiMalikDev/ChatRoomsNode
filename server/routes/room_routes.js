const express = require('express')

const auth = require('../middleware/auth')
const { getAllRooms, createRoom, getSpecificRoomMessages,joinRoom } = require('../controllers/rooms')

const router = express.Router()



router.get('/rooms', auth, getAllRooms)
router.get('/rooms/:roomId', auth, getSpecificRoomMessages)
router.post('/rooms', auth, createRoom)
router.post('/rooms/join/:id',auth,joinRoom)

module.exports = router