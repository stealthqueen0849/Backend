import jwt from "jsonwebtoken";
import asyncHandller from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

const verifyJWT = asyncHandller( async (req, _, next) =>{

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if(!token) throw new ApiError(401, "Unauthorised request")

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // ask to jwt is it correct token?

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    if(!user) throw new ApiError(401, "User not found")
    
    req.user = user
    next()

})


export default verifyJWT ;