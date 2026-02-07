// Admin Dashboard JavaScript
const API_BASE_URL = 'http://localhost:3000';
let authToken = null;
let currentPage = 1;
let currentTab = 'contacts';

// ==================== Authentication ====================

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('adminToken');

    if (authToken) {
        // Verify token is valid
        verifyAuthToken();
    } else {
        showLoginPage();
    }
});

// Login Form Handler
document.getElementById('loginForm')?.addEventListener('submit', async(e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    setLoading(true);
    hideError();

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Save token and admin info
        authToken = data.token;
        localStorage.setItem('adminToken', authToken);
        localStorage.setItem('adminInfo', JSON.stringify(data.admin));

        // Show dashboard
        showDashboard();

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Login failed. Please try again.');
    } finally {
        setLoading(false);
    }
});

// Verify Auth Token
async function verifyAuthToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showDashboard();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        logout();
    }
}

// Show Login Page
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
}

// Show Dashboard
function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';

    // Load admin info
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    document.getElementById('adminName').textContent = `Welcome, ${adminInfo.name || 'Admin'}!`;

    // Load dashboard data
    loadStats();
    loadContacts();
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    authToken = null;
    showLoginPage();
    document.getElementById('loginForm').reset();
}

// Show Error
function showError(message) {
    const errorBox = document.getElementById('loginError');
    errorBox.textContent = message;
    errorBox.classList.add('show');
}

// Hide Error
function hideError() {
    const errorBox = document.getElementById('loginError');
    errorBox.classList.remove('show');
}

// Set Loading State
function setLoading(loading) {
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('loginBtnText');
    const btnLoader = document.getElementById('loginBtnLoader');

    if (loading) {
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// ==================== Dashboard Data ====================

// Load Statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to load stats');

        const data = await response.json();

        document.getElementById('totalContacts').textContent = data.totalContacts || 0;
        document.getElementById('unreadContacts').textContent = data.unreadContacts || 0;
        document.getElementById('totalSubscribers').textContent = data.totalSubscribers || 0;

    } catch (error) {
        console.error('Stats error:', error);
    }
}

