// Unified database interface that works with both SQLite (local) and PostgreSQL (Vercel)

import * as sqliteDb from './db';
import * as postgresDb from './db-postgres';

// Check if we're using PostgreSQL (Vercel) or SQLite (local)
const USE_POSTGRES = process.env.POSTGRES_URL ? true : false;

// Initialize database on first import
if (USE_POSTGRES) {
  postgresDb.initializePostgresSchema().catch(() => {
    // Silent catch - initialization errors are handled internally
  });
}

// Export unified functions that automatically use the right database
export const getStudents = async () => {
  if (USE_POSTGRES) {
    return await postgresDb.getStudentsPostgres();
  }
  return sqliteDb.getStudents();
};

export const getModules = async () => {
  if (USE_POSTGRES) {
    return await postgresDb.getModulesPostgres();
  }
  return sqliteDb.getModules();
};

export const getProgress = async (studentId?: number) => {
  if (USE_POSTGRES) {
    return await postgresDb.getProgressPostgres(studentId);
  }
  return sqliteDb.getProgress(studentId);
};

export const updateProgress = async (studentId: number, moduleId: number, videosCompleted: number, percentage: number) => {
  if (USE_POSTGRES) {
    return await postgresDb.updateProgressPostgres(studentId, moduleId, videosCompleted, percentage);
  }
  return sqliteDb.updateProgress(studentId, moduleId, videosCompleted, percentage);
};

export const addStudent = async (name: string, email?: string, accessCode?: string) => {
  if (USE_POSTGRES) {
    return await postgresDb.addStudentPostgres(name, email, accessCode);
  }
  return sqliteDb.addStudent(name, email, accessCode);
};

export const getStudentByAccessCode = async (accessCode: string) => {
  if (USE_POSTGRES) {
    return await postgresDb.getStudentByAccessCodePostgres(accessCode);
  }
  return sqliteDb.getStudentByAccessCode(accessCode);
};

export const getExamStatus = async () => {
  if (USE_POSTGRES) {
    return await postgresDb.getExamStatusPostgres();
  }
  return sqliteDb.getExamStatus();
};

export const getDatabaseType = () => {
  return USE_POSTGRES ? 'PostgreSQL (Vercel)' : 'SQLite (Local)';
};