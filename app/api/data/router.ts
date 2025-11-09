import { NextRequest, NextResponse } from 'next/server';
import { generateInitialDataset, generateBatch } from '@/lib/dataGenerator';


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const count = parseInt(searchParams.get('count') || '10000');
  const batch = searchParams.get('batch') === 'true';
  const lastTimestamp = parseInt(searchParams.get('lastTimestamp') || Date.now().toString());

  try {
    let data;
    
    if (batch) {
      data = generateBatch(100, lastTimestamp);
    } else {
      data = generateInitialDataset(count);
    }

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error generating data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate data' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      received: body,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error processing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process data' },
      { status: 500 }
    );
  }
}