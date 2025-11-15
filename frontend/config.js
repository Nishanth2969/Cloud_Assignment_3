// API Configuration
// Replace these values with your actual API Gateway endpoints
const API_CONFIG = {
    // API Gateway base URL
    BASE_URL: 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod',
    
    // API Key for authentication
    API_KEY: 'your-api-key-here',
    
    // S3 bucket name for photo storage
    PHOTOS_BUCKET: 'your-photos-bucket-name',
    
    // AWS Region
    REGION: 'us-east-1'
};

// API Endpoints
const API_ENDPOINTS = {
    SEARCH: `${API_CONFIG.BASE_URL}/search`,
    UPLOAD: `${API_CONFIG.BASE_URL}/photos`
};

