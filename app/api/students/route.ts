import { NextResponse } from 'next/server';
import { getStudents, addStudent } from '@/lib/db-unified';

export async function GET() {
  try {
    const students = await getStudents();
    // console.log(`API: Returning ${students?.length || 0} students`);
    return NextResponse.json(students || []);
  } catch (error: any) {
    // console.error('Error fetching students:', error);
    // Return error details to help debug
    return NextResponse.json({
      error: 'Failed to fetch students',
      message: error?.message || 'Unknown error',
      students: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await addStudent(name, email);
    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      accessCode: result.accessCode
    });
  } catch (error) {
    // console.error('Error adding student:', error);
    return NextResponse.json(
      { error: 'Failed to add student' },
      { status: 500 }
    );
  }
}