import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadSection from './UploadSection';
import * as api from '../services/api';

jest.mock('../services/api');

describe('UploadSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload form elements', () => {
    render(<UploadSection />);
    
    expect(screen.getByText(/Upload New Photo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter comma-separated labels/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Photo/i })).toBeInTheDocument();
  });

  test('upload button is disabled when no file is selected', () => {
    render(<UploadSection />);
    
    const uploadButton = screen.getByRole('button', { name: /Upload Photo/i });
    expect(uploadButton).toBeDisabled();
  });

  test('displays selected file name', () => {
    render(<UploadSection />);
    
    const file = new File(['dummy content'], 'test-photo.jpg', { type: 'image/jpeg' });
    const fileInput = document.getElementById('photoInput');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('test-photo.jpg')).toBeInTheDocument();
  });

  test('shows error for invalid file type', () => {
    render(<UploadSection />);
    
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.getElementById('photoInput');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/Please select a valid image file/i)).toBeInTheDocument();
  });

  test('shows error for file size exceeding limit', () => {
    render(<UploadSection />);
    
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
    
    const fileInput = document.getElementById('photoInput');
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    expect(screen.getByText(/File size must be less than 5MB/i)).toBeInTheDocument();
  });

  test('updates custom labels input', () => {
    render(<UploadSection />);
    
    const labelsInput = screen.getByPlaceholderText(/Enter comma-separated labels/i);
    fireEvent.change(labelsInput, { target: { value: 'Sam, Sally' } });
    
    expect(labelsInput.value).toBe('Sam, Sally');
  });

  test('successfully uploads photo with custom labels', async () => {
    api.uploadPhoto.mockResolvedValue({
      success: true,
      objectKey: '123-test.jpg',
      url: 'https://bucket.s3.amazonaws.com/123-test.jpg'
    });
    
    render(<UploadSection />);
    
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = document.getElementById('photoInput');
    const labelsInput = screen.getByPlaceholderText(/Enter comma-separated labels/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(labelsInput, { target: { value: 'Sam, Sally' } });
    
    const uploadButton = screen.getByRole('button', { name: /Upload Photo/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(api.uploadPhoto).toHaveBeenCalledWith(file, 'Sam, Sally');
      expect(screen.getByText(/Photo uploaded successfully/i)).toBeInTheDocument();
    });
  });

  test('shows error message on upload failure', async () => {
    api.uploadPhoto.mockRejectedValue(new Error('Upload failed'));
    
    render(<UploadSection />);
    
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = document.getElementById('photoInput');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const uploadButton = screen.getByRole('button', { name: /Upload Photo/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  test('resets form after successful upload', async () => {
    api.uploadPhoto.mockResolvedValue({
      success: true,
      objectKey: '123-test.jpg',
      url: 'https://bucket.s3.amazonaws.com/123-test.jpg'
    });
    
    render(<UploadSection />);
    
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = document.getElementById('photoInput');
    const labelsInput = screen.getByPlaceholderText(/Enter comma-separated labels/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(labelsInput, { target: { value: 'Test' } });
    
    const uploadButton = screen.getByRole('button', { name: /Upload Photo/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(labelsInput.value).toBe('');
    });
  });

  test('disables form during upload', async () => {
    api.uploadPhoto.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<UploadSection />);
    
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = document.getElementById('photoInput');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const uploadButton = screen.getByRole('button', { name: /Upload Photo/i });
    fireEvent.click(uploadButton);
    
    expect(uploadButton).toBeDisabled();
    expect(screen.getByText(/Uploading.../i)).toBeInTheDocument();
  });
});

