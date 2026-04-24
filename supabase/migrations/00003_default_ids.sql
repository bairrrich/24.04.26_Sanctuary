-- Add default UUID generation for all id columns
-- Using gen_random_uuid() which is available in PostgreSQL 13+

ALTER TABLE "Character" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "CharacterAttribute" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "XPEvent" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "UserAchievement" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "UserQuest" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "CharacterSetupData" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Habit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "HabitLog" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "MealEntry" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "WaterLog" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Workout" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Exercise" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Transaction" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Budget" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "DiaryEntry" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "BodyMeasurement" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "WellbeingLog" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "HealthGoal" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "CalendarEvent" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Routine" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "RoutineLog" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "ProgressPhoto" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Shift" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "FeedPost" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Collection" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "CollectionItem" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Reminder" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "FamilyMember" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "FamilyEvent" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Also add updated_at trigger function for auto-updating updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables with updatedAt
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT table_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND column_name = 'updatedAt'
  LOOP
    EXECUTE format('
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', tbl);
  END LOOP;
END;
$$;
