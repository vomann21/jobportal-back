const express = require('express')
const Model = require('../models/userSchema')
const User = Model.User
const cloudinary = require('cloudinary').v2;
const jwthashExports = require('../utils/jwthash')

//configuration of cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret
});

exports.userRegistration = async(req,res)=>{
     try
     {
        console.log("entered the userRegistration")
        let {name,email,phone,password,address,firstDomain,secondDomain,thirdDomain,coverletter,role,createdAt}=req.body;
        console.log(req.body)
        if(!email || !name || !password || !phone || !address || !role)
        {
            return res.status(500).json({
                success:false,
                message:"please enter the required fields......"
            })
        }
        
        if((role=='Job Seeker')&&((!firstDomain && !secondDomain) && !thirdDomain))
        {
            return res.status(400).json({
                success:false,
                message:"If you are a Job Seeker, please select the Domain........."
            })
        }

        const exisitingUser = await User.findOne({email})
        if(exisitingUser)
        {
            return res.status(400).json({
                success:false,
                message:"Email already exists, please signin.........."
            })
        }

        const responseFromHashPassword = await jwthashExports.hashPassword(password,res)
        if(responseFromHashPassword.success == true)
        {
            password = responseFromHashPassword.message
            console.log("here is the saved ",password)
        }
        else
        {
            return res.status(400).json(
                responseFromHashPassword
            )
        }

        const userData = {
            name,
            email,
            phone,
            address,
            password,
            role,
            domain:{
                firstDomain,
                secondDomain,
                thirdDomain,
            },
            coverletter,
        }; 
        if(req.files && req.files.resume)
        {
            const {resume} = req.files;
            if(resume)
            {
                try
                {
                    console.log("I am here in cloudinary uploading....")
                    const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath,
                        {folder: "Job_Seekers_Resume"}
                    )
                    if(!cloudinaryResponse || cloudinaryResponse.error)
                    {
                         return res.status(400).json(
                          {
                            success:false,
                            message:"Failed to upload resume to cloudinary."
                          }
                         )
                    }
                    userData.resume = {
                        public_id: cloudinaryResponse.public_id,
                        url:cloudinaryResponse.secure_url
                    }

                    console.log(userData.resume)
                }
                catch(error)
                {
                    return res.status(400).json(
                        {
                            success:false,
                            message:"please upload resume with .pdf or .word as extension......"
                        }
                    )
                }
            }
        }
        console.log("I am here")
        const user = await User.create(userData)
        console.log("New user created.")
        console.log(user)
        return res.status(201).json({
            success:true,
            data:user,
            message:"User Registration successful............."
        })
     }
     catch(err)
     {
        console.log(err.message)
        return res.status(400).json(
            {
                success:false, 
                message:err.message
            }
        )
     }
}


//login route
exports.userLogin = async(req,res)=>{
    try
    {
        const {email,password,role} = req.body;
        console.log(req.body)
        const existingUserEmail = await User.findOne({email})
        if(!email || !password || !role)
            {
                return res.status(500).json({
                    success:false,
                    message:"please enter the required fields......"
                })
            }
        if(!existingUserEmail)
        {
            console.log("in exisiting User Email........")
            return res.status(400).json({
                success:false,
                message:"Email doesn't exist........"
            })
        }
        const dbPassword = existingUserEmail.password
        
        if(!(await jwthashExports.comparePasswords(password,dbPassword)))
        {
            return res.status(400).json({
                success:false,
                message:"Password incorrect........"
            })
        }
        if(!role)
        {
            return res.status(400).json({
                success:false,
                message:"Please enter your role........"
            })
        }
        if(role != existingUserEmail.role)
        {
            return res.status(400).json({
                success:false,
                message:"Please enter role correctly........"
            })
        }
        jwthashExports.generateToken(existingUserEmail,res)
       
    }
    catch(err){
        console.log(err.message)
        return res.status(400).json({
            success:false,
            message:"error in login code....."
        })
    }
}

