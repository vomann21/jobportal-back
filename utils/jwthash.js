const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

exports.hashPassword = async(password,res)=>{
    try
    {
        const hash = await bcrypt.hashSync(password,process.env.HASH_COUNT);
            console.log(hash)
               return {
                    success:true,
                    message:hash
                }
    }
    catch(err)
    { 
        console.log(err.message)
        return{
                success:false,
                message: "error while hashing the password...."
            }
        
    }
}

exports.comparePasswords = async(password,dbPassword)=>{
    return await bcrypt.compare(password, dbPassword)
}


//jwt.......................................................
exports.generateToken = async(user,res)=>{
    const token = await jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.EXPIRESIN });
    const options = {
        expires: new Date(
            Date.now()+ 7*1000*60*60*24
        ),
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    };
    res.cookie("token",token,options).status(201).json({
         success:"true",
         message:"login successfull.....",
         user,
         token
    })
}