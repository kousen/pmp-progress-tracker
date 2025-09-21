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
    const { studentId, moduleId, percentage } = await request.json();

    if (!studentId || !moduleId || percentage === undefined) {
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

    // Validate percentage is between 0 and 100
    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Calculate videos completed based on percentage (rough estimate)
    const videosCompleted = Math.round((percentage / 100) * 10); // Assuming avg 10 videos per module

    await updateProgress(studentId, moduleId, videosCompleted, percentage);
    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}