import { getStarByName } from '@/lib/mongo/stars';
import { getConstByName } from '@/lib/mongo/consts';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { name: string };
  }
) {
  const name = params.name;
  try {
    let returnData;
    let res;
    res = await getConstByName(String(name));
    if (res.const) {
      res = await getConstByName(String(name));
      returnData = {
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
    } 
    else {
      res = await getStarByName(String(name));
      returnData = {
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
    }
  } catch (error: any) {
    return NextResponse.json(error.message, {
      status: 500,
    });
  }
}
