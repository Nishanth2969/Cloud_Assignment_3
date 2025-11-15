import React, { useState } from 'react';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { searchPhotos } from '../services/api';
import PhotoGallery from './PhotoGallery';
import './SearchSection.css';

const SearchSection = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const data = await searchPhotos(query);
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="search-section">
      <div className="search-header">
        <h2 className="section-title">Search Photos</h2>
      </div>

      <Form onSubmit={handleSearch}>
        <Row className="g-3">
          <Col xs={12} md={9}>
            <Form.Control
              type="text"
              placeholder="Search for photos (e.g., 'show me dogs and cats')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
              disabled={loading}
            />
          </Col>
          <Col xs={12} md={3}>
            <Button 
              variant="primary" 
              type="submit" 
              className="search-button w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Searching...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  Search
                </>
              )}
            </Button>
          </Col>
        </Row>
      </Form>

      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError('')}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <div className="results-container">
        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Searching for photos...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="no-results">
            <i className="bi bi-image"></i>
            <p>No photos found matching your query</p>
            <small>Try different keywords or upload more photos</small>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="results-info">
              <p>Found {results.length} photo{results.length !== 1 ? 's' : ''}</p>
            </div>
            <PhotoGallery photos={results} />
          </>
        ) : null}
      </div>
    </section>
  );
};

export default SearchSection;

