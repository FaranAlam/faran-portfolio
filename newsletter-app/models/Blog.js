import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        maxlength: 500
    },
    author: {
        type: String,
        default: "Faran Alam"
    },
    image: {
        type: String,
        required: true
    },
    imageAlt: {
        type: String,
        maxlength: 200
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        default: "Technology"
    },
    featured: {
        type: Boolean,
        default: false
    },
    published: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    readTime: {
        type: Number,
        default: 5 // minutes
    },
    seoTitle: {
        type: String,
        maxlength: 60
    },
    seoDescription: {
        type: String,
        maxlength: 160
    }
}, {
    timestamps: true
});

// Index for faster queries
blogSchema.index({ slug: 1 });
blogSchema.index({ featured: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

// Auto-generate slug from title
blogSchema.pre("save", function(next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    // Calculate read time (average 200 words per minute)
    if (this.content) {
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;