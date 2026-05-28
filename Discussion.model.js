import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [
        {
            type: String,
            trim: true
        }
    ],
    createdBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [
        {
            text: {
                type: String,
                required: true
            },
            createdBy: {
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'user',
                    required: true
                },
                username: {
                    type: String,
                    required: true
                }
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    views: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: [
            "competitive-programming",
            "interview-experience",
            "placement-prep",
            "tech-discussion",
            "career-advice",
            "general"
        ],
        default: "general",
        required: true
    },
    embedding: {
        type: [Number],
        select: false
    }
}, { timestamps: true });

export const discussion = mongoose.model('Discussion', discussionSchema);