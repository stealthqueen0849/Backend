import {Playlist} from "../models/playlist.models.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import mongoose, { isValidObjectId } from "mongoose"


// create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name && !description){
        throw new ApiError("Please provide name and description", 400)
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    })
    if(!playlist) throw new ApiError(500, "Playlist not created")

    res
    .status(200)
    .json(
        new ApiResponse(playlist, 200, "Playlist created")
    )
})

// get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    //owner 
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
                                }
                            ]
                        }
                    },
                    //subscribers
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscriberCount: {$size: "$subscribers"},
                            isSubscribed: {$cond: {
                                //dont use userId directly as its just string!!!!
                                if: {$in: [new mongoose.Types.ObjectId(userId), "$subscribers.subscriber"]},
                                then: true,
                                else: false
                            }},
                            owner: {
                                $first: "$owner"
                            },
                        }
                    },
                    {
                        $project:{
                            _id: 1,
                            "video.url":1,
                            "thumbanail.url": 1,
                            owner: 1,
                            title: 1,
                            views:1,
                            duration:1,
                            subscriberCount:1,
                            isSubscribed:1,
                        }
                    }

                ]
            }
        },
        {
            $project: {
                _id: 1,
                video: 1,
                name: 1,
                description:1
            }
        }
    ])
    console.log("Hello ",playlists)

    if(!playlists) throw new ApiError(500, "Could fet your playlist")

    res
    .status(200)
    .json(
        new ApiResponse(playlists, 200, "got you playlistt")
    )
})

// get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    console.log(playlistId)
    console.log("Helloo")

    const playlists = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    //owner 
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
                                }
                            ]
                        }
                    },
                    //subscribers
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscriberCount: {$size: "$subscribers"},
                            isSubscribed: {$cond: {
                                //dont use userId directly as its just string!!!!
                                if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                                then: true,
                                else: false
                            }},
                            owner: {
                                $first: "$owner"
                            },
                        }
                    },
                    {
                        $project:{
                            _id: 1,
                            "video.url":1,
                            "thumbanail.url": 1,
                            owner: 1,
                            title: 1,
                            views:1,
                            duration:1,
                            subscriberCount:1,
                            isSubscribed:1,
                        }
                    }

                ]
            }
        },
        {
            $project: {
                _id: 1,
                video: 1,
                name: 1,
                description:1
            }
        }
    ])


    if(!playlists) throw new ApiError(500, "Couldnt get your playlist")

    res
    .status(200)
    .json(
        new ApiResponse(playlists[0], 200, "got your playlistt")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)) throw new ApiError(400, " invalid id")
        

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(400, "Playlist not found")

    if(playlist.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "user cant add video")
    }
    const  addVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                video: videoId
            }
        },
        {new:true}
    )

    if(!addVideo) throw new ApiError(500, "Couldnt add video to playlist")

    res
    .status(200)
    .json(
        new ApiResponse(addVideo, 200, "Video added")
    )

})

// remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)) throw new ApiError(400, " invalid id")
    
    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(400, "Playlist not found")
    
    if(playlist.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "User is not the owner")
    }

    const deleteVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                video: videoId
            }
        },
        {new:true}
    )
    console.log(deleteVideo)
    if(!deleteVideo) throw new ApiError(500, "Couldnt delete video")

    res
    .status(200)
    .json(
        new ApiResponse(deleteVideo, 200, "video deleted")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)) throw new ApiError(400, " invalid id")

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(400, "Playlist not found")
    
    if(playlist.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "User is not the owner")
    }

    const playlistDelete = await Playlist.findByIdAndDelete(
        playlistId,
        {new:true}
    )
    if(!playlistDelete) throw new ApiError(500, "Couldnt delete video")

    res
    .status(200)
    .json(
        new ApiResponse(playlistDelete, 200, "video deleted")
    )
})

// update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)) throw new ApiError(400, "Playlist id invalid")

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(400, "Playlist not found")
    
    if(playlist.owner?.toString() !== req.user?._id.toString()){
        throw new  ApiError(400, "User is not the owner")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {new:true}
    )
    if(!updatedPlaylist){
        throw new ApiError(500, "Playlist not updated")
    }

    res
    .status(200)
    .json(
        new ApiResponse(updatedPlaylist, 200, "Playlist updated")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}