-- Enable Row Level Security on all tables
-- For a single-user app, we allow all operations for anon and authenticated roles

ALTER TABLE "Character" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CharacterAttribute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "XPEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserAchievement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserQuest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CharacterSetupData" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Habit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HabitLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WaterLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Exercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiaryEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BodyMeasurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WellbeingLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HealthGoal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalendarEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Routine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoutineLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgressPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Shift" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeedPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Collection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CollectionItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables using a function
-- Note: Table names in PostgreSQL with uppercase must be double-quoted
CREATE OR REPLACE FUNCTION create_all_policies() RETURNS void AS $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('CREATE POLICY "Allow anon select on %I" ON %I FOR SELECT TO anon USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon insert on %I" ON %I FOR INSERT TO anon WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon update on %I" ON %I FOR UPDATE TO anon USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon delete on %I" ON %I FOR DELETE TO anon USING (true)', tbl, tbl);
    
    EXECUTE format('CREATE POLICY "Allow authenticated select on %I" ON %I FOR SELECT TO authenticated USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated insert on %I" ON %I FOR INSERT TO authenticated WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated update on %I" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated delete on %I" ON %I FOR DELETE TO authenticated USING (true)', tbl, tbl);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT create_all_policies();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_xp_events_character ON "XPEvent"("characterId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON "HabitLog"("habitId", "date");
CREATE INDEX IF NOT EXISTS idx_workouts_date ON "Workout"("date");
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON "DiaryEntry"("date");
CREATE INDEX IF NOT EXISTS idx_transactions_date ON "Transaction"("date");
CREATE INDEX IF NOT EXISTS idx_meal_entries_date ON "MealEntry"("date");
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON "CalendarEvent"("date");
CREATE INDEX IF NOT EXISTS idx_shifts_date ON "Shift"("date");
CREATE INDEX IF NOT EXISTS idx_reminders_date ON "Reminder"("date");
CREATE INDEX IF NOT EXISTS idx_user_quests_status ON "UserQuest"("characterId", "status");
