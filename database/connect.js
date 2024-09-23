const mongoose = require('mongoose')

async function dbConnection()
{
    await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.hyvvbac.mongodb.net/${process.env.DB_NAME}`)
    console.log('mongodb connected....')
}

exports.dbConnection = dbConnection