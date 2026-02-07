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
        required: false,
        default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E'
    },
    imageAlt: {
        type: String,
        maxlength: 200,
        default: 'Blog image'
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