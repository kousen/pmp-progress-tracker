import { sql } from '@vercel/postgres';

// Helper function to ensure database connection
async function ensureConnection() {
  try {
    // Simple query to test connection
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    // console.error('Database connection error:', error);
    return false;
  }
}

// Initialize database schema for PostgreSQL
export async function initializePostgresSchema() {
  try {
    // Create students table
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        access_code TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create course_modules table
    await sql`
      CREATE TABLE IF NOT EXISTS course_modules (
        id SERIAL PRIMARY KEY,
        module_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        total_videos INTEGER DEFAULT 0,
        duration_minutes INTEGER DEFAULT 0
      )
    `;

    // Create progress table
    await sql`
      CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id),
        module_id INTEGER NOT NULL REFERENCES course_modules(id),
        videos_completed INTEGER DEFAULT 0,
        percentage INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, module_id)
      )
    `;

    // Create exam_status table
    await sql`
      CREATE TABLE IF NOT EXISTS exam_status (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id),
        scheduled_date DATE,
        passed BOOLEAN DEFAULT false,
        attempt_number INTEGER DEFAULT 1,
        notes TEXT
      )
    `;

    // Seed course modules if empty
    const { rows: moduleCount } = await sql`SELECT COUNT(*) as count FROM course_modules`;

    if (parseInt(moduleCount[0].count) === 0) {
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

      for (const courseModule of modules) {
        await sql`
          INSERT INTO course_modules (module_number, title, total_videos, duration_minutes)
          VALUES (${courseModule.module_number}, ${courseModule.title}, ${courseModule.total_videos}, ${courseModule.duration_minutes})
        `;
      }
    }
  } catch (error) {
    // console.error('Error initializing PostgreSQL schema:', error);
  }
}

// PostgreSQL implementations of database functions
export const getStudentsPostgres = async () => {
  try {
    const { rows } = await sql`SELECT * FROM students ORDER BY name`;
    // console.log(`Fetched ${rows?.length || 0} students from PostgreSQL`);
    return rows || [];
  } catch (error) {
    // console.error('Error fetching students from PostgreSQL:', error);
    throw error; // Let the error propagate so we can see what's wrong
  }
};

export const getModulesPostgres = async () => {
  const { rows } = await sql`SELECT * FROM course_modules ORDER BY module_number`;
  return rows;
};

export const getProgressPostgres = async (studentId?: number) => {
  if (studentId) {
    const { rows } = await sql`
      SELECT p.*, m.title, m.total_videos
      FROM progress p
      JOIN course_modules m ON p.module_id = m.id
      WHERE p.student_id = ${studentId}
    `;
    return rows;
  }
  const { rows } = await sql`
    SELECT p.*, s.name as student_name, m.title as module_title, m.total_videos
    FROM progress p
    JOIN students s ON p.student_id = s.id
    JOIN course_modules m ON p.module_id = m.id
    ORDER BY s.name, m.module_number
  `;
  return rows;
};

export const updateProgressPostgres = async (studentId: number, moduleId: number, videosCompleted: number, percentage: number) => {
  await sql`
    INSERT INTO progress (student_id, module_id, videos_completed, percentage)
    VALUES (${studentId}, ${moduleId}, ${videosCompleted}, ${percentage})
    ON CONFLICT(student_id, module_id)
    DO UPDATE SET
      videos_completed = ${videosCompleted},
      percentage = ${percentage},
      last_updated = CURRENT_TIMESTAMP
  `;
  return { success: true };
};

export const addStudentPostgres = async (name: string, email?: string, accessCode?: string) => {
  const code = accessCode || `${name.slice(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
  const { rows } = await sql`
    INSERT INTO students (name, email, access_code)
    VALUES (${name}, ${email || null}, ${code})
    RETURNING id, access_code
  `;
  return { lastInsertRowid: rows[0].id, accessCode: rows[0].access_code };
};

export const getStudentByAccessCodePostgres = async (accessCode: string) => {
  const { rows } = await sql`SELECT * FROM students WHERE access_code = ${accessCode}`;
  return rows[0];
};

export const getExamStatusPostgres = async () => {
  const { rows } = await sql`
    SELECT e.*, s.name as student_name
    FROM exam_status e
    JOIN students s ON e.student_id = s.id
    ORDER BY e.scheduled_date DESC
  `;
  return rows;
};