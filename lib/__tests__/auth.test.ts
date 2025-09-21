import { verifyPassword, getUserFromToken, isAuthenticated, verifyStudentAccessCode } from '../auth';
import bcrypt from 'bcryptjs';
import { getStudentByAccessCode } from '../db-unified';

// Mock the database module
jest.mock('../db-unified');

describe('Authentication Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('verifyPassword', () => {
    it('should return true for correct password', () => {
      // The hardcoded password is 'trinity403'
      expect(verifyPassword('trinity403')).toBe(true);
    });

    it('should return false for incorrect password', () => {
      expect(verifyPassword('wrongpassword')).toBe(false);
      expect(verifyPassword('')).toBe(false);
      expect(verifyPassword('Trinity403')).toBe(false); // case sensitive
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for admin token', () => {
      expect(isAuthenticated('authenticated-admin')).toBe(true);
    });

    it('should return false for invalid tokens', () => {
      expect(isAuthenticated(undefined)).toBe(false);
      expect(isAuthenticated('')).toBe(false);
      expect(isAuthenticated('invalid-token')).toBe(false);
    });
  });

  describe('getUserFromToken', () => {
    it('should return admin user for admin token', () => {
      const user = getUserFromToken('authenticated-admin');
      expect(user.type).toBe('admin');
      expect(user.studentId).toBeUndefined();
    });

    it('should return student user for student token', () => {
      const user = getUserFromToken('student-5');
      expect(user.type).toBe('student');
      expect(user.studentId).toBe(5);
    });

    it('should return viewer for invalid tokens', () => {
      expect(getUserFromToken(undefined)).toEqual({ type: 'viewer' });
      expect(getUserFromToken('invalid')).toEqual({ type: 'viewer' });
      expect(getUserFromToken('')).toEqual({ type: 'viewer' });
    });

    it('should handle invalid student IDs', () => {
      const user = getUserFromToken('student-abc');
      expect(user.type).toBe('viewer');
      expect(user.studentId).toBeUndefined();
    });

    it('should handle malformed student tokens', () => {
      expect(getUserFromToken('student-')).toEqual({ type: 'viewer' });
      expect(getUserFromToken('student')).toEqual({ type: 'viewer' });
    });

    it('should handle large student IDs', () => {
      const user = getUserFromToken('student-999999');
      expect(user.type).toBe('student');
      expect(user.studentId).toBe(999999);
    });
  });

  describe('verifyStudentAccessCode', () => {
    it('should return student data for valid access code', async () => {
      const mockStudent = {
        id: 1,
        name: 'Test Student',
        access_code: 'TEST1234',
      };

      (getStudentByAccessCode as jest.Mock).mockResolvedValue(mockStudent);

      const result = await verifyStudentAccessCode('TEST1234');

      expect(result).toEqual(mockStudent);
      expect(getStudentByAccessCode).toHaveBeenCalledWith('TEST1234');
    });

    it('should return null for invalid access code', async () => {
      (getStudentByAccessCode as jest.Mock).mockResolvedValue(null);

      const result = await verifyStudentAccessCode('INVALID');

      expect(result).toBeNull();
      expect(getStudentByAccessCode).toHaveBeenCalledWith('INVALID');
    });

    it('should handle database errors', async () => {
      (getStudentByAccessCode as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(verifyStudentAccessCode('TEST1234')).rejects.toThrow('Database error');
    });

    it('should handle empty access code', async () => {
      (getStudentByAccessCode as jest.Mock).mockResolvedValue(null);

      const result = await verifyStudentAccessCode('');

      expect(result).toBeNull();
      expect(getStudentByAccessCode).toHaveBeenCalledWith('');
    });
  });
});