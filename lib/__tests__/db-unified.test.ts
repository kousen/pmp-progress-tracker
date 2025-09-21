/**
 * @jest-environment node
 */

// Mock both database modules before requiring anything
jest.mock('../db', () => ({
  getStudents: jest.fn(),
  getModules: jest.fn(),
  getProgress: jest.fn(),
  updateProgress: jest.fn(),
  addStudent: jest.fn(),
  getStudentByAccessCode: jest.fn(),
  getExamStatus: jest.fn(),
}));

jest.mock('../db-postgres', () => ({
  getStudentsPostgres: jest.fn(),
  getModulesPostgres: jest.fn(),
  getProgressPostgres: jest.fn(),
  updateProgressPostgres: jest.fn(),
  addStudentPostgres: jest.fn(),
  getStudentByAccessCodePostgres: jest.fn(),
  getExamStatusPostgres: jest.fn(),
  initializePostgresSchema: jest.fn().mockResolvedValue(undefined),
}));

describe('Unified Database Interface', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules to clear the USE_POSTGRES constant
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('SQLite mode (local)', () => {
    beforeEach(() => {
      delete process.env.POSTGRES_URL;
    });

    it('should use SQLite for getStudents', async () => {
      const mockStudents = [{ id: 1, name: 'Test Student' }];
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      sqliteDb.getStudents.mockReturnValue(mockStudents);

      const dbModule = require('../db-unified');
      const result = await dbModule.getStudents();

      expect(result).toEqual(mockStudents);
      expect(sqliteDb.getStudents).toHaveBeenCalled();
      expect(postgresDb.getStudentsPostgres).not.toHaveBeenCalled();
    });

    it('should use SQLite for getModules', async () => {
      const mockModules = [{ id: 1, name: 'Module 1' }];
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      sqliteDb.getModules.mockReturnValue(mockModules);

      const dbModule = require('../db-unified');
      const result = await dbModule.getModules();

      expect(result).toEqual(mockModules);
      expect(sqliteDb.getModules).toHaveBeenCalled();
      expect(postgresDb.getModulesPostgres).not.toHaveBeenCalled();
    });

    it('should use SQLite for getProgress', async () => {
      const mockProgress = [{ student_id: 1, module_id: 1, percentage: 50 }];
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      sqliteDb.getProgress.mockReturnValue(mockProgress);

      const dbModule = require('../db-unified');
      const result = await dbModule.getProgress(1);

      expect(result).toEqual(mockProgress);
      expect(sqliteDb.getProgress).toHaveBeenCalledWith(1);
      expect(postgresDb.getProgressPostgres).not.toHaveBeenCalled();
    });

    it('should use SQLite for updateProgress', async () => {
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      sqliteDb.updateProgress.mockReturnValue(undefined);

      const dbModule = require('../db-unified');
      await dbModule.updateProgress(1, 2, 5, 50);

      expect(sqliteDb.updateProgress).toHaveBeenCalledWith(1, 2, 5, 50);
      expect(postgresDb.updateProgressPostgres).not.toHaveBeenCalled();
    });

    it('should use SQLite for addStudent', async () => {
      const mockResult = { lastInsertRowid: 1, accessCode: 'TEST1234' };
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      sqliteDb.addStudent.mockReturnValue(mockResult);

      const dbModule = require('../db-unified');
      const result = await dbModule.addStudent('Test User', 'test@example.com');

      expect(result).toEqual(mockResult);
      expect(sqliteDb.addStudent).toHaveBeenCalledWith('Test User', 'test@example.com', undefined);
      expect(postgresDb.addStudentPostgres).not.toHaveBeenCalled();
    });

    it('should use SQLite for getStudentByAccessCode', async () => {
      const mockStudent = { id: 1, name: 'Test Student', access_code: 'TEST1234' };
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      sqliteDb.getStudentByAccessCode.mockReturnValue(mockStudent);

      const dbModule = require('../db-unified');
      const result = await dbModule.getStudentByAccessCode('TEST1234');

      expect(result).toEqual(mockStudent);
      expect(sqliteDb.getStudentByAccessCode).toHaveBeenCalledWith('TEST1234');
      expect(postgresDb.getStudentByAccessCodePostgres).not.toHaveBeenCalled();
    });

    it('should report SQLite as database type', () => {
      const dbModule = require('../db-unified');
      expect(dbModule.getDatabaseType()).toBe('SQLite (Local)');
    });
  });

  describe('PostgreSQL mode (Vercel)', () => {
    beforeEach(() => {
      process.env.POSTGRES_URL = 'postgresql://test';
    });

    it('should use PostgreSQL for getStudents', async () => {
      const mockStudents = [{ id: 1, name: 'Test Student' }];
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      postgresDb.getStudentsPostgres.mockResolvedValue(mockStudents);
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      const dbModule = require('../db-unified');
      const result = await dbModule.getStudents();

      expect(result).toEqual(mockStudents);
      expect(postgresDb.getStudentsPostgres).toHaveBeenCalled();
      expect(sqliteDb.getStudents).not.toHaveBeenCalled();
    });

    it('should use PostgreSQL for getModules', async () => {
      const mockModules = [{ id: 1, name: 'Module 1' }];
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      postgresDb.getModulesPostgres.mockResolvedValue(mockModules);
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      const dbModule = require('../db-unified');
      const result = await dbModule.getModules();

      expect(result).toEqual(mockModules);
      expect(postgresDb.getModulesPostgres).toHaveBeenCalled();
      expect(sqliteDb.getModules).not.toHaveBeenCalled();
    });

    it('should use PostgreSQL for getProgress', async () => {
      const mockProgress = [{ student_id: 1, module_id: 1, percentage: 50 }];
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      postgresDb.getProgressPostgres.mockResolvedValue(mockProgress);
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      const dbModule = require('../db-unified');
      const result = await dbModule.getProgress(1);

      expect(result).toEqual(mockProgress);
      expect(postgresDb.getProgressPostgres).toHaveBeenCalledWith(1);
      expect(sqliteDb.getProgress).not.toHaveBeenCalled();
    });

    it('should use PostgreSQL for updateProgress', async () => {
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      postgresDb.updateProgressPostgres.mockResolvedValue(undefined);
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      const dbModule = require('../db-unified');
      await dbModule.updateProgress(1, 2, 5, 50);

      expect(postgresDb.updateProgressPostgres).toHaveBeenCalledWith(1, 2, 5, 50);
      expect(sqliteDb.updateProgress).not.toHaveBeenCalled();
    });

    it('should use PostgreSQL for addStudent', async () => {
      const mockResult = { id: 1, accessCode: 'TEST1234' };
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      postgresDb.addStudentPostgres.mockResolvedValue(mockResult);
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      const dbModule = require('../db-unified');
      const result = await dbModule.addStudent('Test User', 'test@example.com', 'TEST1234');

      expect(result).toEqual(mockResult);
      expect(postgresDb.addStudentPostgres).toHaveBeenCalledWith('Test User', 'test@example.com', 'TEST1234');
      expect(sqliteDb.addStudent).not.toHaveBeenCalled();
    });

    it('should use PostgreSQL for getStudentByAccessCode', async () => {
      const mockStudent = { id: 1, name: 'Test Student', access_code: 'TEST1234' };
      const sqliteDb = require('../db');
      const postgresDb = require('../db-postgres');

      postgresDb.getStudentByAccessCodePostgres.mockResolvedValue(mockStudent);
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      const dbModule = require('../db-unified');
      const result = await dbModule.getStudentByAccessCode('TEST1234');

      expect(result).toEqual(mockStudent);
      expect(postgresDb.getStudentByAccessCodePostgres).toHaveBeenCalledWith('TEST1234');
      expect(sqliteDb.getStudentByAccessCode).not.toHaveBeenCalled();
    });

    it('should report PostgreSQL as database type', () => {
      const postgresDb = require('../db-postgres');
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      const dbModule = require('../db-unified');
      expect(dbModule.getDatabaseType()).toBe('PostgreSQL (Vercel)');
    });

    it('should initialize PostgreSQL schema on module load', () => {
      const postgresDb = require('../db-postgres');
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      require('../db-unified');
      expect(postgresDb.initializePostgresSchema).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      delete process.env.POSTGRES_URL;
    });

    it('should propagate SQLite errors', async () => {
      const error = new Error('SQLite error');
      const sqliteDb = require('../db');

      sqliteDb.getStudents.mockImplementation(() => {
        throw error;
      });

      const dbModule = require('../db-unified');
      await expect(dbModule.getStudents()).rejects.toThrow('SQLite error');
    });

    it('should propagate PostgreSQL errors', async () => {
      process.env.POSTGRES_URL = 'postgresql://test';
      const error = new Error('PostgreSQL error');
      const postgresDb = require('../db-postgres');

      postgresDb.getStudentsPostgres.mockRejectedValue(error);
      postgresDb.initializePostgresSchema.mockResolvedValue(undefined);

      const dbModule = require('../db-unified');
      await expect(dbModule.getStudents()).rejects.toThrow('PostgreSQL error');
    });
  });
});