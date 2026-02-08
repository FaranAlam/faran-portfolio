// API Configuration - Automatically detects environment
const CONFIG = {
    // Check if running on localhost or production
    isLocalhost: window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.hostname.includes('192.168'),
    
    // API Base URLs
    API_URL: {
        LOCAL: 'http://localhost:3000',
        PRODUCTION: 'https://faran-portfolio-backend.onrender.com'
    },
    
    // Get current API URL based on environment
    getApiUrl: function() {
        return this.isLocalhost ? this.API_URL.LOCAL : this.API_URL.PRODUCTION;
    }
};

// Export for use in other files
window.API_BASE_URL = CONFIG.getApiUrl();
console.log('🌐 Environment:', CONFIG.isLocalhost ? 'LOCAL' : 'PRODUCTION');
console.log('🔗 API URL:', window.API_BASE_URL);
