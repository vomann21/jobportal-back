const mongoose = require('mongoose')
const {Schema} = mongoose;

const applicationSchema = new Schema({
    jobSeekerInfo:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'User'
        },
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
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
            required:true 
        },
        resume:{
            public_id:String,
            url:String, 
        },
        coverLetter:{
            type:String,
            required:true
        },
        role:{
            type:String,
            enum:['Job Seeker'],
            requried:true
        },
        appliedOn:{
            type:Date,
            default:Date.now()
        }
    },
    employerInfo:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'User'
        },
    
        role:{
            type:String,
            required:true,
            enum:['Employer']
        }
    },
    jobInfo:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Job"
        },
        jobTitle:{
            type:String,
            required:true
        },
        logo:{
            public_id:String,
            url:String
        },
        type:{
            type:String,
            required:true
        },
        companyName:{
            type:String,
            required:true
        }
    },
    deleteBy:{
        jobSeeker:{
            type:Boolean,
            default:false
        },
        employer:{
            type:Boolean,
            default:false
        }
    }
})

exports.Application = mongoose.model('application',applicationSchema);