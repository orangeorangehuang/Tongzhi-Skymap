import { getDocumentById } from '@/lib/mongo/documents';
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
    const res = await getDocumentById(String(id));
    const returnData = {
      filename: res.document?.filename,
      paragraph: res.document?.paragraph,
    };

    return NextResponse.json(
      { document: returnData },
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
