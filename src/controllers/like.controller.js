import { Like } from "../models/like.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";


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

//get all alreadyLiked videos
const getLikedVideos = asyncHandler(async (req, res) => {

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}