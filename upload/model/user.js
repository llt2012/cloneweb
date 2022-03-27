const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username :{type: String,require:true,unique:true},
    password:{type:String,require:true},
    role:{type:String,require:true},
    token: { type: String }
},{
    collection:"users"
})

const model = mongoose.model("UserSchema",UserSchema)

module.exports = model