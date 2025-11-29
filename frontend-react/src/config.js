const config = {
  apiGateway: {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod',
    API_KEY: process.env.REACT_APP_API_KEY || 'your-api-key-here',
    REGION: process.env.REACT_APP_REGION || 'us-east-1'
  },
  s3: {
    PHOTOS_BUCKET: process.env.REACT_APP_PHOTOS_BUCKET || 'your-photos-bucket-name'
  },
  // Toggle between mock and real API for local testing
  useMockAPI: process.env.REACT_APP_USE_MOCK === 'true' || !process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE_URL.includes('your-api-id')
};

export default config;
