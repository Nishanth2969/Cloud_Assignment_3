import React, { useState, useRef } from 'react';
import { Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { uploadPhoto } from '../services/api';
import './UploadSection.css';

const UploadSection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [customLabels, setCustomLabels] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Please select a valid image file', type: 'danger' });
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'File size must be less than 5MB', type: 'danger' });
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setMessage({ text: '', type: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage({ text: 'Please select a photo to upload', type: 'danger' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: '', type: '' });

    try {
      setUploadProgress(30);
      
      await uploadPhoto(selectedFile, customLabels);
      
      setUploadProgress(100);
      
      setMessage({ 
        text: 'Photo uploaded successfully! It will be indexed shortly.', 
        type: 'success' 
      });
      
      setSelectedFile(null);
      setCustomLabels('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        setUploadProgress(0);
      }, 5000);
      
    } catch (err) {
      setUploadProgress(0);
      setMessage({ 
        text: `Upload failed: ${err.message}`, 
        type: 'danger' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="upload-section">
      <div className="upload-header">
        <h2 className="section-title">Upload New Photo</h2>
        <p className="section-subtitle">Add photos to your album with optional custom labels</p>
      </div>

      <Form onSubmit={handleUpload} className="upload-form">
        <Form.Group className="mb-3">
          <div className="file-upload-container">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
              id="photoInput"
              disabled={uploading}
            />
            <label htmlFor="photoInput" className="file-label">
              <div className="file-label-content">
                <i className="bi bi-cloud-upload"></i>
                <div className="file-label-text">
                  {selectedFile ? (
                    <>
                      <strong>{selectedFile.name}</strong>
                      <small>{(selectedFile.size / 1024).toFixed(2)} KB</small>
                    </>
                  ) : (
                    <>
                      <strong>Choose a photo</strong>
                      <small>or drag and drop here</small>
                    </>
                  )}
                </div>
              </div>
            </label>
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="form-label">
            Custom Labels <span className="text-muted">(optional)</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter comma-separated labels (e.g., 'Sam, Sally, Birthday')"
            value={customLabels}
            onChange={(e) => setCustomLabels(e.target.value)}
            className="custom-input"
            disabled={uploading}
          />
          <Form.Text className="text-muted">
            These labels will be added to auto-detected labels from Rekognition
          </Form.Text>
        </Form.Group>

        {uploading && uploadProgress > 0 && (
          <ProgressBar 
            now={uploadProgress} 
            label={`${uploadProgress}%`}
            className="mb-3"
            striped
            animated
          />
        )}

        <Button 
          variant="primary" 
          type="submit" 
          className="upload-button w-100"
          disabled={uploading || !selectedFile}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Uploading...
            </>
          ) : (
            <>
              <i className="bi bi-upload me-2"></i>
              Upload Photo
            </>
          )}
        </Button>
      </Form>

      {message.text && (
        <Alert 
          variant={message.type} 
          className="mt-3" 
          dismissible 
          onClose={() => setMessage({ text: '', type: '' })}
        >
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
          {message.text}
        </Alert>
      )}
    </section>
  );
};

export default UploadSection;

