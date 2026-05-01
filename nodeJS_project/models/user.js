const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true,
        trim: true
    },
    last_name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone:{
        type:Number,
        required: true,
        unique: true,
        trim: true
    },
    city:{
        type:String,
        required: true,
        trim: true,
        uppercase: true
    },
    password:{
        type: String,
        required: true,
        minlength: 8
    },
    date:{
        type: Date,
        default: Date.now
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports = {userModel}
