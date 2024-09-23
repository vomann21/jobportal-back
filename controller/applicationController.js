const model = require('../models/applicationSchema')
const jobModel = require('../models/jobSchema')
const mongoose = require('mongoose')
const Application = model.Application;
const Job = jobModel.Job;
const cloudinary = require('cloudinary').v2;

//configuration of cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret
});

exports.postApplication = async(req,res)=>{
    try{
        const id =  req.params.id;
        console.log(id)
        const {name,email,phone,address,coverLetter} = req.body;
        console.log(req.body)
        
        if(!email || !phone || !address || !coverLetter)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:"Please enter the mandatory fields....."
                }
            )
        }

        const currentJob = await Job.findOne({ _id:id })
        console.log(currentJob)

        if(!currentJob)
        {
            return res.status(400).json({
                success:false,
                message:"Job not available"
            })
        }
 
        const isAlreadyApplied = await Application.findOne({
            "jobInfo.id":id,
            "jobSeekerInfo.id":req.currentUser.id
        })

        if(isAlreadyApplied)
        {
            return res.status(400).json({
                success:false,
                message:"You already applied this job........."
            })
        }

        const jobSeekerInfo = {
            id:req.currentUser.id,
            name,
            email,
            phone,
            address,
            coverLetter,
            role:req.currentUser.role
        }
        console.log("request files.........")
        console.log(req.files)
        if(req.files && req.files.resume)
        {
            const {resume}=req.files;
            console.log("Namaste............")
            console.log(resume)
                    try
                    {
                        console.log("I am here in cloudinary uploading....")
                        const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath,
                            {folder: "Job_Seekers_Resume"}
                        )
                        if(!cloudinaryResponse || cloudinaryResponse.error)
                        {
                             return res.status(500).json(
                              {
                                success:false,
                                message:"Failed to upload resume to cloudinary."
                              }
                             )
                        }
                        jobSeekerInfo.resume = {
                            public_id: cloudinaryResponse.public_id,
                            url:cloudinaryResponse.secure_url
                        }
                        console.log("printing job seeker info.......................")
                        console.log(jobSeekerInfo)
                    }
                    catch(error)
                    {
                        return res.status(500).json(
                            {
                                success:false,
                                message:"failed to handle resume uploading......"
                            }
                        )
                    }
                
        }
        else
        {
            if(!req.currentUser.resume || !req.currentUser.resume.url)
            {
                return res.status(400).json({
                    success:false,
                    message:"Resume is mandatory for applying job........",
                })
            }
            jobSeekerInfo.resume={
                public_id:req.currentUser.resume.public_id,
                url:req.currentUser.resume.url
            }
        }
        
       
        const employerInfo={
            id:currentJob.postedBy,
            role:'Employer'
        }

        const jobInfo = {
            id,
            jobTitle:currentJob.title,
            logo:currentJob.logo,
            companyName:currentJob.companyName,
            type:currentJob.jobType
        }

        const newApplication = await Application.create({
            jobSeekerInfo,
            employerInfo,
            jobInfo
        })

        return res.status(200).json({
            success:true,
            message:"Your application is sent to the Company..........."
        })
    }
    catch(err)
    {
        console.log(err.message)
        res.status(400).json({
            success:false,
            message:"error in applying for the job........."
        })
    }
}


exports.employerGetAll = async(req,res)=>{
    try{
        const currentUserId = req.currentUser._id;
        
        const userJobs = await Application.find({
            "employerInfo.id" : currentUserId,
            "deleteBy.employer":false
        })
        
        
        return res.status(200).json({
            success:true,
            data:userJobs,
            message:"applications fetched successfully...."
        })
    }
    catch(err)
    {
        return res.status(400).json({
            success:false,
            message:"Error in fetching employer jobs......"
        })
    }
}


exports.jobSeekerGetAll = async(req,res)=>{
    try
    {
        console.log("I am in jobSeekerGetAll...............")
        const currentUser = req.currentUser;
        const userJobs = await Application.find({
            "jobSeekerInfo.id":currentUser._id,
            "deleteBy.jobSeeker":false
        })
        
        console.log(userJobs)
        return res.status(200).json({
            success:true,
            data:userJobs,
            message:"jobs fetched successfully...."
        })
    }
    catch(err)
    {
        console.log(err.message)
        return res.status(400).json({
            success:false,
            message:"Error in fetching jobSeeker jobs......"
        })
    }
}


exports.deleteApplication = async(req,res)=>{
    try
    {
        const applicationId = req.params.id;
        console.log(applicationId)
        const currentApplication = await Application.findOne({
            "_id":applicationId
        })
        
        if(!currentApplication)
        {
            return res.status(400).json({
                success:false,
                error:"Application not found......."
            })
        }

        const role = req.currentUser.role;

        switch(role)
        {
            case "Employer":
                currentApplication.deleteBy.employer=true
                await currentApplication.save()
                break
            case "Job Seeker":
                currentApplication.deleteBy.jobSeeker=true
                await currentApplication.save()
                break
            default:
                console.log("Default case for deletion function.......")
        }

        if(currentApplication.deleteBy.employer == true && currentApplication.deleteBy.jobSeeker==true)
        {
             await currentApplication.deleteOne();
        }

        return res.status(200).json({
            success:true,
            message:"Application deleted successfully......"
        })
    }
    catch(err)
    {
        console.log(err.message)
        return res.status(400).json({
            success:false,
            error:"error in deleting the application"
        })
    }
}