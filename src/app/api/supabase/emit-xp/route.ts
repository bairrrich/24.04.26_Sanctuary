import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface EmitXPRequest {
  module: string;
  action: string;
  characterId: string;
  metadata?: Record<string, unknown>;
}

// POST /api/supabase/emit-xp
export async function POST(request: NextRequest) {
  try {
    const body: EmitXPRequest = await request.json();
    const { module, action, characterId, metadata } = body;

    if (!module || !action || !characterId) {
      return NextResponse.json(
        { error: 'module, action, and characterId are required' },
        { status: 400 }
      );
    }

    // Call the Supabase Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/emit-xp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          module,
          action,
          characterId,
          metadata: metadata || {},
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Edge function emit-xp error:', data);
      return NextResponse.json(
        { error: data.error || 'Edge function failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling emit-xp edge function:', error);
    return NextResponse.json(
      { error: 'Failed to call emit-xp edge function' },
      { status: 500 }
    );
  }
}
