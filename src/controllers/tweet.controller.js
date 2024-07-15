import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// create tweet
const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content) throw new ApiError(400, "Content is necessary")

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet) throw new ApiError(500, "Tweet not created")

    res
    .status(200)
    .json(
        new ApiResponse(tweet, 200, "Tweeet created")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

// update tweet
const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId))  throw new ApiError(400, "Invalid tweet ID")
    
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(400, "Tweet not found")

    if(tweet.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "User is not the owner")
    }
    const {content} = req.body
    if(!content) throw new ApiError(400, "Please provide tweet content")
        
    const udpatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            }
        },
        {
            new: true,
        }
    )
    if(!updateTweet){
        throw new ApiError(500, "tweet not updated")
    }

    res
    .status(200)
    .json(
        new ApiResponse(updateTweet, 200, "Tweet updated")
    )
    
})

// delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id")

    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(400, "Tweet id not found")
    
    if(tweet.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "User is not the owner")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deleteTweet) throw new ApiError(500, "Tweet not deleted")

    res
    .status(200)
    .json(
        new ApiResponse(deleteTweet, 200, "Tweet deleted")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}