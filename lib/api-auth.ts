// Simple API authentication middleware
import { NextRequest } from 'next/server';
import { getUserFromToken } from './auth';

export function checkAuth(request: NextRequest) {
  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return { authorized: false, user: null };
  }

  const user = getUserFromToken(token);
  return {
    authorized: user.type !== 'viewer',
    user
  };
}

export function canModifyProgress(
  request: NextRequest,
  studentId: number
): boolean {
  const { authorized, user } = checkAuth(request);

  if (!authorized) return false;

  // Admin can modify anyone
  if (user?.type === 'admin') return true;

  // Student can only modify their own
  if (user?.type === 'student') {
    return user.studentId === studentId;
  }

  return false;
}