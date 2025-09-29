'use client';

import { useState, useEffect } from 'react';
import { Student, CourseModule, Progress } from '../types';

interface ProgressGridProps {
  userType: 'admin' | 'student' | 'viewer';
  studentId?: number;
}

export default function ProgressGrid({ userType, studentId }: ProgressGridProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<Map<string, Progress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, modulesRes, progressRes] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/modules', { cache: 'no-store' }),
        fetch('/api/progress', { cache: 'no-store' })
      ]);

      const studentsData = await studentsRes.json();
      const modulesData = await modulesRes.json();
      const progressData = await progressRes.json();

      // Check if we got an error response
      if (studentsData.error) {
        // console.error('API Error:', studentsData);
        setStudents(studentsData.students || []);
      } else if (Array.isArray(studentsData)) {
        // console.log('Fetched students:', studentsData.length, studentsData);
        setStudents(studentsData);
      } else {
        // console.error('Unexpected students data:', studentsData);
        setStudents([]);
      }
      setModules(modulesData);

      // Create a map for quick progress lookup
      const progressMap = new Map();
      progressData.forEach((p: Progress) => {
        progressMap.set(`${p.student_id}-${p.module_id}`, p);
      });
      setProgress(progressMap);
    } catch (error) {
      // console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (targetStudentId: number, moduleId: number, lecturesCompleted: number, totalLectures: number) => {
    // Only allow updates if admin or if student is updating their own progress
    if (userType === 'viewer') return;
    if (userType === 'student' && targetStudentId !== studentId) return;

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: targetStudentId, moduleId, lecturesCompleted, totalLectures })
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      // console.error('Error updating progress:', error);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-100';
    if (percentage < 25) return 'bg-red-100 text-red-800';
    if (percentage < 50) return 'bg-yellow-100 text-yellow-800';
    if (percentage < 75) return 'bg-blue-100 text-blue-800';
    if (percentage < 100) return 'bg-green-100 text-green-800';
    return 'bg-green-500 text-white font-bold';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto overflow-y-visible">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-gray-800 text-white p-3 text-left z-10">Student</th>
            {modules.map((module) => (
              <th
                key={module.id}
                className="bg-gray-800 text-white p-2 text-center min-w-[100px] text-xs"
              >
                <div className="font-bold">M{module.module_number}</div>
                <div className="font-normal text-gray-300 text-xs mt-1">{module.title}</div>
                <div className="font-normal text-gray-400 text-xs">({module.total_videos} lectures)</div>
              </th>
            ))}
            <th className="bg-gray-800 text-white p-3 text-center">Overall</th>
            <th className="bg-gray-800 text-white p-3 text-center">Exam Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const studentProgress = modules.map(m => {
              const key = `${student.id}-${m.id}`;
              return progress.get(key)?.percentage || 0;
            });
            const overall = Math.round(
              studentProgress.reduce((a, b) => a + b, 0) / modules.length
            );

            const isCurrentStudent = userType === 'student' && student.id === studentId;

            return (
              <tr key={student.id} className={`border-b hover:bg-gray-50 ${isCurrentStudent ? 'bg-green-50' : ''}`}>
                <td className={`sticky left-0 p-3 font-medium border-r z-10 ${isCurrentStudent ? 'bg-green-50' : 'bg-white'}`}>
                  {student.name}
                  {isCurrentStudent && (
                    <span className="ml-2 text-xs text-green-600 font-normal">(You)</span>
                  )}
                </td>
                {modules.map((module) => {
                  const key = `${student.id}-${module.id}`;
                  const prog = progress.get(key);
                  const lecturesCompleted = prog?.videos_completed || 0;
                  const percentage = prog?.percentage || 0;

                  // Can edit if: admin OR (student editing their own row)
                  const canEdit = userType === 'admin' || (userType === 'student' && student.id === studentId);

                  return (
                    <td key={module.id} className="p-2 text-center border-r">
                      <div className={`p-2 rounded ${getProgressColor(percentage)}`}>
                        {canEdit ? (
                          <input
                            type="number"
                            min="0"
                            max={module.total_videos}
                            value={lecturesCompleted}
                            onChange={(e) => updateProgress(student.id, module.id, parseInt(e.target.value) || 0, module.total_videos)}
                            className={`w-16 p-1 text-center rounded bg-transparent`}
                            placeholder="0"
                          />
                        ) : (
                          <span>{lecturesCompleted}</span>
                        )}
                        <div className="text-xs text-gray-600 mt-1">
                          / {module.total_videos}
                        </div>
                        {percentage > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({percentage}%)
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className={`p-3 text-center font-bold border-r ${getProgressColor(overall)}`}>
                  {overall}%
                </td>
                <td className="p-3 text-center">
                  <span className="text-sm text-gray-600">Not scheduled</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}