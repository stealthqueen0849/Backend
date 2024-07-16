import {Subscription} from "../models/subscription.models.js"
import ApiResponse from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import mongoose, { isValidObjectId } from "mongoose"

// controller to toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel id")
    const channel = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    if(channel) {
        await Subscription.findByIdAndDelete(channel._id)
        return res
            .status(200)
            .json(
                new ApiResponse(channel, 200, "Channel unsubscribed!!")
            )
    }

    const channelSubscribed = await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id
    })
    if(!channelSubscribed) throw new ApiError(500, "Error while subscribing")

    res
    .status(200)
    .json(
        new ApiResponse(channelSubscribed, 200, "channel subscribed!!!")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) throw new ApiError(400, "Invalid Channel ID")
    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "channelSubscribers",
                pipeline:[
                    {
                        $project:{
                            _id: 1,
                            username: 1,
                            "avatar.url":1,
                            fullName:1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channelSubscribers"
        },
        {
            $project:{
                _id: 1,
                channelSubscribers: 1
            }
        }
        
    ])
    
    if(!channelSubscribers) throw new ApiError(400, "Error while getting subscribers")

    res
    .status(200)
    .json(
        new ApiResponse(channelSubscribers, 200, "Success")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)) throw new ApiError(400, "Subscriber Id invalid")
    const channelList = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 0,
                                        username: 1,
                                        "avatar.url": 1,
                                    }
                                },
                            ]
                        }
                    },
                    
                    {
                        $unwind: "$owner"
                    },
                    {
                        $project: {
                            _id:1,
                            "videoFile.url": 1,
                            "thumbnail.url": 1,
                            title: 1,
                            owner:1,
                            views:1,
                            duration:1,
                            sub:1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                channel:1
            }
        }
    ])



    if(!channelList) throw new ApiError(400, "Error while getting subscribed channels")
    
    res
    .status(200)
    .json(
        new ApiResponse(channelList, 200, "Got the channel list")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}

