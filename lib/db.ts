import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/pmp-tracker.db'
  : path.join(process.cwd(), 'pmp-tracker.db');

const db = new Database(dbPath);

// Initialize database schema
const schema = `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    access_code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS course_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    total_videos INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    videos_completed INTEGER DEFAULT 0,
    percentage INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (module_id) REFERENCES course_modules(id),
    UNIQUE(student_id, module_id)
  );

  CREATE TABLE IF NOT EXISTS exam_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    scheduled_date DATE,
    passed BOOLEAN DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );
`;

db.exec(schema);

// Seed initial data if empty
const moduleCount = db.prepare('SELECT COUNT(*) as count FROM course_modules').get() as { count: number };

if (moduleCount.count === 0) {
  // Based on actual Udemy course structure: 11 sections, 238 lectures total
  const modules = [
    { module_number: 1, title: 'Key Concepts', total_videos: 23, duration_minutes: 0 },
    { module_number: 2, title: 'Agile Practice Guide - Introduction', total_videos: 7, duration_minutes: 0 },
    { module_number: 3, title: 'Agile Practice Guide - Teams and Practices', total_videos: 6, duration_minutes: 0 },
    { module_number: 4, title: 'Agile Practice Guide - Core Practices', total_videos: 6, duration_minutes: 0 },
    { module_number: 5, title: 'Agile Practice Guide - Frameworks', total_videos: 7, duration_minutes: 0 },
    { module_number: 6, title: 'Agile Practice Guide - Scaling and Advanced Topics', total_videos: 9, duration_minutes: 0 },
    { module_number: 7, title: 'Example Projects', total_videos: 11, duration_minutes: 0 },
    { module_number: 8, title: 'Planning', total_videos: 52, duration_minutes: 0 },
    { module_number: 9, title: 'Executing and Monitoring', total_videos: 54, duration_minutes: 0 },
    { module_number: 10, title: 'PMBOK 7th Edition', total_videos: 43, duration_minutes: 0 },
    { module_number: 11, title: 'PMP Fast Track and Practice Exams', total_videos: 20, duration_minutes: 0 }
  ];

  const insertModule = db.prepare(`
    INSERT INTO course_modules (module_number, title, total_videos, duration_minutes)
    VALUES (?, ?, ?, ?)
  `);

  for (const courseModule of modules) {
    insertModule.run(courseModule.module_number, courseModule.title, courseModule.total_videos, courseModule.duration_minutes);
  }
}

export default db;

// Helper functions for database operations
export const getStudents = () => {
  return db.prepare('SELECT * FROM students ORDER BY name').all();
};

export const getModules = () => {
  return db.prepare('SELECT * FROM course_modules ORDER BY module_number').all();
};

export const getProgress = (studentId?: number) => {
  if (studentId) {
    return db.prepare(`
      SELECT p.*, m.title, m.total_videos
      FROM progress p
      JOIN course_modules m ON p.module_id = m.id
      WHERE p.student_id = ?
    `).all(studentId);
  }
  return db.prepare(`
    SELECT p.*, s.name as student_name, m.title as module_title, m.total_videos
    FROM progress p
    JOIN students s ON p.student_id = s.id
    JOIN course_modules m ON p.module_id = m.id
    ORDER BY s.name, m.module_number
  `).all();
};

export const updateProgress = (studentId: number, moduleId: number, videosCompleted: number, percentage: number) => {
  const stmt = db.prepare(`
    INSERT INTO progress (student_id, module_id, videos_completed, percentage)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(student_id, module_id)
    DO UPDATE SET
      videos_completed = excluded.videos_completed,
      percentage = excluded.percentage,
      last_updated = CURRENT_TIMESTAMP
  `);
  return stmt.run(studentId, moduleId, videosCompleted, percentage);
};

export const addStudent = (name: string, email?: string, accessCode?: string) => {
  // Generate access code if not provided (first 3 letters of name + 4 random digits)
  const code = accessCode || `${name.slice(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
  const stmt = db.prepare('INSERT INTO students (name, email, access_code) VALUES (?, ?, ?)');
  const result = stmt.run(name, email || null, code);
  return { ...result, accessCode: code };
};

export const getStudentByAccessCode = (accessCode: string): any => {
  return db.prepare('SELECT * FROM students WHERE access_code = ?').get(accessCode);
};

export const getExamStatus = () => {
  return db.prepare(`
    SELECT e.*, s.name as student_name
    FROM exam_status e
    JOIN students s ON e.student_id = s.id
    ORDER BY e.scheduled_date DESC
  `).all();
};