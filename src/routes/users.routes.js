import { Router } from "express";
import { 
        logoutUser,
        loginUser, 
        registerUser, 
        refreshAccessToken, 
        changeCurrentPassword, 
        getCurrentUser, 
        updateAccountDetails, 
        updateAvatar, 
        updateCoverImage, 
        getUserHistory,
        getChannelDetails
    } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/update-user").post(verifyJWT, updateAccountDetails)
router.route("/update-avatar").post(verifyJWT, upload.single('avatar'),updateAvatar)
router.route("/update-coverImage").post(verifyJWT, upload.single("coverImage"),updateCoverImage)
router.route("/watch-history").get(verifyJWT,getUserHistory);
router.route("/channel/:username").get(verifyJWT,getChannelDetails);

    
export default router;