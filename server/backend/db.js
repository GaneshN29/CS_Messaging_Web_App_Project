const mongoose = require("mongoose");

const ConnectDB = async() =>{
try{
    const conn = await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
      
    });

    console.log(`MongoDB connected: ${conn.connection.host}`)
}catch(error){
console.log(`Error:${error}`);
process.exit();
}
}

module.exports = ConnectDB;