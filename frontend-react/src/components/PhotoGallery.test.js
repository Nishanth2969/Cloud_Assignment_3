import React from 'react';
import { render, screen } from '@testing-library/react';
import PhotoGallery from './PhotoGallery';

describe('PhotoGallery Component', () => {
  const mockPhotos = [
    { url: 'https://example.com/photo1.jpg', labels: ['dog', 'outdoor'] },
    { url: 'https://example.com/photo2.jpg', labels: ['cat', 'indoor'] },
    { url: 'https://example.com/photo3.jpg', labels: ['bird', 'tree'] }
  ];

  test('renders all photos', () => {
    render(<PhotoGallery photos={mockPhotos} />);
    
    const images = screen.getAllByAltText('Photo');
    expect(images).toHaveLength(3);
  });

  test('renders photos with correct URLs', () => {
    render(<PhotoGallery photos={mockPhotos} />);
    
    const images = screen.getAllByAltText('Photo');
    expect(images[0]).toHaveAttribute('src', mockPhotos[0].url);
    expect(images[1]).toHaveAttribute('src', mockPhotos[1].url);
    expect(images[2]).toHaveAttribute('src', mockPhotos[2].url);
  });

  test('renders empty gallery when no photos provided', () => {
    const { container } = render(<PhotoGallery photos={[]} />);
    
    const images = screen.queryAllByAltText('Photo');
    expect(images).toHaveLength(0);
    expect(container.querySelector('.photo-gallery')).toBeInTheDocument();
  });

  test('renders all labels for all photos', () => {
    render(<PhotoGallery photos={mockPhotos} />);
    
    expect(screen.getByText('dog')).toBeInTheDocument();
    expect(screen.getByText('cat')).toBeInTheDocument();
    expect(screen.getByText('bird')).toBeInTheDocument();
    expect(screen.getByText('outdoor')).toBeInTheDocument();
    expect(screen.getByText('indoor')).toBeInTheDocument();
    expect(screen.getByText('tree')).toBeInTheDocument();
  });

  test('uses Bootstrap grid layout', () => {
    const { container } = render(<PhotoGallery photos={mockPhotos} />);
    
    expect(container.querySelector('.row')).toBeInTheDocument();
    expect(container.querySelectorAll('.col')).toHaveLength(3);
  });
});

