import asyncHandller from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadFile, deleteFile} from  "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from 'fs'
import { subscribe } from "diagnostics_channel";

const generateAccessTokenAndRefreshToken = async (userId)=>{

    try {
        
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken // basically we save refresh token in db
        await user.save({ validateBeforeSave : false }) // without calling pre func
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Cannot generate access and refresh token, ", error.message)

    }
}

const registerUser =  asyncHandller(async (req, res)=>{

    // get user details from frontend
    // validations - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload to cloudinary
    // create user object - create entry in db
    // remove password and refresh tokenn
    // return res

    const { fullname, username, email, password } = req.body;
    
    if (
        [email, password, fullname, username].some((fields)=> fields?.trim() === "")
    ) throw new ApiError(400, "All fields are required")

    const existingUser = await User.findOne({ // use awaitttt
        $or: [{ email }, { username }] 
    })

    if(existingUser) throw new ApiError(409, "Already existing user")

    const avatarPath = req.files?.avatar[0]?.path;
    let coverImagePath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImagePath = req.files?.coverImage[0]?.path;
    }

    if(!avatarPath) throw new ApiError(400 , "avatar file is required")
    
    const avatar = await uploadFile(avatarPath) // this will give cloudinary object+url
    const coverImage = await uploadFile(coverImagePath)

    if(!avatar)  throw new ApiError(400 , "avatar file is required")

    const user = await User.create({
        fullname,
        avatar:{
            public_id: avatar.public_id || "",
            url: avatar.url || ""
        },
        coverImage:{
            public_id: coverImage.public_id || "",
            url: coverImage.url || ""
        },
        email,
        password,
        username : username.toLowerCase()
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser)  throw new ApiError(500 , "Something went wrong while registering")
    
    fs.unlink(avatarPath , (err)=>{
        if(err) throw new ApiError(500, "Unable to deleted file form loca storage")
        console.log(`${avatarPath} deleted`)
    })
    if(coverImage){
        fs.unlink(coverImagePath , (err)=>{
            if(err) throw new ApiError(500, "Unable to deleted file form loca storage")
            console.log(`${coverImagePath} deleted`)
        })
    } 

    return res.status(201).json(
        new ApiResponse(createdUser, 201, "User registered successfully")
    )

});

const loginUser = asyncHandller(async (req, res)=>{
    // req.body
    // username/email
    // find the user 
    // not there
    // password check
    // access + refresh 
    // send cookie
    // res  
    const {username, email, password} = req.body
    if(!(username || email )) throw new ApiError(400, "username or email is required") //or (!username && !email)

    
    const user = await User.findOne({
        $or:[{ username }, { email }]
    })
    if(!user) throw new ApiError(404, "User doesnt exist")
    
    const isPasswordValid =  await user.isPasswordCorrect(password, user.password) 

    if(!isPasswordValid) throw new ApiError(401, "Invalid user credentials")
    
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    const options ={
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse({
                user: loggedInUser,accessToken, refreshToken // mobile applications
            }, 
            200,
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandller(async (req, res) => {
    // clear cookies first and set refreshToken = undefined in db
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            //here we are just removing refreshToken from doc
            $unset: {  
                refreshToken: ""
            }
        },
        {
            new: true
        }

    )

    const options ={
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse({}, 200, "Logged out!"))

})

const refreshAccessToken = asyncHandller(async (req, res) =>{

    //this is what we have in cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken) throw new ApiError(401, "Unauthorised request") // coz token is invalid

    try {
  
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET) //here the incoming token is converted to decoded token so that we get the payload which has the user id. basically it is decrypted to get the payload.
        if(!decodedToken) throw new ApiError(401, "Invalid token")
    
        //now we want to find out the refresh token stored in our db is same as the token we have in cookies.
        const user = await User.findById(decodedToken?._id)
        if(!user) throw new ApiError(401, "Invalid refresh token")
        if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(400, "Refresh token expired")

        //if both are same then generate new refresh+access tokens
        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

        const options ={
            httpOnly : true,
            secure: true,
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(
                {accessToken, refreshToken},
                200, 
                "Access token refreshed"
            ))

    } catch (error) {
         throw new ApiError(400, "Error!!!!! ", error.message)
    }
    
    
})

const changeCurrentPassword = asyncHandller(async (req, res) =>{

    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    console.log(user.password)
    
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid) throw new ApiError(400, "Invalid credentials")
        
        
    user.password = newPassword
    await user.save({validateBeforeSave: false});

    console.log(user.password)

    return res
    .status(200)
    .json(
        new ApiResponse({}, 200, "password changed successfully")
    )


    //no need to writeall this coz we can call verify jwt for authentication
    // if(!(username || email)) throw new ApiError(400, "Username or email is required")
    // if(!password) throw new ApiError(400, "Password is required")
    // const user = await User.findOne({
    //     $or: [{ username }, { email }]
    // })
    // if(!user) throw new ApiError(401, "User not found")

})

