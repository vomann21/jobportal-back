const mongoose = require('mongoose')

const {Schema} = mongoose;

const jobSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    companyName:{
        type:String,
        required:true,
    },
    logo:{
        public_id:String,
        url:String
    },
    jobType:{
        type:String,
        required:true,
        enum:["Full-time","Internship","Intern+Full-time"]
    },
    location:{
        type:String,
        required:true,
    },
    introduction:{
        type:String,
        required:true
    },
    responsibilities:{
        type:String,
        required:true
    },
    qualifications:{
        type:String,
        required:true
    },
    offers:{
        type:String,
    },
    salary:{
        type:String,
        required:true
    },
    hiringMultipleCandidates:{
        type:String,
        default:"No",
        enum:["Yes","No"]
    },
    personalWebsite:{
        title:String,
        url:String
    },
    jobDomain:{
        type:String,
        required:true
    },
    newsLetterSent:{
        type:Boolean,
        default:false
    },
    jobPostedOn:{
        type:Date,
        default:Date.now()
    },
    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    expiresIn:{
        type:Date,
        required:true
    }
})

exports.Job = mongoose.model('job',jobSchema)