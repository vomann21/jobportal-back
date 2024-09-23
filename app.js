const express = require('express')
require('dotenv').config({ path: './config/config.env' })
const cors = require('cors')
const dbConnectExports = require('./database/connect')
const newLetterExports = require('./automation/newsletter')

const userRouterexports = require('./routes/userRoute')
const jobRouterexports = require('./routes/jobRoute')
const applicationRouterexports = require('./routes/applicationRoute')

const server = express()
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')

server.use(cookieParser())
server.use(cors({
  origin: process.env.FRONTEND_URL, // Specify the frontend URL
  methods: 'GET,POST,PUT,DELETE', // Specify allowed methods
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
})) //for connecting backend and frontend calls

server.use(express.json()) //for reading json objects from post requests

server.use(fileUpload({
   useTempFiles:true
}))


dbConnectExports.dbConnection()   //database connection
  .catch((err)=>{
      console.log(err)
  })


newLetterExports.newLetterCron()

server.use('/api/v1/user',userRouterexports.userRouter)
server.use('/api/v1/job',jobRouterexports.jobRouter)
server.use('/api/v1/application',applicationRouterexports.applicationRouter)

server.listen(process.env.PORT,()=>{
    console.log(`Server listening to port ${process.env.PORT}....`)
})