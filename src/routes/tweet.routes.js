import { Router } from "express";
import { getUserTweets, createTweet, updateTweet, deleteTweet } from "../controllers/tweet.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/")
    .get(verifyJWT, getUserTweets)
    .post(verifyJWT, createTweet)
    
router.route("/:tweetId")
    .patch(verifyJWT, updateTweet)
    .delete(verifyJWT, deleteTweet)


export default router;