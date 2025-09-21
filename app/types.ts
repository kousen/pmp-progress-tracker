export interface Student {
  id: number;
  name: string;
  email?: string;
  created_at?: string;
}

export interface CourseModule {
  id: number;
  module_number: number;
  title: string;
  total_videos: number;
  duration_minutes: number;
}

export interface Progress {
  id: number;
  student_id: number;
  module_id: number;
  videos_completed: number;
  percentage: number;
  last_updated?: string;
  student_name?: string;
  module_title?: string;
  total_videos?: number;
}

export interface ExamStatus {
  id: number;
  student_id: number;
  scheduled_date?: string;
  passed: boolean;
  attempt_number: number;
  notes?: string;
  student_name?: string;
}