const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema(
    {
        name:{
            type:String,
            required:true,
            minLength:[3,"name should be atleast 3 characters"],
            maxLength:[30,"name should be atmost 30 characters"]
        },
        email:{
            type:String,
            required:true,
            unique:true,
            match:[
                 /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please enter a valid email address"
            ]
        },
        phone:{
            type:Number,
            required:true,
        },
        address:{
            type:String,
            required:true,
        },
        domain:{
            firstDomain:String,
            secondDomain:String,
            thirdDomain:String
        },
        password:{
            type:String,
            required:true,
            minLength:[6,'password should contain atleast 6 characters']
        },
        resume:{
            public_id:String,
            url:String
        },
        coverletter:{
            type:String
        },
        role:{
            type:String,
            required:true,
            enum:["Job Seeker","Employer"] //enum means restricting to these 2 values.
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }
)

exports.User = mongoose.model('user',userSchema)