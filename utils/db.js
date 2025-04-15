import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


//export function which will help me to connect my db

const db = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("congratulation your DB connection succesfull");
    })



    .catch((error)=>{
        console.log('Error connecting DB:', error);
    })
}

export default db;
