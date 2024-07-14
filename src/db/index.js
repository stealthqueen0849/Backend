import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(connectionInstance)
    } catch (error) {
        console.log("Errorr in db: ",error)
        console.log(process.exit(1))
    }

}

/*


arrow function hai yeee 

 */

export default connectDB;