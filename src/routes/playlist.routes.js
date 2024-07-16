import { 
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
     } from "../controllers/playlist.controller.js"
import { Router } from "express"
import verifyJWT from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/create").post(verifyJWT, createPlaylist)
router.route("/user/:userId").get(verifyJWT, getUserPlaylists)

router.route("/id/:playlistId")
    .get(verifyJWT, getPlaylistById)
    
router.route("/:playlistId")
    .delete(verifyJWT, deletePlaylist)
    .patch(verifyJWT, updatePlaylist)


router.route("/:playlistId/:videoId")
    .post(verifyJWT, addVideoToPlaylist)
    .delete(verifyJWT, removeVideoFromPlaylist)

export default router;