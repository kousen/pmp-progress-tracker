'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';

interface LoginFormProps {
  onLogin: (userType: 'admin' | 'student' | 'viewer', studentId?: number) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [loginMode, setLoginMode] = useState<'choose' | 'admin' | 'student'>('choose');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, type: 'admin' })
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set('auth-token', data.token, { expires: 7 });
        onLogin('admin');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode, type: 'student' })
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set('auth-token', data.token, { expires: 7 });
        onLogin('student', data.studentId);
      } else {
        setError(data.error || 'Invalid access code');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loginMode === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter admin password to manage all students
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleAdminSubmit}>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Admin password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('choose')}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loginMode === 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Student Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your access code to update your progress
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleStudentSubmit}>
            <div>
              <label htmlFor="accessCode" className="sr-only">
                Access Code
              </label>
              <input
                id="accessCode"
                name="accessCode"
                type="text"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm uppercase"
                placeholder="Your access code (e.g., ALI1234)"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('choose')}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Choose mode screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            PMP Progress Tracker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            CPSC 403 - Senior Seminar
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setLoginMode('student')}
            className="group relative w-full flex justify-center py-4 px-4 border-2 border-green-500 text-lg font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <div>
              <div className="font-bold">Student Login</div>
              <div className="text-sm font-normal mt-1">Update your own progress</div>
            </div>
          </button>

          <button
            onClick={() => setLoginMode('admin')}
            className="group relative w-full flex justify-center py-4 px-4 border-2 border-blue-500 text-lg font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <div>
              <div className="font-bold">Admin Login</div>
              <div className="text-sm font-normal mt-1">Manage all students</div>
            </div>
          </button>

          <button
            onClick={() => onLogin('viewer')}
            className="group relative w-full flex justify-center py-4 px-4 border-2 border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <div>
              <div className="font-bold">View Only</div>
              <div className="text-sm font-normal mt-1">Browse progress (no editing)</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}