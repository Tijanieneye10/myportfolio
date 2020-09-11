const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({

    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
})



userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 8)

     next()
})

userSchema.statics.checkUser = async function (email, password)
{
    const user = await this.findOne({ email })
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
     if(auth)
     {
        return user
     }  
     throw new Error('Invalid Password')   
    }
    throw new Error('Invalid username')
}    
const userModel = mongoose.model('users', userSchema)

module.exports = userModel