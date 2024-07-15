import { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos } from "../controllers/like.controller.js";
import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/videolike/:videoId").get(verifyJWT, toggleVideoLike)
router.route("/commentlike/:commentId").get(verifyJWT, toggleCommentLike)
router.route("/tweetlike/:tweetId").get(verifyJWT, toggleTweetLike)
router.route("/getlikedvideos").get(verifyJWT, getLikedVideos)

export default router;