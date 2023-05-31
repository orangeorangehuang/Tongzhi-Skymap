import { getConstById } from '@/lib/mongo/consts';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  const id = params.id;
  try {
    const res = await getConstById(String(id));
    const returnData = {
      const_id: res.const?.const_id,
      name: res.const?.const_name,
      display_name: res.const?.display_name,
      color: res.const?.color,
      lon: res.const?.lon,
      lat: res.const?.lat,
      lines: res.const?.lines,
      stars: res.const?.stars, 
      filename: res.const?.filename,
    };

    return NextResponse.json(
      { const: returnData },
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