// Load Contacts
async function loadContacts(page = 1) {
    currentPage = page;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/contacts?page=${page}&limit=10`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to load contacts');

        const data = await response.json();

        displayContacts(data.contacts);
        displayPagination('contacts', data.pagination);

    } catch (error) {
        console.error('Contacts error:', error);
        document.getElementById('contactsTable').innerHTML =
            '<tr><td colspan="6" class="empty-state"><i class="fas fa-exclamation-circle"></i><br>Failed to load contacts</td></tr>';
    }
}

// Display Contacts
function displayContacts(contacts) {
    const tbody = document.getElementById('contactsTable');

    if (!contacts || contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><br>No contacts found</td></tr>';
        return;
    }

    tbody.innerHTML = contacts.map(contact => `
        <tr>
            <td>${escapeHtml(contact.name)}</td>
            <td>${escapeHtml(contact.email)}</td>
            <td>${escapeHtml(contact.subject)}</td>
            <td><span class="status-badge status-${contact.status}">${contact.status}</span></td>
            <td>${formatDate(contact.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-info" onclick="viewMessage('${contact._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-sm btn-danger" onclick="deleteContact('${contact._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load Subscribers
async function loadSubscribers(page = 1) {
    currentPage = page;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/subscribers?page=${page}&limit=10`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to load subscribers');

        const data = await response.json();

        displaySubscribers(data.subscribers);
        displayPagination('subscribers', data.pagination);

    } catch (error) {
        console.error('Subscribers error:', error);
        document.getElementById('subscribersTable').innerHTML =
            '<tr><td colspan="3" class="empty-state"><i class="fas fa-exclamation-circle"></i><br>Failed to load subscribers</td></tr>';
    }
}

// Display Subscribers
function displaySubscribers(subscribers) {
    const tbody = document.getElementById('subscribersTable');

    if (!subscribers || subscribers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><i class="fas fa-inbox"></i><br>No subscribers found</td></tr>';
        return;
    }

    tbody.innerHTML = subscribers.map(subscriber => `
        <tr>
            <td>${escapeHtml(subscriber.email)}</td>
            <td>${formatDate(subscriber.createdAt)}</td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteSubscriber('${subscriber._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Display Pagination
function displayPagination(type, pagination) {
    const container = document.getElementById(`${type}Pagination`);

    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    if (pagination.page > 1) {
        html += `<button onclick="load${capitalize(type)}(${pagination.page - 1})">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        const active = i === pagination.page ? 'active' : '';
        html += `<button class="${active}" onclick="load${capitalize(type)}(${i})">${i}</button>`;
    }

    // Next button
    if (pagination.page < pagination.pages) {
        html += `<button onclick="load${capitalize(type)}(${pagination.page + 1})">Next</button>`;
    }

    container.innerHTML = html;
}

// ==================== Actions ====================

// View Message
async function viewMessage(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contacts?page=1&limit=100`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to load message');

        const data = await response.json();
        const contact = data.contacts.find(c => c._id === id);

        if (!contact) throw new Error('Message not found');

        const modalContent = document.getElementById('messageDetails');
        modalContent.innerHTML = `
            <div style="margin: 20px 0;">
                <p><strong>From:</strong> ${escapeHtml(contact.name)}</p>
                <p><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p>
                <p><strong>Subject:</strong> ${escapeHtml(contact.subject)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${contact.status}">${contact.status}</span></p>
                <p><strong>Date:</strong> ${formatDate(contact.createdAt)}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
                    ${escapeHtml(contact.message)}
                </div>
                <hr>
                <div style="margin-top: 20px;">
                    <label><strong>Update Status:</strong></label>
                    <select id="statusSelect" class="form-control" style="margin: 10px 0; padding: 10px;">
                        <option value="unread" ${contact.status === 'unread' ? 'selected' : ''}>Unread</option>
                        <option value="read" ${contact.status === 'read' ? 'selected' : ''}>Read</option>
                        <option value="replied" ${contact.status === 'replied' ? 'selected' : ''}>Replied</option>
                        <option value="archived" ${contact.status === 'archived' ? 'selected' : ''}>Archived</option>
                    </select>
                    <button class="btn-login" onclick="updateContactStatus('${id}')">Update Status</button>
                </div>
            </div>
        `;

        document.getElementById('messageModal').classList.add('show');

        // Mark as read if unread
        if (contact.status === 'unread') {
            await updateContactStatusSilent(id, 'read');
        }

    } catch (error) {
        console.error('View message error:', error);
        alert('Failed to load message details');
    }
}

// Update Contact Status
async function updateContactStatus(id) {
    const status = document.getElementById('statusSelect').value;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/contacts/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('Failed to update status');

        alert('Status updated successfully!');
        closeModal('messageModal');
        loadContacts(currentPage);
        loadStats();

    } catch (error) {
        console.error('Update status error:', error);
        alert('Failed to update status');
    }
}

// Update Contact Status Silently
async function updateContactStatusSilent(id, status) {
    try {
        await fetch(`${API_BASE_URL}/admin/contacts/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });

        loadContacts(currentPage);
        loadStats();
    } catch (error) {
        console.error('Silent update error:', error);
    }
}

// Delete Contact
async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact message?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/contacts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to delete contact');

        alert('Contact deleted successfully!');
        loadContacts(currentPage);
        loadStats();

    } catch (error) {
        console.error('Delete contact error:', error);
        alert('Failed to delete contact');
    }
}

// Delete Subscriber
async function deleteSubscriber(id) {
    if (!confirm('Are you sure you want to delete this subscriber?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/subscribers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to delete subscriber');

        alert('Subscriber deleted successfully!');
        loadSubscribers(currentPage);
        loadStats();

    } catch (error) {
        console.error('Delete subscriber error:', error);
        alert('Failed to delete subscriber');
    }
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// ==================== Tab Navigation ====================

document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all links
        document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));

        // Add active class to clicked link
        e.currentTarget.classList.add('active');

        // Get tab name
        const tab = e.currentTarget.dataset.tab;
        currentTab = tab;

        // Hide all sections
        document.querySelectorAll('.tab-content').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        document.getElementById(`${tab}Section`).style.display = 'block';

        // Update page title
        document.getElementById('pageTitle').textContent =
            capitalize(tab) + (tab === 'blogs' ? '' : ' Management');

        // Load data for the tab
        if (tab === 'contacts') {
            loadContacts(1);
        } else if (tab === 'subscribers') {
            loadSubscribers(1);
        }
    });
});

// ==================== Utility Functions ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== Blog Management ====================

// Load Blogs (API version)
async function loadBlogs(page = 1) {
    currentPage = page;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/blogs?page=${page}&limit=10`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to load blogs');

        const data = await response.json();
        displayBlogs(data.blogs);
        displayPagination('blogs', data.pagination);

    } catch (error) {
        console.error('Blogs error:', error);
        document.getElementById('blogsTable').innerHTML =
            '<tr><td colspan="6" class="empty-state"><i class="fas fa-exclamation-circle"></i><br>Failed to load blogs</td></tr>';
    }
}

// Display Blogs
function displayBlogs(blogs) {
    const tbody = document.getElementById('blogsTable');

    if (!blogs || blogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-book"></i><br>No blogs found. Create your first blog!</td></tr>';
        return;
    }

    tbody.innerHTML = blogs.map(blog => `
        <tr>
            <td><strong>${escapeHtml(blog.title)}</strong></td>
            <td>${escapeHtml(blog.category)}</td>
            <td><span class="status-badge status-${blog.published ? 'read' : 'unread'}">${blog.published ? 'Published' : 'Draft'}</span></td>
            <td>${blog.views || 0}</td>
            <td>${formatDate(blog.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-info" onclick="editBlog('${blog._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-sm btn-danger" onclick="deleteBlog('${blog._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Save Blog (API version with image upload)
async function saveBlog() {
    const title = document.getElementById('blogTitle').value.trim();
    const content = document.getElementById('blogContent').value.trim();
    const imageFile = document.getElementById('blogImage').files[0];

    if (!title || !content) {
        alert('Please fill in all required fields (Title and Content)');
        return;
    }

    const tagsString = document.getElementById('blogTags').value;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t) : [];

    try {
        // Convert image to base64 if provided
        let imageData = null;
        if (imageFile) {
            imageData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
        }

        const blogData = {
            title,
            content,
            excerpt: document.getElementById('blogExcerpt').value.trim(),
            category: document.getElementById('blogCategory').value.trim() || 'Technology',
            tags,
            featured: document.getElementById('blogFeatured').checked,
            published: document.getElementById('blogPublished').checked,
            seoTitle: document.getElementById('blogSeoTitle').value.trim(),
            seoDescription: document.getElementById('blogSeoDescription').value.trim(),
            imageAlt: document.getElementById('blogImageAlt').value.trim(),
            image: imageData // Include image as base64 string or null
        };

        const blogId = document.getElementById('blogEditorContainer').dataset.editId;
        const endpoint = blogId 
            ? `${API_BASE_URL}/admin/blogs/${blogId}` 
            : `${API_BASE_URL}/admin/blogs`;
        const method = blogId ? 'PUT' : 'POST';

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(blogData)
        });

        const data = await response.json();

        if (!response.ok) {
            // Show validation details if available
            if (data.details && Array.isArray(data.details)) {
                throw new Error('Validation failed: ' + data.details.join(', '));
            }
            throw new Error(data.message || 'Failed to save blog');
        }

        alert(blogId ? 'Blog updated successfully!' : 'Blog created successfully!');
        resetBlogEditor();
        loadBlogs(1);

    } catch (error) {
        console.error('Save blog error:', error);
        alert('Failed to save blog: ' + error.message);
    }
}

// Edit Blog (API version)
async function editBlog(blogId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/blogs/${blogId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to load blog');

        const data = await response.json();
        const blog = data.blog;

        // Populate form
        document.getElementById('blogTitle').value = blog.title;
        document.getElementById('blogContent').value = blog.content;
        document.getElementById('blogExcerpt').value = blog.excerpt || '';
        document.getElementById('blogCategory').value = blog.category || 'Technology';
        document.getElementById('blogImageAlt').value = blog.imageAlt || '';
        document.getElementById('blogSeoTitle').value = blog.seoTitle || '';
        document.getElementById('blogSeoDescription').value = blog.seoDescription || '';
        document.getElementById('blogFeatured').checked = blog.featured || false;
        document.getElementById('blogPublished').checked = blog.published !== false;

        // Set tags
        const tagsString = blog.tags ? blog.tags.join(', ') : '';
        document.getElementById('blogTags').value = tagsString;

        // Show image preview if exists
        if (blog.image) {
            const preview = document.getElementById('imagePreviewBlog');
            preview.src = blog.image;
            preview.style.display = 'block';
        }

        // Mark as editing
        document.getElementById('blogEditorContainer').dataset.editId = blogId;

        // Scroll to editor
        document.getElementById('blogEditorContainer').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Edit blog error:', error);
        alert('Failed to load blog: ' + error.message);
    }
}

// Delete Blog (API version)
async function deleteBlog(blogId) {
    if (!confirm('Are you sure you want to delete this blog?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/blogs/${blogId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to delete blog');

        alert('Blog deleted successfully!');
        loadBlogs(currentPage);

    } catch (error) {
        console.error('Delete blog error:', error);
        alert('Failed to delete blog: ' + error.message);
    }
}

// Reset Blog Editor
function resetBlogEditor() {
    document.getElementById('blogTitle').value = '';
    document.getElementById('blogContent').value = '';
    document.getElementById('blogExcerpt').value = '';
    document.getElementById('blogCategory').value = 'Technology';
    document.getElementById('blogImageAlt').value = '';
    document.getElementById('blogSeoTitle').value = '';
    document.getElementById('blogSeoDescription').value = '';
    document.getElementById('blogTags').value = '';
    document.getElementById('blogFeatured').checked = false;
    document.getElementById('blogPublished').checked = true;

    document.getElementById('blogImage').value = '';
    document.getElementById('blogImage').dataset.url = '';
    document.getElementById('imagePreviewBlog').style.display = 'none';

    document.getElementById('blogEditorContainer').removeAttribute('data-edit-id');
}

// Image Upload Handler
document.getElementById('blogImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
        const preview = document.getElementById('imagePreviewBlog');
        preview.src = event.target.result;
        preview.style.display = 'block';
        console.log('✅ Image uploaded and ready');
    };
    reader.readAsDataURL(file);
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
    }
});