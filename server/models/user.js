const mongoose = require('mongoose')
const bcrypt=require('bcrypt') 

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        unique: true,
        minlength: [5, 'Length must be greater than 5']
    },
    password:{
        minlength:[8,'Minimum length should be 8'],
        required:true,
        type:String,
    },
    rooms:[
        {
            room:{
                type:String,
                required:true,
                unique:true
            }   
        }
    ]
})
userSchema.pre('save',async function (next) {
    const user=this
    if(user.isModified("password")){
        const encryptedPassword=await bcrypt.hash(user.password,10)
        user.password=encryptedPassword
    }
    next()
})
const User = mongoose.model('User',userSchema)

module.exports = User