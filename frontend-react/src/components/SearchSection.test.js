import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchSection from './SearchSection';
import * as api from '../services/api';

jest.mock('../services/api');

describe('SearchSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input and button', () => {
    render(<SearchSection />);
    
    const searchInput = screen.getByPlaceholderText(/Search for photos/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    expect(searchInput).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  test('updates search input value on change', () => {
    render(<SearchSection />);
    
    const searchInput = screen.getByPlaceholderText(/Search for photos/i);
    fireEvent.change(searchInput, { target: { value: 'dogs' } });
    
    expect(searchInput.value).toBe('dogs');
  });

  test('shows error when searching with empty query', async () => {
    render(<SearchSection />);
    
    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a search query/i)).toBeInTheDocument();
    });
  });

  test('calls API and displays results on successful search', async () => {
    const mockResults = {
      results: [
        { url: 'https://example.com/photo1.jpg', labels: ['dog', 'outdoor'] },
        { url: 'https://example.com/photo2.jpg', labels: ['cat', 'indoor'] }
      ],
      query: 'dogs',
      keywords: ['dogs']
    };
    
    api.searchPhotos.mockResolvedValue(mockResults);
    
    render(<SearchSection />);
    
    const searchInput = screen.getByPlaceholderText(/Search for photos/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.change(searchInput, { target: { value: 'dogs' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(api.searchPhotos).toHaveBeenCalledWith('dogs');
      expect(screen.getByText(/Found 2 photos/i)).toBeInTheDocument();
    });
  });

  test('displays error message on search failure', async () => {
    api.searchPhotos.mockRejectedValue(new Error('Network error'));
    
    render(<SearchSection />);
    
    const searchInput = screen.getByPlaceholderText(/Search for photos/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.change(searchInput, { target: { value: 'dogs' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  test('displays no results message when search returns empty array', async () => {
    api.searchPhotos.mockResolvedValue({ results: [], query: 'xyz', keywords: ['xyz'] });
    
    render(<SearchSection />);
    
    const searchInput = screen.getByPlaceholderText(/Search for photos/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.change(searchInput, { target: { value: 'xyz' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/No photos found matching your query/i)).toBeInTheDocument();
    });
  });

  test('disables button and shows loading state during search', async () => {
    api.searchPhotos.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<SearchSection />);
    
    const searchInput = screen.getByPlaceholderText(/Search for photos/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.change(searchInput, { target: { value: 'dogs' } });
    fireEvent.click(searchButton);
    
    expect(searchButton).toBeDisabled();
    expect(screen.getByText(/Searching for photos/i)).toBeInTheDocument();
  });
});

