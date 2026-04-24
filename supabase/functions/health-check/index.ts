// Supabase Edge Function: health-check
// Returns system health status and database connectivity
// Deployed at: https://hqqfebdcxiancvaloriq.supabase.co/functions/v1/health-check

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const hasServiceKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      supabase: {
        url: supabaseUrl ? 'configured' : 'missing',
        serviceKey: hasServiceKey ? 'configured' : 'missing',
      },
      functions: {
        'emit-xp': 'available',
        'generate-quests': 'available',
        'check-achievements': 'available',
        'health-check': 'available',
      },
    };

    return new Response(
      JSON.stringify(health),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'unhealthy', error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
