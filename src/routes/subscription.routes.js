import { Router } from "express";
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/toggle/:channelId").get(verifyJWT, toggleSubscription)
router.route("/:channelId").get(getUserChannelSubscribers)
router.route("/:subscriberId").post( getSubscribedChannels)

export default router;