const API_BASE = 'https://faranalam-backend-portfolio.onrender.com';
const JWT_TOKEN = localStorage.getItem('adminToken');

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (JWT_TOKEN) {
        showDashboard();
        loadDashboardData();
    } else {
        showLogin();
    }

    setupEventListeners();
});

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
    });
}

// LOGIN FUNCTIONALITY
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    // Convert username to email format if it doesn't have @
    const email = username.includes('@') ? username : username + '@admin.local';

    try {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.message || 'Login failed';
            errorMsg.style.display = 'block';
            return;
        }

        localStorage.setItem('adminToken', data.token);
        showDashboard();
        loadDashboardData();
        loginForm.reset();
        errorMsg.style.display = 'none';

    } catch (err) {
        errorMsg.textContent = 'Connection error. Check if backend is running.';
        errorMsg.style.display = 'block';
        console.error('Login error:', err);
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    showLogin();
    loginForm.reset();
}

function showLogin() {
    loginContainer.style.display = 'flex';
    adminContainer.classList.remove('active');
}

function showDashboard() {
    loginContainer.style.display = 'none';
    adminContainer.classList.add('active');
}

// TAB SWITCHING
function switchTab(tabName) {
    tabContents.forEach(content => content.classList.remove('active'));
    tabBtns.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'blog') {
        loadBlogs();
    } else if (tabName === 'subscribers') {
        loadSubscribers();
    } else if (tabName === 'messages') {
        loadMessages();
    }
}

// DASHBOARD
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('adminToken');

        // Load counts
        const blogsRes = await fetch(`${API_BASE}/blogs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const blogsData = await blogsRes.json();
        document.getElementById('blogCount').textContent = Array.isArray(blogsData) ? blogsData.length : 0;

        const subRes = await fetch(`${API_BASE}/subscribers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const subData = await subRes.json();
        document.getElementById('subscriberCount').textContent = Array.isArray(subData) ? subData.length : 0;

        const msgRes = await fetch(`${API_BASE}/contact`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const msgData = await msgRes.json();
        document.getElementById('messageCount').textContent = Array.isArray(msgData) ? msgData.length : 0;

    } catch (err) {
        console.error('Error loading dashboard data:', err);
    }
}

// BLOG MANAGEMENT
const addBlogBtn = document.getElementById('addBlogBtn');
const blogModal = document.getElementById('blogModal');
const closeBlogModal = document.getElementById('closeBlogModal');
const blogForm = document.getElementById('blogForm');

addBlogBtn.addEventListener('click', () => {
    document.getElementById('blogModalTitle').textContent = 'Add New Post';
    blogForm.reset();
    blogModal.classList.add('active');
});

closeBlogModal.addEventListener('click', () => {
    blogModal.classList.remove('active');
});

blogForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');
    const title = document.getElementById('blogTitle').value;
    const excerpt = document.getElementById('blogExcerpt').value;
    const content = document.getElementById('blogContent').value;
    const tags = document.getElementById('blogTags').value.split(',').map(t => t.trim());

    try {
        const res = await fetch(`${API_BASE}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, excerpt, content, tags })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Blog post created successfully!');
            blogModal.classList.remove('active');
            loadBlogs();
        } else {
            alert('Error: ' + (data.message || 'Failed to create blog'));
        }
    } catch (err) {
        alert('Error creating blog: ' + err.message);
        console.error('Error:', err);
    }
});

async function loadBlogs() {
    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`${API_BASE}/blogs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const blogs = await res.json();
        const tbody = document.getElementById('blogTableBody');
        const noBlogsMsg = document.getElementById('noBlogsMessage');

        if (!Array.isArray(blogs) || blogs.length === 0) {
            tbody.innerHTML = '';
            noBlogsMsg.style.display = 'block';
            return;
        }

        noBlogsMsg.style.display = 'none';
        tbody.innerHTML = blogs.map(blog => `
            <tr>
                <td>${blog.title}</td>
                <td>${new Date(blog.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editBlog('${blog._id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteBlog('${blog._id}')">Delete</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Error loading blogs:', err);
    }
}

async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`${API_BASE}/blogs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert('Blog deleted successfully!');
            loadBlogs();
        } else {
            alert('Error deleting blog');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function editBlog(id) {
    alert('Edit feature coming soon!');
}

// SUBSCRIBERS
async function loadSubscribers() {
    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`${API_BASE}/subscribers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const subscribers = await res.json();
        const tbody = document.getElementById('subscribersTableBody');
        const noSubMsg = document.getElementById('noSubscribersMessage');

        if (!Array.isArray(subscribers) || subscribers.length === 0) {
            tbody.innerHTML = '';
            noSubMsg.style.display = 'block';
            return;
        }

        noSubMsg.style.display = 'none';
        tbody.innerHTML = subscribers.map(sub => `
            <tr>
                <td>${sub.email}</td>
                <td>${new Date(sub.subscribedAt).toLocaleDateString()}</td>
                <td><span style="color: #27ae60;">✓ Active</span></td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Error loading subscribers:', err);
    }
}

// MESSAGES
async function loadMessages() {
    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`${API_BASE}/contact`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const messages = await res.json();
        const container = document.getElementById('messagesContainer');
        const noMsgMsg = document.getElementById('noMessagesMessage');

        if (!Array.isArray(messages) || messages.length === 0) {
            container.innerHTML = '';
            noMsgMsg.style.display = 'block';
            return;
        }

        noMsgMsg.style.display = 'none';
        container.innerHTML = messages.map(msg => `
            <div class="message-card">
                <h4>${msg.name}</h4>
                <p><strong>Subject:</strong> ${msg.subject}</p>
                <p>${msg.message}</p>
                <div class="message-meta">
                    <span><strong>Email:</strong> ${msg.email}</span>
                    <span>${new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error loading messages:', err);
    }
}

console.log('Admin panel initialized');