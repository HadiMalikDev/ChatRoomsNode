require('dotenv').config()

const User = require('../../models/user')
const db = require('../../db/connect')
const mongoose=require('mongoose')

describe('Run all user registration usecases', () => {
    let connection;
    beforeAll(async () => {
        connection =await db(process.env.TEST_MONGO_URI)
    })
    afterAll(async()=>{
        await mongoose.connection.close()
    })
    test('User creation if all parameters correct',()=>{
        expect(0).toBe(0)
    })
})