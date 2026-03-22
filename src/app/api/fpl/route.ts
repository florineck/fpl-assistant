import { NextResponse } from 'next/server';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'bootstrap-static';

  try {
    const response = await fetch(`${FPL_API_BASE}/${endpoint}/`, {
      headers: {
        'User-Agent': 'FPL-Assistant/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