const getCurrentUser = asyncHandller(async (req, res) =>{

    const user = req.user;

    return res
    .status(200)
    .json(
        new ApiResponse({user}, 200, "Successfully delivered current user")
    )
})

const updateAccountDetails = asyncHandller(async (req, res) => {
    const {fullname, email} = req.body // to update filee keep separate controller

    if(!(fullname || email)) throw new ApiError(400, "All fields are required")
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                fullname,
                email
            }
        },
        {new : true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse( {user}, 200, "Account details updated successfully")
    )

})

const updateAvatar = asyncHandller(async (req, res)=>{

    //updating the new avatar
    const avatarPath = req.file?.path
    if(!avatarPath){
        throw new ApiError(400, "Avatar file is required")
    }
    const cloudinaryUrl = await uploadFile(avatarPath)
    
    const user = await User.findById(req.user?.id)
    console.log(user)
    const avatarToDelete = user.avatar.public_id
    await deleteFile(avatarToDelete)

    const updateUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: {
                    public_id: cloudinaryUrl.public_id,
                    url: cloudinaryUrl.url || "",
                }
            }
        } )
    fs.unlink(avatarPath, (err)=>{
        if(err) throw new ApiError(500, "Could not remove fiel form local storage")
        console.log(`${avatarPath} deleted`)
    })
    res
    .status(200)
    .json(
        new ApiResponse({updateUser}, 200, "User created successfully")
    )

})

const updateCoverImage = asyncHandller(async (req, res)=>{
    const userForCoverimage = await User.findById(req.user?._id)
    if(!userForCoverimage){
        throw new ApiError("User not found", 404)
    }
    const coverImage = userForCoverimage.coverImage
    const publicId = coverImage.split("/").pop().split(".")[0]
    await deleteFile(publicId, "image")

    const coverImagePath = req.file?.path
    if(!coverImagePath) {
        throw new ApiError("Cover Image required", 400)
    }
    const cloudinaryUrl = await uploadFile(coverImagePath)

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: cloudinaryUrl?.url 
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    fs.unlink(coverImagePath, (err) => {
        if(err) throw new ApiError(500, "Could not remove file from local storage")
        console.log(`${coverImagePath} deleted`)
    })

    res
    .status(200)
    .json(
        new ApiResponse({user}, 200, "Cover Image updated succefully")
    )
})

const getChannelDetails = asyncHandller(async (req, res)=>{
    const username = req.params.username
    console.log(username)
    if(!username?.trim()){
        throw new ApiError(400, "Channel not found",)
    }

    const channelDetails = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            //basically here we are counting the subscribers
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers" // we have created a doc where everyone has subscribed to same channel acc
            }
        },
        {
            // here we are counting the subscribers the channel has subscribed to
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo" // here we have a doc where user is the subscriber. which gives us all the doc where user has subscribed to diff doc
            }
        },
        {
            $addFields:{
                subscriberCount: {$size: "$subscribers"},
                subscribedToCount: {$size: "$subscribedTo"},
                isSubscribed:{
                    $cond: {
                        if : {
                            $in:[req.user?._id, "$subscribers.subscriber"] // is our name there as a subscriber in the subscribers doc
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username: 1,
                email: 1,
                coverImage: 1,
                avatar: 1,
                subscriberCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
            }
        }
    ])

    if(!channelDetails?.length){
        throw new ApiError(404, "Channel not found")
    }

    res
    .status(200)
    .json(
        new ApiResponse(channelDetails[0], 200, "User channel fetched!!!")
    )
}) 

const getUserHistory = asyncHandller(async (req, res)=>{

    const user = await User.aggregate([
        {
            $match: {
                username: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from:"users",
                            localField: "owner",
                            foreignField: "_id",
                            as:"owner",
                            pipeline: [
                                {
                                    $project : {
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        //just doing for frontend simplicity
                        $addFields:{
                            owner:{$arrayElemAt:["$owner",0]}
                        }
                    }
                ]
            },
            
        }
    ])

    return res
            .status(200)
            .json(
                new ApiResponse(user[0].watchHistory, 200, "got watch history")
            )
})

export {
    registerUser,
    loginUser,    
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getChannelDetails,
    getUserHistory
};

