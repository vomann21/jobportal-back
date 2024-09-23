const express = require('express')
const middleware = require('../middlewares/auth')
const applicationControllerExports = require('../controller/applicationController')
const applicationRouter = express.Router()

applicationRouter.post('/post/:id',middleware.auth,middleware.eligible('Job Seeker'),applicationControllerExports.postApplication)
applicationRouter.get('/employer/getall',middleware.auth,middleware.eligible('Employer'),applicationControllerExports.employerGetAll)
applicationRouter.get('/jobseeker/getall',middleware.auth,middleware.eligible('Job Seeker'),applicationControllerExports.jobSeekerGetAll)
applicationRouter.delete('/delete/:id',middleware.auth,applicationControllerExports.deleteApplication)

exports.applicationRouter = applicationRouter;