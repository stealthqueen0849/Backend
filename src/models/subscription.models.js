import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // one who is subscribing
        ref:"User",
        required: true,
        lower: true,
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, // one to whom "subscriber" is subscribing
        ref: "User",
        required: true
    }
},{timestamps: true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema)