const express = require('express')
const jobControllerExports = require('../controller/jobController')
const middlewaresExports = require('../middlewares/auth')

const jobRouter = express.Router();

jobRouter.post('/create',middlewaresExports.auth,middlewaresExports.eligible('Employer'),jobControllerExports.createJob)

jobRouter.get('/getall',jobControllerExports.getAllJobs)
jobRouter.get('/getone/:id',jobControllerExports.getSingleJob)
jobRouter.get('/getmy',middlewaresExports.auth,middlewaresExports.eligible('Employer'),jobControllerExports.getMyJobs)

jobRouter.delete('/delete/:id',middlewaresExports.auth,middlewaresExports.eligible('Employer'),jobControllerExports.deleteJob)

exports.jobRouter = jobRouter;