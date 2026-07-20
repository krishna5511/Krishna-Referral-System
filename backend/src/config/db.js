const mongoose = require('mongoose');
async function connectDb() {
   try {
     await mongoose.connect(process.env.MONGODB_URI)
     console.log("databse connected successfully");
    }catch(err){
        console.log("database connection error",err);   
    }
}

module.exports = connectDb;