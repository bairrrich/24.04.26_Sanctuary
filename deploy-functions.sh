#!/bin/bash
# Deploy Supabase Edge Functions
# Requires: SUPABASE_ACCESS_TOKEN environment variable
# Get your token from: https://supabase.com/dashboard/account/tokens

set -e

PROJECT_REF="hqqfebdcxiancvaloriq"

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN not set"
  echo "Get your token from: https://supabase.com/dashboard/account/tokens"
  echo "Then run: export SUPABASE_ACCESS_TOKEN=your_token"
  exit 1
fi

echo "Deploying Edge Functions to Supabase project: $PROJECT_REF"

# Deploy each function
for func in emit-xp generate-quests check-achievements health-check; do
  echo "Deploying $func..."
  npx supabase functions deploy $func --project-ref $PROJECT_REF
  echo "✅ $func deployed"
done

echo ""
echo "All Edge Functions deployed!"
echo ""
echo "Function URLs:"
echo "  - https://$PROJECT_REF.supabase.co/functions/v1/emit-xp"
echo "  - https://$PROJECT_REF.supabase.co/functions/v1/generate-quests"
echo "  - https://$PROJECT_REF.supabase.co/functions/v1/check-achievements"
echo "  - https://$PROJECT_REF.supabase.co/functions/v1/health-check"
