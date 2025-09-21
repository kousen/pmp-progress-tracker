import { NextResponse } from 'next/server';
import { getModules } from '@/lib/db-unified';

export async function GET() {
  try {
    const modules = await getModules();
    return NextResponse.json(modules);
  } catch (error) {
    // console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}