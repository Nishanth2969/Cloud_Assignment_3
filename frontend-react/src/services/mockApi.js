// Mock API for local testing
const mockPhotos = [
  {
    url: 'https://via.placeholder.com/300/667eea/ffffff?text=Camera+1',
    labels: ['test', 'camera', 'electronics']
  },
  {
    url: 'https://via.placeholder.com/300/764ba2/ffffff?text=Electronics',  
    labels: ['electronics', 'gadget']
  },
  {
    url: 'https://via.placeholder.com/300/f093fb/ffffff?text=Test+Photo',
    labels: ['test', 'photo']
  }
];

export const mockSearchPhotos = async (query) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const keywords = query.toLowerCase().split(' ').filter(word => 
    !['show', 'me', 'photos', 'with', 'of', 'the'].includes(word)
  );
  
  // Filter photos that match any keyword
  const results = mockPhotos.filter(photo => 
    photo.labels.some(label => 
      keywords.some(keyword => label.includes(keyword))
    )
  );
  
  // Remove duplicates based on URL
  const uniqueResults = Array.from(
    new Map(results.map(item => [item.url, item])).values()
  );
  
  return {
    results: uniqueResults,
    query,
    keywords
  };
};

export const mockUploadPhoto = async (file, customLabels = '') => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const timestamp = new Date().getTime();
  const mockUrl = `https://via.placeholder.com/300/667eea/ffffff?text=${encodeURIComponent(file.name)}`;
  
  return {
    success: true,
    objectKey: `${timestamp}-${file.name}`,
    url: mockUrl
  };
};

