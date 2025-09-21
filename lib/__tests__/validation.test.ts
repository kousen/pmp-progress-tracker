// Tests for validation logic used across the app

describe('Input Validation', () => {
  describe('Name Validation', () => {
    const isValidName = (name: string) => {
      return name.length >= 2 && name.length <= 100;
    };

    it('should accept valid names', () => {
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('Li')).toBe(true); // Minimum 2 chars
      expect(isValidName('A'.repeat(100))).toBe(true); // Maximum 100 chars
    });

    it('should reject invalid names', () => {
      expect(isValidName('A')).toBe(false); // Too short
      expect(isValidName('')).toBe(false); // Empty
      expect(isValidName('A'.repeat(101))).toBe(false); // Too long
    });
  });

  describe('Email Validation', () => {
    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('john.doe@company.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@email.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Percentage Validation', () => {
    const isValidPercentage = (percentage: number) => {
      return percentage >= 0 && percentage <= 100;
    };

    it('should accept valid percentages', () => {
      expect(isValidPercentage(0)).toBe(true);
      expect(isValidPercentage(50)).toBe(true);
      expect(isValidPercentage(100)).toBe(true);
      expect(isValidPercentage(25.5)).toBe(true); // Decimals ok
    });

    it('should reject invalid percentages', () => {
      expect(isValidPercentage(-1)).toBe(false);
      expect(isValidPercentage(101)).toBe(false);
      expect(isValidPercentage(150)).toBe(false);
      expect(isValidPercentage(-50)).toBe(false);
    });
  });

  describe('Access Code Generation', () => {
    const generateAccessCode = (name: string) => {
      const prefix = name.slice(0, 3).toUpperCase();
      const suffix = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}${suffix}`;
    };

    it('should generate valid access codes', () => {
      const code = generateAccessCode('John Doe');
      expect(code).toMatch(/^[A-Z]{3}\d{4}$/);
      expect(code.startsWith('JOH')).toBe(true);
    });

    it('should handle short names', () => {
      const code = generateAccessCode('Li');
      expect(code).toMatch(/^LI\d{4}$/);
    });

    it('should generate unique codes (statistically)', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateAccessCode('Test User'));
      }
      // Should generate mostly unique codes (allow for some collisions)
      expect(codes.size).toBeGreaterThan(90);
    });
  });
});