import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import './PhotoCard.css';

const PhotoCard = ({ photo }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className="photo-card">
      <div className="photo-card-image-container">
        {imageError ? (
          <div className="photo-placeholder">
            <i className="bi bi-image-fill"></i>
            <p>Image not available</p>
          </div>
        ) : (
          <Card.Img 
            variant="top" 
            src={photo.url} 
            alt="Photo"
            onError={handleImageError}
            className="photo-card-image"
          />
        )}
      </div>
      <Card.Body className="photo-card-body">
        <Card.Title className="photo-card-title">Labels</Card.Title>
        <div className="labels-container">
          {photo.labels && photo.labels.length > 0 ? (
            photo.labels.map((label, index) => (
              <Badge 
                key={index} 
                bg="secondary" 
                className="label-badge"
              >
                {label}
              </Badge>
            ))
          ) : (
            <span className="text-muted">No labels</span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PhotoCard;

