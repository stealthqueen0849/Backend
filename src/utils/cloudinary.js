import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDNAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
});

const uploadFile = async (pathFile) => {
    try{
        if(!pathFile) return null
        const result = await cloudinary.uploader.upload(pathFile,{
            resource_type: "auto"
        })
        console.log(`File uploaded on cloudinary`)
        return result;
    }
    catch (error){
        fs.unlinkSync(pathFile) // remove the locally saved temp file. we do this coz the file is saved on our local storage but not uploaded on cloud so to clear the shit we created we are removing it
        console.log(error)
        return null;
    }
}
const deleteFile = async (publicId, resource_type)=>{

    if(!(["image", "javascript", "css", "video", "raw"].some((elem) => elem === resource_type.toLowerCase()))){
        throw new Error("Invalid resource type")
    }  

    try{
        if(!publicId) return null
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resource_type
        })
        console.log(result)
    }catch(err){
        console.log("Error while deleting file from cloudinary",err)
    }
}

export {uploadFile, deleteFile};