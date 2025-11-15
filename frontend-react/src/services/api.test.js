const mockGet = jest.fn();
const mockPut = jest.fn();
const mockAxiosPut = jest.fn();

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: mockGet,
    put: mockPut
  })),
  put: mockAxiosPut
}));

import { searchPhotos, uploadPhoto } from './api';
import config from '../config';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchPhotos', () => {
    test('successfully searches photos', async () => {
      const mockResponse = {
        data: {
          results: [
            { url: 'https://example.com/photo1.jpg', labels: ['dog'] }
          ],
          query: 'dogs',
          keywords: ['dogs']
        }
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await searchPhotos('dogs');

      expect(result).toEqual(mockResponse.data);
    });

    test('throws error on search failure', async () => {
      mockGet.mockRejectedValue(new Error('Network Error'));

      await expect(searchPhotos('dogs')).rejects.toThrow('Failed to search photos');
    });

    test('handles API error response', async () => {
      const apiError = {
        response: {
          data: {
            error: 'Invalid query'
          }
        }
      };

      mockGet.mockRejectedValue(apiError);

      await expect(searchPhotos('dogs')).rejects.toThrow();
    });
  });

  describe('uploadPhoto', () => {
    test('successfully uploads photo without custom labels', async () => {
      const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: 'success' };

      mockAxiosPut.mockResolvedValue(mockResponse);

      const result = await uploadPhoto(mockFile);

      expect(result.success).toBe(true);
      expect(result.objectKey).toContain('test.jpg');
    });

    test('successfully uploads photo with custom labels', async () => {
      const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: 'success' };
      const customLabels = 'Sam, Sally';

      mockAxiosPut.mockResolvedValue(mockResponse);

      const result = await uploadPhoto(mockFile, customLabels);

      expect(result.success).toBe(true);
      expect(mockAxiosPut).toHaveBeenCalledWith(
        expect.any(String),
        mockFile,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-amz-meta-customLabels': customLabels
          })
        })
      );
    });

    test('throws error on upload failure', async () => {
      const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

      mockAxiosPut.mockRejectedValue(new Error('Upload Error'));

      await expect(uploadPhoto(mockFile)).rejects.toThrow('Failed to upload photo');
    });
  });
});
