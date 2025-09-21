/**
 * @jest-environment node
 */
import { GET, POST } from '../students/route';
import { NextRequest } from 'next/server';

// Mock the database functions
jest.mock('@/lib/db-unified', () => ({
  getStudents: jest.fn(),
  addStudent: jest.fn(),
}));

import { getStudents, addStudent } from '@/lib/db-unified';

describe('/api/students', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return students list', async () => {
      const mockStudents = [
        { id: 1, name: 'Student 1', access_code: 'STU1234' },
        { id: 2, name: 'Student 2', access_code: 'STU5678' },
      ];

      (getStudents as jest.Mock).mockResolvedValue(mockStudents);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual(mockStudents);
      expect(getStudents).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      (getStudents as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch students');
    });

    it('should return empty array when no students', async () => {
      (getStudents as jest.Mock).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual([]);
    });
  });

  describe('POST', () => {
    it('should create a new student with valid data', async () => {
      const mockResult = {
        lastInsertRowid: 3,
        accessCode: 'NEW1234',
      };

      (addStudent as jest.Mock).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/students', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Student', email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.accessCode).toBe('NEW1234');
      expect(addStudent).toHaveBeenCalledWith('New Student', 'test@example.com');
    });

    it('should reject missing name', async () => {
      const request = new NextRequest('http://localhost/api/students', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
      expect(addStudent).not.toHaveBeenCalled();
    });

    it('should reject invalid name length', async () => {
      const request = new NextRequest('http://localhost/api/students', {
        method: 'POST',
        body: JSON.stringify({ name: 'A' }), // Too short
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name must be between 2 and 100 characters');
      expect(addStudent).not.toHaveBeenCalled();
    });

    it('should reject invalid email format', async () => {
      const request = new NextRequest('http://localhost/api/students', {
        method: 'POST',
        body: JSON.stringify({ name: 'Valid Name', email: 'invalid-email' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid email format');
      expect(addStudent).not.toHaveBeenCalled();
    });

    it('should allow student creation without email', async () => {
      const mockResult = {
        lastInsertRowid: 4,
        accessCode: 'VAL4567',
      };

      (addStudent as jest.Mock).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/students', {
        method: 'POST',
        body: JSON.stringify({ name: 'Valid Name' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(addStudent).toHaveBeenCalledWith('Valid Name', undefined);
    });
  });
});