const express = require('express')
const userControllerExports = require('../controller/userController')
const middlewares = require('../middlewares/auth')

const userRouter = express.Router()

userRouter.post('/register',userControllerExports.userRegistration)
userRouter.post('/login',userControllerExports.userLogin)

userRouter.put('/update/profile',middlewares.auth,userControllerExports.updateUser)
userRouter.put('/update/password',middlewares.auth,userControllerExports.updatePassword)

userRouter.get('/signout',middlewares.auth,userControllerExports.userLogout)
userRouter.get('/userdetails',middlewares.auth,userControllerExports.getUser)

exports.userRouter = userRouter