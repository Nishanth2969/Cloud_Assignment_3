import axios from 'axios';
import config from '../config';

const apiClient = axios.create({
  baseURL: config.apiGateway.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': config.apiGateway.API_KEY
  }
});

export const searchPhotos = async (query) => {
  try {
    const response = await apiClient.get('/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error(error.response?.data?.error || 'Failed to search photos');
  }
};

export const uploadPhoto = async (file, customLabels = '') => {
  try {
    const timestamp = new Date().getTime();
    const objectKey = `${timestamp}-${file.name}`;
    const uploadUrl = `${config.apiGateway.BASE_URL}/photos/${objectKey}`;
    
    const headers = {
      'Content-Type': file.type,
      'X-Api-Key': config.apiGateway.API_KEY
    };
    
    if (customLabels) {
      headers['x-amz-meta-customLabels'] = customLabels;
    }
    
    await axios.put(uploadUrl, file, { headers });
    
    return {
      success: true,
      objectKey,
      url: `https://${config.s3.PHOTOS_BUCKET}.s3.amazonaws.com/${objectKey}`
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.response?.data?.error || 'Failed to upload photo');
  }
};

const apiService = {
  searchPhotos,
  uploadPhoto
};

export default apiService;

