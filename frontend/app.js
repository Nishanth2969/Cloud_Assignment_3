// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const photoInput = document.getElementById('photoInput');
const fileName = document.getElementById('fileName');
const customLabels = document.getElementById('customLabels');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

photoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        fileName.textContent = e.target.files[0].name;
    } else {
        fileName.textContent = 'Choose a photo';
    }
});

uploadBtn.addEventListener('click', handleUpload);

/**
 * Handle photo search
 */
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showMessage(searchResults, 'Please enter a search query', 'info');
        return;
    }
    
    searchBtn.disabled = true;
    searchResults.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        const response = await fetch(
            `${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_CONFIG.API_KEY
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        displaySearchResults(data.results || []);
        
    } catch (error) {
        console.error('Search error:', error);
        showMessage(searchResults, `Error: ${error.message}`, 'error');
    } finally {
        searchBtn.disabled = false;
    }
}

/**
 * Display search results in the UI
 */
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No photos found matching your query</div>';
        return;
    }
    
    results.forEach(photo => {
        const photoCard = createPhotoCard(photo);
        searchResults.appendChild(photoCard);
    });
}

/**
 * Create a photo card element
 */
function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    
    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = 'Photo';
    img.onerror = () => {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="250" height="200"%3E%3Crect fill="%23ddd" width="250" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
    };
    
    const labelsDiv = document.createElement('div');
    labelsDiv.className = 'photo-labels';
    
    const labelsTitle = document.createElement('h3');
    labelsTitle.textContent = 'Labels:';
    
    const labelsList = document.createElement('div');
    labelsList.className = 'labels-list';
    
    if (photo.labels && photo.labels.length > 0) {
        photo.labels.forEach(label => {
            const labelTag = document.createElement('span');
            labelTag.className = 'label-tag';
            labelTag.textContent = label;
            labelsList.appendChild(labelTag);
        });
    }
    
    labelsDiv.appendChild(labelsTitle);
    labelsDiv.appendChild(labelsList);
    
    card.appendChild(img);
    card.appendChild(labelsDiv);
    
    return card;
}

/**
 * Handle photo upload
 */
async function handleUpload() {
    const file = photoInput.files[0];
    
    if (!file) {
        showStatusMessage('Please select a photo to upload', 'error');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showStatusMessage('Please select a valid image file', 'error');
        return;
    }
    
    uploadBtn.disabled = true;
    showStatusMessage('Uploading...', 'info');
    
    try {
        // Prepare custom labels
        const customLabelsValue = customLabels.value.trim();
        
        // Generate unique filename
        const timestamp = new Date().getTime();
        const fileExtension = file.name.split('.').pop();
        const objectKey = `${timestamp}-${file.name}`;
        
        // Prepare headers
        const headers = {
            'Content-Type': file.type,
            'x-api-key': API_CONFIG.API_KEY
        };
        
        if (customLabelsValue) {
            headers['x-amz-meta-customLabels'] = customLabelsValue;
        }
        
        // Upload to S3 via API Gateway
        const uploadUrl = `${API_CONFIG.BASE_URL}/photos/${objectKey}`;
        
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: headers,
            body: file
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        showStatusMessage('Photo uploaded successfully!', 'success');
        
        // Reset form
        photoInput.value = '';
        fileName.textContent = 'Choose a photo';
        customLabels.value = '';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            uploadStatus.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Upload error:', error);
        showStatusMessage(`Upload failed: ${error.message}`, 'error');
    } finally {
        uploadBtn.disabled = false;
    }
}

/**
 * Show status message for upload
 */
function showStatusMessage(message, type) {
    uploadStatus.className = `status-message ${type}`;
    uploadStatus.textContent = message;
    uploadStatus.style.display = 'block';
}

/**
 * Show message in a container
 */
function showMessage(container, message, type) {
    container.innerHTML = `<div class="status-message ${type}">${message}</div>`;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Smart Photo Album initialized');
    
    // Check if API configuration is set
    if (API_CONFIG.BASE_URL.includes('your-api-id')) {
        showStatusMessage('Please update the API configuration in config.js', 'error');
    }
});

