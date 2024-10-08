import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin: process.env.CORS_NAME, // data coming from anywhere
    credentials:true
}))

//what all kind of data we are taking

app.use(express.json({       //(data -> json)
    limit: "16kb"
}))
app.use(express.urlencoded({         // url %20 -> spacebar
    limit: "16kb",
    extended: true,
}))
app.use(express.static("public")) // folder
app.use(cookieParser())

//routes

import userRouter from "./routes/users.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import playlistRouter from "./routes/playlist.routes.js"

//routes declaratiom
app.use(`/api/v1/users`, userRouter) // => https://localhost:8000/api/v1/users
app.use(`/api/v1/video`, videoRouter) // => https://localhost:8000/api/v1/video/
app.use(`/api/v1/comment`, commentRouter)
app.use(`/api/v1/like`, likeRouter)
app.use(`/api/v1/subscription`, subscriptionRouter)
app.use(`/api/v1/tweet`, tweetRouter)
app.use(`/api/v1/playlist`, playlistRouter)


export default app; //OR export { app }