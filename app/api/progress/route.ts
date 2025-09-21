import { NextResponse } from 'next/server';
import { getProgress, updateProgress } from '@/lib/db-unified';

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

export async function POST(request: Request) {
  try {
    const { studentId, moduleId, percentage } = await request.json();

    if (!studentId || !moduleId || percentage === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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