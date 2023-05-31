import { getStarById } from '@/lib/mongo/stars';
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
    const res = await getStarById(String(id));
    const returnData = {
      color: res.star?.color,
      const_id: res.star?.const_id,
      const_name: res.star?.const_name,
      dec: res.star?.dec,
      display_name: res.star?.display_name,
      filename: res.star?.filename,
      lat: res.star?.lat,
      lon: res.star?.lon,
      name: res.star?.name,
      prop_name: res.star?.prop_name,
      ra: res.star?.ra,
      star_id: res.star?.star_id,
    };

    return NextResponse.json(
      { star: returnData },
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
