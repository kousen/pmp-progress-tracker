/**
 * @jest-environment node
 */
import { GET, POST } from '../progress/route';
import { NextRequest } from 'next/server';

// Mock the database and auth functions
jest.mock('@/lib/db-unified', () => ({
  getProgress: jest.fn(),
  updateProgress: jest.fn(),
}));

jest.mock('@/lib/api-auth', () => ({
  canModifyProgress: jest.fn(),
}));

import { getProgress, updateProgress } from '@/lib/db-unified';
import { canModifyProgress } from '@/lib/api-auth';

describe('/api/progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all progress when no studentId provided', async () => {
      const mockProgress = [
        { student_id: 1, module_id: 1, percentage: 50 },
        { student_id: 2, module_id: 1, percentage: 75 },
      ];

      (getProgress as jest.Mock).mockResolvedValue(mockProgress);

      const request = new Request('http://localhost/api/progress');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual(mockProgress);
      expect(getProgress).toHaveBeenCalledWith(undefined);
    });

    it('should return specific student progress when studentId provided', async () => {
      const mockProgress = [
        { student_id: 3, module_id: 1, percentage: 25 },
        { student_id: 3, module_id: 2, percentage: 50 },
      ];

      (getProgress as jest.Mock).mockResolvedValue(mockProgress);

      const request = new Request('http://localhost/api/progress?studentId=3');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual(mockProgress);
      expect(getProgress).toHaveBeenCalledWith(3);
    });

    it('should handle errors gracefully', async () => {
      (getProgress as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost/api/progress');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch progress');
    });
  });

  describe('POST', () => {
    it('should update progress when authorized', async () => {
      (canModifyProgress as jest.Mock).mockReturnValue(true);
      (updateProgress as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          studentId: 1,
          moduleId: 2,
          percentage: 75,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(canModifyProgress).toHaveBeenCalledWith(request, 1);
      expect(updateProgress).toHaveBeenCalledWith(1, 2, 8, 75); // 8 = 75% of ~10 videos
    });

    it('should reject unauthorized progress updates', async () => {
      (canModifyProgress as jest.Mock).mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          studentId: 2,
          moduleId: 1,
          percentage: 50,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized to modify this progress');
      expect(updateProgress).not.toHaveBeenCalled();
    });

    it('should reject missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          studentId: 1,
          // Missing moduleId and percentage
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
      expect(canModifyProgress).not.toHaveBeenCalled();
      expect(updateProgress).not.toHaveBeenCalled();
    });

    it('should reject invalid percentage values', async () => {
      (canModifyProgress as jest.Mock).mockReturnValue(true);

      const requestNegative = new NextRequest('http://localhost/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          studentId: 1,
          moduleId: 1,
          percentage: -10,
        }),
      });

      const responseNegative = await POST(requestNegative);
      const dataNegative = await responseNegative.json();

      expect(responseNegative.status).toBe(400);
      expect(dataNegative.error).toBe('Percentage must be between 0 and 100');

      const requestOver100 = new NextRequest('http://localhost/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          studentId: 1,
          moduleId: 1,
          percentage: 150,
        }),
      });

      const responseOver100 = await POST(requestOver100);
      const dataOver100 = await responseOver100.json();

      expect(responseOver100.status).toBe(400);
      expect(dataOver100.error).toBe('Percentage must be between 0 and 100');
      expect(updateProgress).not.toHaveBeenCalled();
    });

    it('should handle edge cases for percentage', async () => {
      (canModifyProgress as jest.Mock).mockReturnValue(true);
      (updateProgress as jest.Mock).mockResolvedValue(undefined);

      // Test 0%
      const request0 = new NextRequest('http://localhost/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          studentId: 1,
          moduleId: 1,
          percentage: 0,
        }),
      });

      const response0 = await POST(request0);
      expect(response0.status).toBe(200);
      expect(updateProgress).toHaveBeenCalledWith(1, 1, 0, 0);

      // Test 100%
      const request100 = new NextRequest('http://localhost/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          studentId: 1,
          moduleId: 1,
          percentage: 100,
        }),
      });

      const response100 = await POST(request100);
      expect(response100.status).toBe(200);
      expect(updateProgress).toHaveBeenCalledWith(1, 1, 10, 100);
    });
  });
});