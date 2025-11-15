import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PhotoCard from './PhotoCard';
import './PhotoGallery.css';

const PhotoGallery = ({ photos }) => {
  return (
    <div className="photo-gallery">
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {photos.map((photo, index) => (
          <Col key={index}>
            <PhotoCard photo={photo} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PhotoGallery;

