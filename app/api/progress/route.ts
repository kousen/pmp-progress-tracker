import { NextResponse, NextRequest } from 'next/server';
import { getProgress, updateProgress } from '@/lib/db-unified';
import { canModifyProgress } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const progress = await getProgress(studentId ? parseInt(studentId) : undefined);
    return NextResponse.json(progress);
  } catch (error) {
    // console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, moduleId, lecturesCompleted, totalLectures } = await request.json();

    if (!studentId || !moduleId || lecturesCompleted === undefined || !totalLectures) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user can modify this student's progress
    if (!canModifyProgress(request, studentId)) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this progress' },
        { status: 403 }
      );
    }

    // Validate lectures completed is between 0 and total lectures
    if (lecturesCompleted < 0 || lecturesCompleted > totalLectures) {
      return NextResponse.json(
        { error: `Lectures completed must be between 0 and ${totalLectures}` },
        { status: 400 }
      );
    }

    // Calculate percentage from lectures completed
    const percentage = Math.round((lecturesCompleted / totalLectures) * 100);

    await updateProgress(studentId, moduleId, lecturesCompleted, percentage);
    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}