exports.userLogout = async(req,res)=>{
     res.status(201).cookie("token","",{
        expires: new Date(
            Date.now()
        ),
        httpOnly:true
    }).json({
        success:true,
        message:"Successfully logout......"
    })
}

exports.getUser = async(req,res)=>{
    try
    {
        console.log("I am in getUser.....................................")
        const user = req.currentUser;
        return res.status(200).json({
            success:true,
            user:user,
            message:"User details fetched successfully....."
        })
    }
    catch(err)
    {
        console.log(err.message)
        res.status(400).json({
            success:false,
            message:"error in fetching User details........"
        })
    }
}

exports.updateUser = async(req,res)=>{
    try
    {
        const newDetails = {
            name :req.body.name,
            email :  req.body.email,
            address : req.body.address,
            phone : req.body.phone,
            domain:{
                firstDomain : req.body.firstDomain,
                secondDomain : req.body.secondDomain,
                thirdDomain: req.body.thirdDomain
            },
            
            role : req.body.role,
            createdAt: req.body.createdAt,
            coverletter:req.body.coverLetter,
        }

        
    
        console.log("I am in userController....................update function")
        console.log(newDetails)
        const {firstDomain,secondDomain,thirdDomain} = newDetails.domain
        if((newDetails.role =='Job Seeker')&&((!firstDomain && !secondDomain) && !thirdDomain))
        {
                return res.status(400).json({
                    success:false,
                    message:"If you are a Job Seeker, please select the Domain........."
                })
        }
        if(req.files)
        {
            const resume = req.files.resume;
            if(resume)
            {
                const currentResumeId = req.currentUser.resume.public_id;
                if(currentResumeId)
                {
                    await cloudinary.uploader.destroy(currentResumeId);
                }

                const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath,
                    {folder: "Job_Seekers_Resume"}
                )
                
                if(!cloudinaryResponse || cloudinaryResponse.error)
                    {
                         return res.status(400).json(
                          {
                            success:false,
                            message:"Failed to upload updated resume to cloudinary."
                          }
                         )
                    }
                    newDetails.resume = {
                        public_id: cloudinaryResponse.public_id,
                        url:cloudinaryResponse.secure_url
                    }
            }
        }
        console.log("I am here in middle")
        const updatedUser = await User.findByIdAndUpdate({_id:req.currentUser.id},newDetails,{new:true})
        console.log("updatedUser")
        console.log(updatedUser)
        return res.status(201).json({
            success:true,
            data:updatedUser,
            message:"User details updated successfully............."
        })
    }
    catch(err)
    {
        console.log(err)
        return res.status(400).json({
            success:false,
            message:"Error in updation on user details..........."
        })
    }
}

exports.updatePassword = async(req,res)=>{
    try{
        const {password,newPassword,confirmNewPassword} = req.body;
        console.log(req.body)
        console.log(password, newPassword, confirmNewPassword)
        if(!password || !newPassword || !confirmNewPassword)
        {
            return res.status(400).json({
                success:false,
                message:"please enter the requried fields..........."
            })
        }

        console.log(req.currentUser.password)
        if( !await jwthashExports.comparePasswords(password,req.currentUser.password))
        {
             return res.status(400).json(
                {
                    success:false,
                    message:"Password not matched........"
                }
             )
        }

        if(newPassword != confirmNewPassword)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:"confirm password and new password should be same........."
                }
            )
        }

        const hashedNewPasswordResponse = await jwthashExports.hashPassword(newPassword,res)

        if(hashedNewPasswordResponse.success == false)
        {
            return res.status(400).json({
                success:false,
                message:"Error while hashing password........"
            })
        }
        console.log("before update")
        console.log(req.currentUser)
        req.currentUser.password = hashedNewPasswordResponse.message;

        const currentUser = req.currentUser
        await currentUser.save()
        console.log(currentUser)
        return res.status(200).json({
            success:true,
            message:"Password updated..............."
        })
    }
    catch(err)
    {
        console.log(err.message)
        return res.status(200).json({
            success:false,
            message:"Error in password updation..............."
        })
    }
}