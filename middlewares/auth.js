const express = require('express')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const userModelExports = require('../models/userSchema')

const User = userModelExports.User

exports.auth = async(req,res,next)=>{
    const {token}=req.cookies;
    console.log("Hello...................................")
    console.log("Printing token...........",token)
    if(!token)
    {
        return res.status(501).json({
            success:false,
            message:"your are not authenticated...."
        })
    }
    const detoken = await jwt.verify(token,process.env.JWT_SECRET_KEY)
    const user = await User.findOne({_id:detoken.id})
    req.currentUser = user

    next();
}

exports.eligible = (...roles)=>{
    return (req,res,next)=>
    {
        if(!roles.includes(req.currentUser.role))
        {
            return res.status(400).json({
                success:false,
                message:`${req.currentUser.role} can't access this functionality`
            })
            
        }
        console.log("Helo...............")
        next();
    }
}