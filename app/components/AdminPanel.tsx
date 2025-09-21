'use client';

import { useState } from 'react';

interface StudentInfo {
  name: string;
  accessCode: string;
}

interface AdminPanelProps {
  onStudentAdded: () => void;
}

export default function AdminPanel({ onStudentAdded }: AdminPanelProps) {
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentStudents, setRecentStudents] = useState<StudentInfo[]>([]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: studentName, email: studentEmail })
      });

      if (response.ok) {
        const data = await response.json();
        setRecentStudents([...recentStudents, { name: studentName, accessCode: data.accessCode }]);
        setStudentName('');
        setStudentEmail('');
        setShowAddStudent(false);
        onStudentAdded();
      }
    } catch (error) {
      // console.error('Error adding student:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedInitialStudents = async () => {
    const students = [
      'Alice Johnson',
      'Bob Smith',
      'Carol Williams',
      'David Brown',
      'Eve Davis',
      'Frank Miller',
      'Grace Wilson',
      'Henry Moore',
      'Iris Taylor'
    ];

    setLoading(true);
    const newStudents = [];
    for (const name of students) {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (response.ok) {
        const data = await response.json();
        newStudents.push({ name, accessCode: data.accessCode });
      }
    }
    setLoading(false);
    setRecentStudents(newStudents);
    onStudentAdded();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Admin Controls</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowAddStudent(!showAddStudent)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Student
          </button>
          <button
            onClick={seedInitialStudents}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Seed 9 Students
          </button>
        </div>
      </div>

      {showAddStudent && (
        <form onSubmit={handleAddStudent} className="space-y-4 mt-4 p-4 bg-gray-50 rounded">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Student Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddStudent(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {recentStudents.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-medium text-blue-900 mb-2">Recent Student Access Codes:</h3>
          <div className="space-y-1 text-sm">
            {recentStudents.map((student, index) => (
              <div key={index} className="flex justify-between">
                <span className="font-medium">{student.name}:</span>
                <span className="font-mono text-blue-600">{student.accessCode}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-3">
            <strong>Important:</strong> Save these access codes! Students need them to log in and update their progress.
          </p>
        </div>
      )}
    </div>
  );
}