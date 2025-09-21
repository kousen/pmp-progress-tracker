'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import LoginForm from './components/LoginForm';
import ProgressGrid from './components/ProgressGrid';
import AdminPanel from './components/AdminPanel';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'student' | 'viewer'>('viewer');
  const [studentId, setStudentId] = useState<number | undefined>();
  const [studentName, setStudentName] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = Cookies.get('auth-token');
    if (token) {
      setIsAuthenticated(true);
      if (token === 'authenticated-admin') {
        setUserType('admin');
      } else if (token.startsWith('student-')) {
        setUserType('student');
        const id = parseInt(token.replace('student-', ''));
        setStudentId(id);
      }
    }
  }, []);

  const handleLogin = (type: 'admin' | 'student' | 'viewer', sid?: number) => {
    setIsAuthenticated(true);
    setUserType(type);
    if (type === 'student' && sid) {
      setStudentId(sid);
    }
  };

  const handleLogout = () => {
    Cookies.remove('auth-token');
    setIsAuthenticated(false);
    setUserType('viewer');
    setStudentId(undefined);
    setStudentName('');
  };

  const handleStudentAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                PMP Certification Progress Tracker
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                CPSC 403 - Senior Seminar | Udemy Course Progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Mode: <span className="font-semibold">
                  {userType === 'admin' && 'Admin'}
                  {userType === 'student' && `Student${studentName ? ` (${studentName})` : ''}`}
                  {userType === 'viewer' && 'View Only'}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {userType === 'admin' && <AdminPanel onStudentAdded={handleStudentAdded} />}

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Student Progress Grid</h2>
            <div className="overflow-auto max-h-[80vh]">
              <ProgressGrid key={refreshKey} userType={userType} studentId={studentId} />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Course:</strong>{' '}
                <a
                  href="https://www.udemy.com/course/ultimate-project-management-pmp-35-pdus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Ultimate Project Management PMP 35 PDUs
                </a>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Certification:</strong> PMI CAPM (Certified Associate in Project Management)
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Timeline:</strong> Now through end of October 2025
              </p>
              {userType === 'admin' && (
                <p className="text-sm text-blue-700 mt-2">
                  <strong>Admin Note:</strong> Click on any percentage value in the grid to update it.
                  Changes are saved automatically.
                </p>
              )}
              {userType === 'student' && (
                <p className="text-sm text-green-700 mt-2">
                  <strong>Student Note:</strong> You can update your own progress percentages.
                  Your row is highlighted in green.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
