const cron = require('node-cron')
const jobModel = require('../models/jobSchema')
const userModel = require('../models/userSchema')
const { sendMail } = require('../utils/sendMail')


const Job = jobModel.Job
const User = userModel.User

exports.newLetterCron = ()=>{
    cron.schedule("*/1 * * * *",async()=>{
        console.log("newletter is sending...........")
        try{
            const jobsToBeSent = await Job.find({newsLetterSent:false})
            for(const job of jobsToBeSent)
            {
                const users = await User.find({$or:[
                    {"domain.firstDomain":job.jobDomain},
                    {"domain.secondDomain":job.jobDomain},
                    {"domain.thirdDomain":job.jobDomain}
                ]})

                for(const user of users)
                {
                    const subject=`Exciting Job Opportunities Await You on CareerHub!`;
                    const message=`Hi ${user.name}\n\n Great news! We've found new job opportunities that match your skills and expertise in ${job.jobDomain}.\n\n  
                                   Explore these openings and apply directly through CareerHub:\n\n\n
                                   
                                   -Job Title: ${job.title}\n
                                   -Company:${job.companyName}\n
                                   -Location:${job.location}\n
                                   -Apply By:${job.expiresIn}\n\n\n
                                   
                                   Don't miss out on these opportunities tailored for you!\n\n
                                   
                                   Click here to apply:${job.personalWebsite.url}\n\n
                                   
                                   Best regards,\n
                                   The CareerHub Team`;
                    sendMail({
                        email:user.email,
                        subject,
                        message
                    })
                }

                job.newsLetterSent=true;
                await job.save()
            }
        }
        catch(err)
        {
            console.log(err.message)
            return res.status(400).json({
                success:false,
                message:"Error in newsletter sending............."
            })
        }
    })
}

