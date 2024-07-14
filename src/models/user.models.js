import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index:true, //makes data searchable
        trim: true,
        lower: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lower: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type: String, //cloudinary url -> where images/videos are stored in cloud gives url
        required: true
    },
    coverImage:{
        type: String, //cloudinary url -> where images/videos are stored in cloud gives url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'  // this should be same as export wala video
        } 
    ],
    password: {
        type: String,
        required: [true, 'password is required!']
    },
    refreshToken: {
        type:String
    }
}, {timestamps: true})


userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    const accessToken =  jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    // console.log(accessToken)
    return accessToken;
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)