/**
 * @jest-environment node
 */
import { checkAuth, canModifyProgress } from '../api-auth';

// Mock NextRequest since it's not available in test environment
class MockNextRequest {
  cookies: any;

  constructor(cookieValue?: string) {
    this.cookies = {
      get: jest.fn((name) =>
        name === 'auth-token' && cookieValue ? { value: cookieValue } : undefined
      ),
    };
  }
}

// Helper to create mock NextRequest with cookies
function createMockRequest(cookieValue?: string): any {
  return new MockNextRequest(cookieValue);
}

describe('API Authentication', () => {
  describe('checkAuth', () => {
    it('should return unauthorized for missing token', () => {
      const request = createMockRequest();
      const result = checkAuth(request);

      expect(result.authorized).toBe(false);
      expect(result.user).toBeNull();
    });

    it('should return authorized for admin token', () => {
      const request = createMockRequest('authenticated-admin');
      const result = checkAuth(request);

      expect(result.authorized).toBe(true);
      expect(result.user?.type).toBe('admin');
    });

    it('should return authorized for student token', () => {
      const request = createMockRequest('student-3');
      const result = checkAuth(request);

      expect(result.authorized).toBe(true);
      expect(result.user?.type).toBe('student');
      expect(result.user?.studentId).toBe(3);
    });

    it('should return unauthorized for viewer (invalid token)', () => {
      const request = createMockRequest('invalid-token');
      const result = checkAuth(request);

      expect(result.authorized).toBe(false);
      expect(result.user?.type).toBe('viewer');
    });
  });

  describe('canModifyProgress', () => {
    it('should allow admin to modify any progress', () => {
      const request = createMockRequest('authenticated-admin');

      expect(canModifyProgress(request, 1)).toBe(true);
      expect(canModifyProgress(request, 5)).toBe(true);
      expect(canModifyProgress(request, 100)).toBe(true);
    });

    it('should allow student to modify only their own progress', () => {
      const request = createMockRequest('student-5');

      expect(canModifyProgress(request, 5)).toBe(true);
      expect(canModifyProgress(request, 1)).toBe(false);
      expect(canModifyProgress(request, 10)).toBe(false);
    });

    it('should deny viewer from modifying any progress', () => {
      const requestNoToken = createMockRequest();
      const requestInvalid = createMockRequest('invalid');

      expect(canModifyProgress(requestNoToken, 1)).toBe(false);
      expect(canModifyProgress(requestInvalid, 1)).toBe(false);
    });
  });
});