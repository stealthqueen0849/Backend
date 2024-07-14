// import mongoose, { mongo } from "mongoose"
// import { DB_NAME } from "./constants.js";
// import express from "express";
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from "./app.js"

dotenv.config({
    path: '../.env'
})
const PORT =process.env.PORT || 8000;
connectDB()
.then(()=>{
    console.log("Connected to MongoDB")

    app.on("error",(err)=>{
        console.log("Error in staring express: ", err)
    })
    app.listen(PORT, ()=>{
        console.log("Server is running on port", PORT)
    })
    app.get('/radhika', (req,res)=>{
        console.log(req.params)
        res.json({
            message: "Message from /radhika"
        })
    })
    
})
.catch((err)=>{
    console.log("MongoDB connection failed ", err)
})

