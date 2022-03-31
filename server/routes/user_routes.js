const express = require('express')
const {getCurrentUser, loginUser, registerUser,deleteUser} = require('../controllers/users')
const auth = require('../middleware/auth')

const userRouter = express.Router()

userRouter.post('/users/register',registerUser)
userRouter.post('/users/login',loginUser)
userRouter.get('/users/me',auth,getCurrentUser)
userRouter.delete('/users/me',auth,deleteUser)



module.exports=userRouter