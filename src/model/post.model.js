import {Schema, model, Types} from 'mongoose';
import Comment from "./comment.model.js";

const postSchema = new Schema({
    _id: {
        type: Types.ObjectId,
        default: () => new Types.ObjectId(),
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    tags: {
        type: [String],
        default: [],
    },
    likes: {
        type: Number,
        default: 0,
    },
    comments: {
        type: [Comment],
        default: [],
    }
}, {
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = doc._id;
            delete ret._id;
            // delete ret.__v;
            ret.dateCreated = doc.dateCreated.toISOString().slice(0, 19);
        }
    }
})

// create collection posts
export default model('Post', postSchema, 'posts');