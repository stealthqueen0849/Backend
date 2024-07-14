import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema({
    name: {
        type: String,
        requried: true,

    },
    description:{
        type: String,
        required: true,
    },
    video:[{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},{ timestamps: true })

mongoose.plugin(mongooseAggregatePaginate)

export const Playlist = mongoose.model('Playlist', playlistSchema)