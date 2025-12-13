// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.currentEditingBlogId = null;
        this.blogs = [];
        this.subscribers = [];
        this.messages = [];
        
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        this.loadAllData();
    }

    checkLoginStatus() {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            this.isLoggedIn = true;
            this.currentUser = JSON.parse(storedUser);
            this.showAdminPanel();
        } else {
            this.showLoginPanel();
        }
    }

    setupEventListeners() {
        // Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.navigateTo(e.target.dataset.page));
        });

        // Blog Modal
        const addBlogBtn = document.getElementById('addBlogBtn');
        if (addBlogBtn) {
            addBlogBtn.addEventListener('click', () => this.openBlogModal());
        }

        const closeBlogModal = document.getElementById('closeBlogModal');
        if (closeBlogModal) {
            closeBlogModal.addEventListener('click', () => this.closeBlogModal());
        }

        const blogForm = document.getElementById('blogForm');
        if (blogForm) {
            blogForm.addEventListener('submit', (e) => this.handleBlogSubmit(e));
        }

        // Close modal when clicking outside
        const blogModal = document.getElementById('blogModal');
        if (blogModal) {
            blogModal.addEventListener('click', (e) => {
                if (e.target === blogModal) {
                    this.closeBlogModal();
                }
            });
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Demo credentials
        const demoUsername = 'admin';
        const demoPassword = 'admin123';

        if (username === demoUsername && password === demoPassword) {
            const userData = {
                username: username,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('adminUser', JSON.stringify(userData));
            this.isLoggedIn = true;
            this.currentUser = userData;
            
            document.getElementById('loginForm').reset();
            this.showAdminPanel();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Invalid credentials! Use demo: admin/admin123', 'error');
        }
    }

    handleLogout() {
        localStorage.removeItem('adminUser');
        this.isLoggedIn = false;
        this.currentUser = null;
        this.showLoginPanel();
        this.showNotification('Logged out successfully!', 'success');
    }

    showLoginPanel() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('adminContainer').classList.remove('active');
    }

    showAdminPanel() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminContainer').classList.add('active');
    }

    navigateTo(page) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.dashboard-section, .blog-section, .subscribers-section, .messages-section').forEach(section => {
            section.classList.remove('active');
        });

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            blog: 'Blog Posts',
            subscribers: 'Newsletter Subscribers',
            messages: 'Contact Messages'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

        // Show selected section
        switch(page) {
            case 'dashboard':
                document.getElementById('dashboardSection').classList.add('active');
                this.updateDashboard();
                break;
            case 'blog':
                document.getElementById('blogSection').classList.add('active');
                this.displayBlogs();
                break;
            case 'subscribers':
                document.getElementById('subscribersSection').classList.add('active');
                this.displaySubscribers();
                break;
            case 'messages':
                document.getElementById('messagesSection').classList.add('active');
                this.displayMessages();
                break;
        }
    }

    loadAllData() {
        // Load blogs
        const storedBlogs = localStorage.getItem('adminBlogs');
        if (storedBlogs) {
            this.blogs = JSON.parse(storedBlogs);
        }

        // Load subscribers
        this.loadSubscribers();

        // Load messages from database
        this.loadMessages();
    }

    loadMessages() {
        fetch('https://faranalam-backend-portfolio.onrender.com/messages')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    this.messages = data.map(m => ({
                        name: m.name,
                        email: m.email,
                        subject: m.subject,
                        message: m.message,
                        date: m.submittedAt || m.date
                    }));
                    console.log('Messages loaded from database');
                }
            })
            .catch(error => {
                console.log('Could not fetch messages from server, trying localStorage');
                // Fallback: Try localStorage
                const storedMessages = localStorage.getItem('contactMessages');
                if (storedMessages) {
                    this.messages = JSON.parse(storedMessages);
                }
            });
    }

    loadSubscribers() {
        // Try to load from server first (database)
        fetch('https://faranalam-backend-portfolio.onrender.com/subscribers')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    this.subscribers = data.map(s => ({
                        email: s.email,
                        date: s.subscribedAt || s.date
                    }));
                    console.log('Subscribers loaded from database');
                }
            })
            .catch(error => {
                console.log('Could not fetch subscribers from server, trying localStorage');
                // Fallback: Try localStorage
                const storedSubscribers = localStorage.getItem('newsLetterSubscribers');
                if (storedSubscribers) {
                    this.subscribers = JSON.parse(storedSubscribers);
                }
            });
    }

    updateDashboard() {
        document.getElementById('totalPosts').textContent = this.blogs.length;
        document.getElementById('totalSubscribers').textContent = this.subscribers.length;
        document.getElementById('totalMessages').textContent = this.messages.length;
    }

    displayBlogs() {
        const tbody = document.getElementById('blogTableBody');
        const noBlogsMessage = document.getElementById('noBlogsMessage');

        if (this.blogs.length === 0) {
            document.getElementById('blogTable').style.display = 'none';
            noBlogsMessage.style.display = 'block';
            return;
        }

        document.getElementById('blogTable').style.display = 'table';
        noBlogsMessage.style.display = 'none';

        tbody.innerHTML = '';
        
        this.blogs.forEach((blog, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.escapeHtml(blog.title)}</td>
                <td>${this.escapeHtml(blog.excerpt.substring(0, 50))}...</td>
                <td>${new Date(blog.date).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="adminPanel.editBlog(${index})">Edit</button>
                    <button class="action-btn delete-btn" onclick="adminPanel.deleteBlog(${index})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    displaySubscribers() {
        const tbody = document.getElementById('subscribersTableBody');
        const noSubscribersMessage = document.getElementById('noSubscribersMessage');

        if (this.subscribers.length === 0) {
            document.getElementById('subscribersTable').style.display = 'none';
            noSubscribersMessage.style.display = 'block';
            return;
        }

        document.getElementById('subscribersTable').style.display = 'table';
        noSubscribersMessage.style.display = 'none';

        tbody.innerHTML = '';
        
        this.subscribers.forEach((subscriber, index) => {
            const row = document.createElement('tr');
            const subscribeDate = subscriber.subscribedAt || subscriber.date ? new Date(subscriber.subscribedAt || subscriber.date).toLocaleDateString() : 'Unknown';
            row.innerHTML = `
                <td>${this.escapeHtml(subscriber.email)}</td>
                <td>${subscribeDate}</td>
                <td><span style="color: #27ae60; font-weight: 600;">Active</span></td>
                <td>
                    <button class="action-btn delete-btn" onclick="adminPanel.deleteSubscriber(${index})">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    displayMessages() {
        const container = document.getElementById('messagesContainer');
        const noMessagesMessage = document.getElementById('noMessagesMessage');

        if (this.messages.length === 0) {
            container.innerHTML = '';
            noMessagesMessage.style.display = 'block';
            return;
        }

        noMessagesMessage.style.display = 'none';
        container.innerHTML = '';

        this.messages.forEach((message, index) => {
            const messageDate = new Date(message.date).toLocaleString();
            const card = document.createElement('div');
            card.className = 'message-card';
            card.innerHTML = `
                <h4>${this.escapeHtml(message.name)} (${this.escapeHtml(message.email)})</h4>
                <p><strong>Subject:</strong> ${this.escapeHtml(message.subject)}</p>
                <p>${this.escapeHtml(message.message)}</p>
                <div class="message-meta">
                    <span>${messageDate}</span>
                    <button class="action-btn delete-btn" style="margin-left: 15px;" onclick="adminPanel.deleteMessage(${index})">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    openBlogModal(editIndex = null) {
        const modal = document.getElementById('blogModal');
        const title = document.getElementById('blogModalTitle');
        const titleInput = document.getElementById('blogTitle');
        const excerptInput = document.getElementById('blogExcerpt');
        const contentInput = document.getElementById('blogContent');
        const imageInput = document.getElementById('blogImage');

        if (editIndex !== null) {
            const blog = this.blogs[editIndex];
            title.textContent = 'Edit Post';
            titleInput.value = blog.title;
            excerptInput.value = blog.excerpt;
            contentInput.value = blog.content;
            imageInput.value = blog.image || '';
            this.currentEditingBlogId = editIndex;
        } else {
            title.textContent = 'Add New Post';
            titleInput.value = '';
            excerptInput.value = '';
            contentInput.value = '';
            imageInput.value = '';
            this.currentEditingBlogId = null;
        }

        modal.classList.add('active');
    }

    closeBlogModal() {
        document.getElementById('blogModal').classList.remove('active');
        document.getElementById('blogForm').reset();
        this.currentEditingBlogId = null;
    }

    handleBlogSubmit(e) {
        e.preventDefault();

        const blog = {
            title: document.getElementById('blogTitle').value,
            excerpt: document.getElementById('blogExcerpt').value,
            content: document.getElementById('blogContent').value,
            image: document.getElementById('blogImage').value,
            date: new Date().toISOString()
        };

        if (this.currentEditingBlogId !== null) {
            // Update existing blog
            this.blogs[this.currentEditingBlogId] = blog;
            this.showNotification('Post updated successfully!', 'success');
        } else {
            // Add new blog
            this.blogs.push(blog);
            this.showNotification('Post added successfully!', 'success');
        }

        // Save to localStorage
        localStorage.setItem('adminBlogs', JSON.stringify(this.blogs));
        
        this.closeBlogModal();
        this.displayBlogs();
        this.updateDashboard();
    }

    editBlog(index) {
        this.openBlogModal(index);
    }

    deleteBlog(index) {
        if (confirm('Are you sure you want to delete this post?')) {
            this.blogs.splice(index, 1);
            localStorage.setItem('adminBlogs', JSON.stringify(this.blogs));
            this.displayBlogs();
            this.updateDashboard();
            this.showNotification('Post deleted successfully!', 'success');
        }
    }

    deleteSubscriber(index) {
        const subscriber = this.subscribers[index];
        if (confirm('Are you sure you want to remove this subscriber?')) {
            // Try to delete from database first
            if (subscriber._id) {
                fetch(`https://faranalam-backend-portfolio.onrender.com/subscribers/${subscriber._id}`, {
                    method: 'DELETE'
                })
                .then(() => {
                    this.subscribers.splice(index, 1);
                    this.displaySubscribers();
                    this.updateDashboard();
                    this.showNotification('Subscriber removed successfully!', 'success');
                })
                .catch(err => {
                    console.error('Failed to delete from database', err);
                    // Fallback to localStorage
                    this.subscribers.splice(index, 1);
                    localStorage.setItem('newsLetterSubscribers', JSON.stringify(this.subscribers));
                    this.displaySubscribers();
                    this.updateDashboard();
                    this.showNotification('Subscriber removed!', 'success');
                });
            } else {
                // Delete from localStorage only
                this.subscribers.splice(index, 1);
                localStorage.setItem('newsLetterSubscribers', JSON.stringify(this.subscribers));
                this.displaySubscribers();
                this.updateDashboard();
                this.showNotification('Subscriber removed successfully!', 'success');
            }
        }
    }

    deleteMessage(index) {
        const message = this.messages[index];
        if (confirm('Are you sure you want to delete this message?')) {
            // Try to delete from database first
            if (message._id) {
                fetch(`https://faranalam-backend-portfolio.onrender.com/messages/${message._id}`, {
                    method: 'DELETE'
                })
                .then(() => {
                    this.messages.splice(index, 1);
                    this.displayMessages();
                    this.updateDashboard();
                    this.showNotification('Message deleted successfully!', 'success');
                })
                .catch(err => {
                    console.error('Failed to delete from database', err);
                    // Fallback to localStorage
                    this.messages.splice(index, 1);
                    localStorage.setItem('contactMessages', JSON.stringify(this.messages));
                    this.displayMessages();
                    this.updateDashboard();
                    this.showNotification('Message deleted!', 'success');
                });
            } else {
                // Delete from localStorage only
                this.messages.splice(index, 1);
                localStorage.setItem('contactMessages', JSON.stringify(this.messages));
                this.displayMessages();
                this.updateDashboard();
                this.showNotification('Message deleted successfully!', 'success');
            }
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideInUp 0.3s ease;
            max-width: 400px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize Admin Panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
