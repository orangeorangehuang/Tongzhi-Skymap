import { getStars } from '@/lib/mongo/stars';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest
) {
  try {
    const res = await getStars();
    return NextResponse.json(
      { res },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(error.message, {
      status: 500,
    });
  }
}
