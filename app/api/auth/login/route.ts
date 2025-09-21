import { NextResponse } from 'next/server';
import { verifyPassword, verifyStudentAccessCode } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'admin') {
      const { password } = body;
      if (verifyPassword(password)) {
        return NextResponse.json({
          success: true,
          token: 'authenticated-admin'
        });
      }
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    if (type === 'student') {
      const { accessCode } = body;
      const student = await verifyStudentAccessCode(accessCode);

      if (student) {
        return NextResponse.json({
          success: true,
          token: `student-${student.id}`,
          studentId: student.id,
          studentName: student.name
        });
      }
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid login type' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}