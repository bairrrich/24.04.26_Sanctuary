-- Add default timestamps for all createdAt/updatedAt columns
-- These already have defaults from Prisma (now()/updatedAt), but let's make sure
-- they also work via the REST API

DO $$
DECLARE
  col RECORD;
BEGIN
  FOR col IN 
    SELECT table_schema, table_name, column_name, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name IN ('createdAt', 'updatedAt')
    AND column_default IS NULL
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT CURRENT_TIMESTAMP', 
      col.table_schema, col.table_name, col.column_name);
  END LOOP;
END;
$$;
