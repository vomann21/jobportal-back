const express = require('express')
const User = require('../models/userSchema')
const JobModel = require('../models/jobSchema')
const cloudinary = require('cloudinary')
const Job = JobModel.Job

exports.createJob = async(req,res)=>{
     try{
            console.log("create Job")
            const {
                title,
                companyName,
                jobType,
                location,
                introduction,
                responsibilities,
                qualifications,
                offers,
                salary,
                hiringMultipleCandidates,
                personalWebsiteTitle,
                personalWebsiteUrl,
                jobDomain,
                newsLetterSent,
                expiresIn,
            } = req.body;

            if(!title ||
                !companyName ||
                !jobType ||
                !location ||
                !introduction ||
                !responsibilities ||
                !qualifications ||
                !salary ||
                !jobDomain ||
                !expiresIn
            )
            {
                    return res.status(400).json({
                        success:false,
                        message:"Please enter the required fields..........."
                    })
            }
            if((personalWebsiteTitle && !personalWebsiteUrl) || (personalWebsiteUrl && !personalWebsiteTitle))
            {
                return res.status(400).json(
                    {
                        success:false,
                        message:"Please enter both title and url of the website or ignore both....."
                    }
                )
            }
            
            const jobDetails = {
                title,
                companyName,
                jobType,
                location,
                introduction,
                responsibilities,
                qualifications,
                offers,
                salary,
                hiringMultipleCandidates,
                personalWebsite:{
                    title:personalWebsiteTitle,
                    url:personalWebsiteUrl
                },
                jobDomain,
                newsLetterSent,
                expiresIn
            }

            const postedBy = req.currentUser._id;
            jobDetails.postedBy = postedBy;

            if(req.files && req.files.logo)
            {
                const {logo} = req.files;
                const image = logo;
                if(image)
                {
                    try{
                        const cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath,
                            {folder: "Company_logos"}
                        )
                        if(!cloudinaryResponse || cloudinaryResponse.error)
                        {
                                 return res.status(500).json(
                                  {
                                    success:false,
                                    message:"Failed to upload logo to cloudinary."
                                  }
                                 )
                        }
                        
                        jobDetails.logo = {
                            public_id: cloudinaryResponse.public_id,
                            url: cloudinaryResponse.secure_url
                        };
                        console.log(jobDetails.logo)
                    }
                    catch(err)
                    {
                        console.log(err.message)
                        return res.status(500).json(
                            {
                                success:false,
                                message:"failed to handle logo uploading......"
                            }
                        )
                    }
                }
            }

            const newJob = await Job.create(jobDetails)
            console.log("New job created........")
            return res.status(201).json({
                success:true,
                job:newJob,
                message:"Job creation successful............."
            })
     }
     catch(err)
     {
        console.log(err.message)
        return res.status(500).json(
            {
                success:false,
                message:"failed to handle creating job......"
            }
        )
     }
}


exports.getAllJobs = async(req,res)=>{
    try{
         const {city,domain,keyword} = req.query;
         const query = {}
         if(city)
         {
            query.location={ $regex: city, $options: "i" };
         }
         if(domain)
         {
            query.jobDomain = { $regex: domain, $options: "i" };
         }
         if(keyword)
         {
             query.$or = [
                {title: {$regex:keyword, $options:"i"}},
                {companyName:{$regex:keyword, $options:"i"}},
                {responsibilities:{$regex:keyword, $options:"i"}},
                {introduction:{$regex:keyword, $options:"i"}},
                {qualifications:{$regex:keyword, $options:"i"}},
                {jobDomain:{$regex:keyword, $options:"i"}}
             ]
         }
         console.log(query)
         const jobs = await Job.find(query)
         console.log("these are the jobs")
         console.log(jobs)
         return res.status(200).json({
             success:true,
             jobs:jobs,
             message:"successfully fetched all jobs.............."
         })
    }
    catch(err)
    {
        console.log(err.message)
        return res.status(400).json({
            success:false,
            message:"error in fetched all jobs.............."
        })
    }
}


exports.deleteJob = async(req,res)=>{
    const id = req.params.id;
    console.log("kiko.................",id)
    const job = await Job.findOne({_id:id});
    await job.deleteOne()
    return res.status(200).json({
        success:true,
        message:"Job deleted............",
    })
}

exports.getSingleJob = async(req,res)=>{
    const id = req.params.id;
    const job = await Job.findOne({_id:id});
    if(!job)
    {
        return res.status(401).json({
            success:false,
            message:"job not found........"
        })
    }
    return res.status(200).json({
        success:true,
        job:job,
        message:"job fetched successfully......."
    })
}

exports.getMyJobs = async(req,res)=>{
    const id = req.currentUser.id;
    const jobs = await Job.find({postedBy:id})
    if(!jobs)
    {
        return res.status(400).json({
            success:false,
            message:"No jobs found........."
        })
    }
    return res.status(200).json({
        success:true,
        data:jobs,
        message:"Fetched all your jobs........."
    })
}