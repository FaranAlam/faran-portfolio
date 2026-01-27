import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    blogSlug: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        maxlength: 200
    },
    comment: {
        type: String,
        required: true,
        maxlength: 1000
    },
    approved: {
        type: Boolean,
        default: true // Auto-approve for now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Comment", commentSchema);