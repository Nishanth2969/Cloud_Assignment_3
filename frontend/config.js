// API Configuration
// Replace these values with your actual API Gateway endpoints
const API_CONFIG = {
    // API Gateway base URL
    BASE_URL: 'https://jojgd55x5m.execute-api.us-east-1.amazonaws.com/dev',

    // API Key for authentication
    API_KEY: 'FZ6vUoFGknrjvkgCCM4P1W87HMLqCGoa20WCAOY6',
    
    // S3 bucket name for photo storage
    PHOTOS_BUCKET: 'photo-storage-assignment-3',
    
    // AWS Region
    REGION: 'us-east-1'
};

// API Endpoints
const API_ENDPOINTS = {
    SEARCH: `${API_CONFIG.BASE_URL}/search`,
    UPLOAD: `${API_CONFIG.BASE_URL}/photos`
};

