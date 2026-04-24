import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface GenerateQuestsRequest {
  characterId: string;
}

// POST /api/supabase/generate-quests
export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestsRequest = await request.json();
    const { characterId } = body;

    if (!characterId) {
      return NextResponse.json(
        { error: 'characterId is required' },
        { status: 400 }
      );
    }

    // Call the Supabase Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-quests`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ characterId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Edge function generate-quests error:', data);
      return NextResponse.json(
        { error: data.error || 'Edge function failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling generate-quests edge function:', error);
    return NextResponse.json(
      { error: 'Failed to call generate-quests edge function' },
      { status: 500 }
    );
  }
}
