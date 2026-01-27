import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Blog from "./models/Blog.js";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/newsletter";

const sampleBlogs = [{
        title: "Getting Started with Web Development",
        excerpt: "Learn the fundamentals of web development including HTML, CSS, and JavaScript. A complete guide for beginners.",
        content: `<h2>Introduction to Web Development</h2>
        <p>Web development is an exciting field that combines creativity with technical skills. Whether you're building a personal blog, an e-commerce site, or a complex web application, understanding the fundamentals is crucial.</p>
        
        <h3>The Three Pillars of Web Development</h3>
        <p><strong>HTML (HyperText Markup Language)</strong> is the backbone of any website. It provides the structure and content of web pages. Think of HTML as the skeleton of your website.</p>
        
        <p><strong>CSS (Cascading Style Sheets)</strong> is what makes websites beautiful. It controls the visual presentation, including colors, layouts, fonts, and animations.</p>
        
        <p><strong>JavaScript</strong> brings interactivity to your websites. It allows you to create dynamic content, handle user interactions, and communicate with servers.</p>
        
        <h3>Getting Started</h3>
        <p>To begin your web development journey, you'll need:</p>
        <ul>
            <li>A text editor (VS Code, Sublime Text, or Atom)</li>
            <li>A web browser for testing</li>
            <li>Curiosity and patience</li>
        </ul>
        
        <p>Start with small projects and gradually increase complexity. Build a personal portfolio, a to-do list, or a simple blog. The key is consistent practice and continuous learning.</p>`,
        slug: `getting-started-web-development-${Date.now()}`,
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
        tags: ['web development', 'beginners', 'html', 'css', 'javascript'],
        featured: true,
        published: true,
        author: 'admin@admin.local',
        readTime: 5
    },
    {
        title: "Modern JavaScript ES6+ Features",
        excerpt: "Explore the powerful features introduced in ES6 and beyond that make JavaScript development more efficient and elegant.",
        content: `<h2>Modern JavaScript Features</h2>
        <p>JavaScript has evolved significantly with ES6 (ECMAScript 2015) and subsequent versions. Let's explore some game-changing features.</p>
        
        <h3>Arrow Functions</h3>
        <p>Arrow functions provide a concise syntax for writing function expressions:</p>
        <pre><code>// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;</code></pre>
        
        <h3>Template Literals</h3>
        <p>Template literals make string interpolation easy and readable:</p>
        <pre><code>const name = "World";
const greeting = \`Hello, \${name}!\`;</code></pre>
        
        <h3>Destructuring</h3>
        <p>Extract values from arrays and objects with elegant syntax:</p>
        <pre><code>const user = { name: 'Faran', age: 25 };
const { name, age } = user;</code></pre>
        
        <h3>Async/Await</h3>
        <p>Handle asynchronous operations with cleaner, more readable code:</p>
        <pre><code>async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
}</code></pre>`,
        slug: `modern-javascript-es6-features-${Date.now() + 1}`,
        image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=400&fit=crop',
        tags: ['javascript', 'es6', 'programming', 'tutorial'],
        featured: true,
        published: true,
        author: 'admin@admin.local',
        readTime: 7
    },
    {
        title: "Building RESTful APIs with Node.js and Express",
        excerpt: "Learn how to create robust and scalable RESTful APIs using Node.js and Express framework.",
        content: `<h2>Building RESTful APIs</h2>
        <p>RESTful APIs are the backbone of modern web applications. Let's learn how to build them with Node.js and Express.</p>
        
        <h3>What is REST?</h3>
        <p>REST (Representational State Transfer) is an architectural style for designing networked applications. It uses HTTP methods to perform CRUD operations:</p>
        <ul>
            <li>GET - Retrieve data</li>
            <li>POST - Create new data</li>
            <li>PUT/PATCH - Update existing data</li>
            <li>DELETE - Remove data</li>
        </ul>
        
        <h3>Setting Up Express</h3>
        <pre><code>const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
    res.json({ users: [] });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});</code></pre>
        
        <h3>Best Practices</h3>
        <p>Follow these principles for better APIs:</p>
        <ul>
            <li>Use proper HTTP status codes</li>
            <li>Version your API (/api/v1/)</li>
            <li>Implement authentication and authorization</li>
            <li>Handle errors gracefully</li>
            <li>Document your endpoints</li>
        </ul>`,
        slug: `building-restful-apis-nodejs-express-${Date.now() + 2}`,
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
        tags: ['nodejs', 'express', 'api', 'backend'],
        featured: false,
        published: true,
        author: 'admin@admin.local',
        readTime: 10
    },
    {
        title: "CSS Grid vs Flexbox: When to Use Each",
        excerpt: "Understanding the differences between CSS Grid and Flexbox, and knowing when to use each layout system.",
        content: `<h2>CSS Grid vs Flexbox</h2>
        <p>Both CSS Grid and Flexbox are powerful layout systems, but they serve different purposes. Let's understand when to use each.</p>
        
        <h3>Flexbox: One-Dimensional Layouts</h3>
        <p>Flexbox is designed for laying out items in a single direction - either horizontally or vertically. It's perfect for:</p>
        <ul>
            <li>Navigation bars</li>
            <li>Card layouts</li>
            <li>Centering elements</li>
            <li>Distribution of space between items</li>
        </ul>
        
        <pre><code>.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}</code></pre>
        
        <h3>CSS Grid: Two-Dimensional Layouts</h3>
        <p>CSS Grid excels at creating complex, two-dimensional layouts with rows and columns. Use it for:</p>
        <ul>
            <li>Page layouts</li>
            <li>Gallery grids</li>
            <li>Dashboard layouts</li>
            <li>Magazine-style layouts</li>
        </ul>
        
        <pre><code>.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}</code></pre>
        
        <h3>The Bottom Line</h3>
        <p>Use Flexbox for components and small-scale layouts. Use Grid for page-level layouts and complex structures. Often, you'll use both together!</p>`,
        slug: `css-grid-vs-flexbox-${Date.now() + 3}`,
        image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop',
        tags: ['css', 'flexbox', 'grid', 'layout', 'design'],
        featured: false,
        published: true,
        author: 'admin@admin.local',
        readTime: 6
    },
    {
        title: "MongoDB Basics: NoSQL Database for Modern Apps",
        excerpt: "Get started with MongoDB, a popular NoSQL database that stores data in flexible, JSON-like documents.",
        content: `<h2>Introduction to MongoDB</h2>
        <p>MongoDB is a document-oriented NoSQL database that provides high performance, high availability, and easy scalability.</p>
        
        <h3>Why MongoDB?</h3>
        <p>Unlike traditional SQL databases, MongoDB stores data in flexible documents similar to JSON. This makes it perfect for modern applications where data structures can evolve.</p>
        
        <h3>Key Concepts</h3>
        <p><strong>Collections</strong> are like tables in SQL databases, but without a fixed schema.</p>
        <p><strong>Documents</strong> are individual records stored in BSON format (Binary JSON).</p>
        
        <h3>Basic Operations</h3>
        <pre><code>// Insert a document
db.users.insertOne({
    name: "Faran Alam",
    email: "faran@example.com",
    age: 25
});

// Find documents
db.users.find({ age: { $gte: 18 } });

// Update a document
db.users.updateOne(
    { name: "Faran Alam" },
    { $set: { age: 26 } }
);

// Delete a document
db.users.deleteOne({ name: "Faran Alam" });</code></pre>
        
        <h3>When to Use MongoDB</h3>
        <ul>
            <li>Rapid application development</li>
            <li>Flexible data models</li>
            <li>Horizontal scaling requirements</li>
            <li>Real-time analytics</li>
        </ul>`,
        slug: `mongodb-basics-nosql-database-${Date.now() + 4}`,
        image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop',
        tags: ['mongodb', 'database', 'nosql', 'backend'],
        featured: false,
        published: true,
        author: 'admin@admin.local',
        readTime: 8
    },
    {
        title: "Responsive Web Design: Mobile-First Approach",
        excerpt: "Master the art of creating websites that look great on all devices using a mobile-first design strategy.",
        content: `<h2>Responsive Web Design</h2>
        <p>With mobile devices accounting for over 50% of web traffic, responsive design is no longer optional - it's essential.</p>
        
        <h3>Mobile-First Philosophy</h3>
        <p>Start designing for the smallest screen and progressively enhance for larger screens. This ensures better performance and user experience on mobile devices.</p>
        
        <h3>Key Techniques</h3>
        
        <h4>1. Fluid Grids</h4>
        <pre><code>.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}</code></pre>
        
        <h4>2. Flexible Images</h4>
        <pre><code>img {
    max-width: 100%;
    height: auto;
}</code></pre>
        
        <h4>3. Media Queries</h4>
        <pre><code>/* Mobile styles first */
.box {
    width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
    .box {
        width: 50%;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .box {
        width: 33.33%;
    }
}</code></pre>
        
        <h3>Testing</h3>
        <p>Always test on real devices and use browser DevTools to simulate different screen sizes.</p>`,
        slug: `responsive-web-design-mobile-first-${Date.now() + 5}`,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop',
        tags: ['responsive design', 'css', 'mobile', 'web design'],
        featured: false,
        published: true,
        author: 'admin@admin.local',
        readTime: 7
    }
];

async function seedBlogs() {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("MongoDB connected");

        // Clear existing blogs (optional - comment out if you want to keep existing)
        // await Blog.deleteMany({});
        // console.log("Cleared existing blogs");

        // Insert sample blogs
        const result = await Blog.insertMany(sampleBlogs);
        console.log(`✅ Successfully created ${result.length} sample blogs!`);

        console.log("\nCreated blogs:");
        result.forEach((blog, index) => {
            console.log(`${index + 1}. ${blog.title}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error seeding blogs:", error);
        process.exit(1);
    }
}

seedBlogs();