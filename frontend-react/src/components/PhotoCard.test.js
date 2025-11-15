import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PhotoCard from './PhotoCard';

describe('PhotoCard Component', () => {
  const mockPhoto = {
    url: 'https://example.com/photo.jpg',
    labels: ['dog', 'outdoor', 'park']
  };

  test('renders photo image', () => {
    render(<PhotoCard photo={mockPhoto} />);
    
    const image = screen.getByAltText('Photo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockPhoto.url);
  });

  test('renders photo labels', () => {
    render(<PhotoCard photo={mockPhoto} />);
    
    expect(screen.getByText('dog')).toBeInTheDocument();
    expect(screen.getByText('outdoor')).toBeInTheDocument();
    expect(screen.getByText('park')).toBeInTheDocument();
  });

  test('displays placeholder when image fails to load', () => {
    render(<PhotoCard photo={mockPhoto} />);
    
    const image = screen.getByAltText('Photo');
    fireEvent.error(image);
    
    expect(screen.getByText(/Image not available/i)).toBeInTheDocument();
  });

  test('displays message when no labels are present', () => {
    const photoWithoutLabels = { url: 'https://example.com/photo.jpg', labels: [] };
    render(<PhotoCard photo={photoWithoutLabels} />);
    
    expect(screen.getByText(/No labels/i)).toBeInTheDocument();
  });

  test('has correct CSS classes', () => {
    const { container } = render(<PhotoCard photo={mockPhoto} />);
    
    expect(container.querySelector('.photo-card')).toBeInTheDocument();
    expect(container.querySelector('.labels-container')).toBeInTheDocument();
  });

  test('renders labels title', () => {
    render(<PhotoCard photo={mockPhoto} />);
    
    expect(screen.getByText('Labels')).toBeInTheDocument();
  });
});

