import { Like } from "../models/like.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, { isValidObjectId } from "mongoose";


//toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res
        .status(200)
        .json(
            new ApiResponse(alreadyLiked, 200, "Like removed")
        )
    }

    const likeCreated = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })
    if(!likeCreated) throw new ApiError(500, "Like not added")

    return res
    .status(200)
    .json(
        new ApiResponse(likeCreated, 200, "Like added")
    )

})

//toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id")
    
    const alreadyLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res
            .status(200)
            .json(
                new ApiResponse(alreadyLiked, 200, "Like removed")
            )
    }
    const likeAdded = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })
    if(!likeAdded) throw new ApiError(500, "Like not added")
    return res
        .status(200)
        .json(
            new ApiResponse(likeAdded, 200, "Like added")
        )
})

//toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id")
    
    const alreadyLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res
            .status(200)
            .json(
                new ApiResponse(alreadyLiked, 200, "Like removed")
            )
    }
    const likeAdded = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if(!likeAdded) throw new ApiError(500, "Like not added")

    res
    .status(200)
    .json(
        new ApiResponse(likeAdded, 200, "Like added")
    )
})

//get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            //this gives us all the like docs containing likedby==user
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            //in the above docs find the doc which has video 
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        // we get the whole video model data heree!!!
                        // so we are immediately extracting the owner data
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        _id: 0,
                                        username: 1,
                                        "avatar.url":1,
                                    }
                                }
                            ]
                        }
                    },
                    //finding the subscribers
                    {
                        $lookup:{
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        }
                    },
                    {
                        $addFields:{
                            subscribersCount: {$size: "$subscribers"},
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [req.user?._id, "$subscribers.subscriber"]
                                    },
                                    then: true,
                                    else: false,
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            owner: 1,
                            title: 1,
                            "videoFile.url": 1,
                            views: 1,
                            duration: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    },
                ]
            }
        },
        //solely for frontend purpose
        {
            $addFields: {
                likedVideo:{
                    $first: "$likedVideo",
                }
            }
        },
        {
            $project:{
                _id:0,
                likedBy: 1,
                likedVideo: 1,
            }
        }
    ])
    if(!likedVideos) throw new ApiError(500, "Error while getting the liked videos")

    res
    .status(200)
    .json(
        new ApiResponse(likedVideos, 200, "Got all the liked videos ")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}