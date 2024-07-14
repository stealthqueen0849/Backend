import { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Comment } from "../models/comment.models.js"


//get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

// add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video id")
    }

    const {content} = req.body
    if(!content) throw new ApiError(400, "Please provide content for comment")
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    })

    if(!comment) throw new ApiError(500, "Comment not added")

    res
    .status(200)
    .json(
        new ApiResponse(comment, 200, "Comment added")
    )

})

// update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if(!isValidObjectId(commentId)) throw new ApiError(400, "invalid comment id")

    const {content} = req.body
    if(!content) throw new ApiError(400, "Please provide content for comment")
    const comment = await Comment.findById(commentId)
    if(!comment) throw new ApiError(404, "Comment not found")
    if(comment.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "User is not the owner so cant update the comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    if(!updatedComment) throw new ApiError(500, "Comment not updated")
    
    res
    .status(200)
    .json(
        new ApiResponse(updatedComment, 200, "Comment updated")
    )
})

//delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)) throw new ApiError(400, "invalid comment id")

    const comment = await Comment.findById(commentId)
    if(!comment) throw new ApiError(400, "Comment not found")

    if(comment.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "User is not the owner")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if(!deletedComment) throw new ApiError(500, "Comment not deleted")

    res
    .status(200)
    .json(
        new ApiError(deletedComment, 200, "comment deleted")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }