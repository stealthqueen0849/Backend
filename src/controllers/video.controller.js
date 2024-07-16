import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadFile} from "../utils/cloudinary.js"
import fs from "fs"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination



})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if([title, description].some((field) => field?.trim() === "")){
        throw new ApiError("All fields are required", 400)
    }
    const videoLocalPath = req.files?.videoFile[0]?.path
    if(!videoLocalPath){
        throw new ApiError(400, "Please provide video")
    }
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Please upload thumbnail")
    }

    const videoUrl = await uploadFile(videoLocalPath)
    const thumbnailUrl = await uploadFile(thumbnailLocalPath)

    const video = await Video.create({
        title,
        description,
        thumbnail: {
            url: thumbnailUrl?.url,
            public_id: thumbnailUrl?.public_id,
        },
        videoFile:{
            public_id: videoUrl?.public_id,
            url: videoUrl?.url,
        },
        duration: videoUrl?.duration,
        owner: req.user?._id
    })

    if(!video){
        throw new ApiError(500, "Video not created")
    }

    // fs.unlinkSync(thumbnailLocalPath, (err)=>{
    //     if(err) throw new ApiError(500, err.messsage)
    //     console.log("File removed from local storage")
    // })
    
    // fs.unlinkSync(videoLocalPath, (err)=>{
    //     if(err) throw new ApiError(500, err.messsage)
    //     console.log("File removed from local storage")
    // })
    res
    .status(200)
    .json(
        new ApiResponse(video, 200, "Video created")
    )

})

const getVideoById = asyncHandler(async (req, res) => {

    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Please send valid video Id")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        //finding the owner
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        //getting the subscribers
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLiked",
            }
        },
        {
            $addFields:{
                likeCount: {$size: "$videoLiked"},
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id || null, "$videoLiked.likedBy"]},
                        then: true,
                        else: false,
                    }
                },
                subscribersCount: {$size: "$subscribers"},
                isSubscribed: {
                    $cond:{
                        if: {$in: [req.user?.id || null, "$subscribers.subscriber"]},
                        then: true,
                        else: false,
                    }
                },
                owner: {
                    $first: "$owner"
                }

            }
        },
        {
            $project:{
                title: 1,
                "videoFile.url": 1,
                description: 1,
                likeCount: 1,
                isLiked: 1,
                owner: 1,
                isSubscribed: 1,
                subscribersCount: 1,
                comments: 1,
                views: 1,
                duration: 1,
            }
        }
    ])

    
    if(!video){
        throw new ApiError(500, "Could not get the video")
    }
    //************************************************************//
    //make viewers set as well in the db to count the user uniquely
    //************************************************************//
    
    res
    .status(200)
    .json(
        new ApiResponse(video[0], 200, "Got the video")
    )
})

//update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id is invalid")
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video does not exist")
    }
    if(video.owner.toString() !== req.user?.id){
        throw new ApiError(400, "user cant update video. Only owner can update it")
    }

    const { title, description } = req.body;
    if(!title && !description){
        throw new ApiError(400, "Please provide atleast one field")
    }

    const thumbnailLocalPath = req.file?.path
    const thumbnailUrl = await uploadFile(thumbnailLocalPath)

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title? title : video.title,
                description: description? description : video.description,
                thumbnail:{
                    url: thumbnailUrl.url,
                    public_id: thumbnailUrl.public_id
                }
            }
        },
        {new: true}
    )

    if(!updatedVideo){
        throw new ApiError(500, "Error while updating the video details")
    }

    fs.unlinkSync(thumbnailLocalPath, (err)=>{
        if(err) throw new ApiError(500, "Error while deleting from localPath")
        console.log("Thumbnaill deleted from local storage")
    })
    res
    .status(200)
    .json(
        new ApiResponse(updatedVideo, 200, "Updated video successfully")
    )
   

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "video id is not valid")
    }
    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(404, "invalid user id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video does not exist")
    }

    if(video.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(409, "User cannnot update the video.(not the owner)")
    }

    const updatedVideo = await Video.findByIdAndDelete(videoId)
    console.log(updateVideo)

    if(!updatedVideo){
        throw new ApiError(500, "Video not deleted")
    }

    res
    .status(200)
    .json(
        new ApiResponse(updatedVideo, 200, "Deleted video")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
}