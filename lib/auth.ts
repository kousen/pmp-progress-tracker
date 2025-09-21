import bcrypt from 'bcryptjs';
import { getStudentByAccessCode } from './db-unified';

// Simple password-based authentication
// In production, you'd want to use environment variables for this
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('trinity403', 10);

export const verifyPassword = (password: string): boolean => {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
};

export const verifyStudentAccessCode = async (accessCode: string) => {
  return await getStudentByAccessCode(accessCode);
};

export const isAuthenticated = (token: string | undefined): boolean => {
  if (!token) return false;
  // Simple token validation - in production, use JWT
  return token === 'authenticated-admin';
};

export const getUserFromToken = (token: string | undefined): { type: 'admin' | 'student' | 'viewer', studentId?: number } => {
  if (!token) return { type: 'viewer' };

  if (token === 'authenticated-admin') {
    return { type: 'admin' };
  }

  // Check if it's a student token (format: student-{id})
  if (token.startsWith('student-')) {
    const studentId = parseInt(token.replace('student-', ''));
    if (!isNaN(studentId)) {
      return { type: 'student', studentId };
    }
  }

  return { type: 'viewer' };
};