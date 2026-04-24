'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, User, Ruler, Apple, Dumbbell, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ANIMATION } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useGamificationStore } from '@/store/gamification-store';

const SETUP_STEPS = [
  { id: 'name', icon: User, titleRu: 'Имя персонажа', titleEn: 'Character Name' },
  { id: 'physical', icon: Ruler, titleRu: 'Физические параметры', titleEn: 'Physical Parameters' },
  { id: 'nutrition', icon: Apple, titleRu: 'Цели питания', titleEn: 'Nutrition Goals' },
  { id: 'training', icon: Dumbbell, titleRu: 'Уровень подготовки', titleEn: 'Fitness Level' },
  { id: 'habits', icon: Target, titleRu: 'Целевые привычки', titleEn: 'Target Habits' },
  { id: 'focus', icon: Sparkles, titleRu: 'Фокус развития', titleEn: 'Development Focus' },
];

type SetupData = {
  height: string;
  weight: string;
  age: string;
  gender: string;
  dailyCalories: string;
  dailyProtein: string;
  dailyFat: string;
  dailyCarbs: string;
  dailyWater: string;
  fitnessLevel: string;
  targetSleepHours: string;
  targetWakeTime: string;
  focusAreas: string[];
};

export function CharacterSetup() {
  const language = useSettingsStore((s) => s.language);
  const { createCharacter, updateSetup, completeSetup } = useGamificationStore();
  const [step, setStep] = useState(0);
  const [characterName, setCharacterName] = useState('');
  const [setupData, setSetupData] = useState<SetupData>({
    height: '175',
    weight: '70',
    age: '25',
    gender: 'male',
    dailyCalories: '2000',
    dailyProtein: '150',
    dailyFat: '70',
    dailyCarbs: '250',
    dailyWater: '2000',
    fitnessLevel: 'beginner',
    targetSleepHours: '8',
    targetWakeTime: '07:00',
    focusAreas: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = SETUP_STEPS[step];
  const isLastStep = step === SETUP_STEPS.length - 1;
  const canProceed = step === 0 ? characterName.trim().length > 0 : step === 5 ? setupData.focusAreas.length > 0 : true;

  const handleNext = async () => {
    if (step === 0) {
      // Create character first
      setIsSubmitting(true);
      await createCharacter(characterName.trim());
      setIsSubmitting(false);
    }

    if (isLastStep) {
      // Complete setup
      setIsSubmitting(true);
      await updateSetup({
        height: setupData.height ? parseFloat(setupData.height) : null,
        weight: setupData.weight ? parseFloat(setupData.weight) : null,
        age: setupData.age ? parseInt(setupData.age) : null,
        gender: setupData.gender,
        dailyCalories: setupData.dailyCalories ? parseInt(setupData.dailyCalories) : null,
        dailyProtein: setupData.dailyProtein ? parseInt(setupData.dailyProtein) : null,
        dailyFat: setupData.dailyFat ? parseInt(setupData.dailyFat) : null,
        dailyCarbs: setupData.dailyCarbs ? parseInt(setupData.dailyCarbs) : null,
        dailyWater: setupData.dailyWater ? parseInt(setupData.dailyWater) : null,
        fitnessLevel: setupData.fitnessLevel,
        targetSleepHours: setupData.targetSleepHours ? parseFloat(setupData.targetSleepHours) : null,
        targetWakeTime: setupData.targetWakeTime,
        focusAreas: setupData.focusAreas,
      });
      await completeSetup();
      setIsSubmitting(false);
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleFocusArea = (area: string) => {
    setSetupData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 mb-8">
          {SETUP_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <currentStep.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {language === 'ru' ? currentStep.titleRu : currentStep.titleEn}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'ru' ? `Шаг ${step + 1} из ${SETUP_STEPS.length}` : `Step ${step + 1} of ${SETUP_STEPS.length}`}
            </p>
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[280px]"
          >
            {step === 0 && (
              <NameStep
                value={characterName}
                onChange={setCharacterName}
                language={language}
              />
            )}
            {step === 1 && (
              <PhysicalStep
                data={setupData}
                onChange={setSetupData}
                language={language}
              />
            )}
            {step === 2 && (
              <NutritionStep
                data={setupData}
                onChange={setSetupData}
                language={language}
              />
            )}
            {step === 3 && (
              <TrainingStep
                data={setupData}
                onChange={setSetupData}
                language={language}
              />
            )}
            {step === 4 && (
              <HabitsStep
                data={setupData}
                onChange={setSetupData}
                language={language}
              />
            )}
            {step === 5 && (
              <FocusStep
                data={setupData}
                onToggle={toggleFocusArea}
                language={language}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ru' ? 'Назад' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="gap-2"
          >
            {isLastStep ? (
              <>
                <Check className="h-4 w-4" />
                {language === 'ru' ? 'Начать!' : 'Start!'}
              </>
            ) : (
              <>
                {language === 'ru' ? 'Далее' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== Step Components ====================

function NameStep({ value, onChange, language }: { value: string; onChange: (v: string) => void; language: 'en' | 'ru' }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {language === 'ru'
          ? 'Как тебя зовут? Это имя будет отображаться в твоём профиле.'
          : 'What\'s your name? This will be displayed in your profile.'}
      </p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={language === 'ru' ? 'Введи своё имя...' : 'Enter your name...'}
        className="text-lg"
        autoFocus
      />
      <p className="text-xs text-muted-foreground">
        {language === 'ru'
          ? '💡 Имя можно изменить позже в настройках'
          : '💡 You can change your name later in settings'}
      </p>
    </div>
  );
}

function PhysicalStep({ data, onChange, language }: { data: SetupData; onChange: (v: SetupData) => void; language: 'en' | 'ru' }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {language === 'ru'
          ? 'Эти данные используются для модулей тренировок и питания.'
          : 'This data is used for training and nutrition modules.'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {language === 'ru' ? 'Рост (см)' : 'Height (cm)'}
          </label>
          <Input
            type="number"
            value={data.height}
            onChange={(e) => onChange({ ...data, height: e.target.value })}
            placeholder="175"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {language === 'ru' ? 'Вес (кг)' : 'Weight (kg)'}
          </label>
          <Input
            type="number"
            value={data.weight}
            onChange={(e) => onChange({ ...data, weight: e.target.value })}
            placeholder="70"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {language === 'ru' ? 'Возраст' : 'Age'}
          </label>
          <Input
            type="number"
            value={data.age}
            onChange={(e) => onChange({ ...data, age: e.target.value })}
            placeholder="25"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {language === 'ru' ? 'Пол' : 'Gender'}
          </label>
          <div className="flex gap-2">
            {[
              { value: 'male', label: language === 'ru' ? 'М' : 'M' },
              { value: 'female', label: language === 'ru' ? 'Ж' : 'F' },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => onChange({ ...data, gender: g.value })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  data.gender === g.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionStep({ data, onChange, language }: { data: SetupData; onChange: (v: SetupData) => void; language: 'en' | 'ru' }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {language === 'ru'
          ? 'Укажите ваши ежедневные цели по питанию. Можно изменить позже.'
          : 'Set your daily nutrition goals. You can change them later.'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {language === 'ru' ? 'Калории (ккал)' : 'Calories (kcal)'}
          </label>
          <Input
            type="number"
            value={data.dailyCalories}
            onChange={(e) => onChange({ ...data, dailyCalories: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {language === 'ru' ? 'Вода (мл)' : 'Water (ml)'}
          </label>
          <Input
            type="number"
            value={data.dailyWater}
            onChange={(e) => onChange({ ...data, dailyWater: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Белки (г)</label>
          <Input
            type="number"
            value={data.dailyProtein}
            onChange={(e) => onChange({ ...data, dailyProtein: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Жиры (г)</label>
          <Input
            type="number"
            value={data.dailyFat}
            onChange={(e) => onChange({ ...data, dailyFat: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Углеводы (г)</label>
          <Input
            type="number"
            value={data.dailyCarbs}
            onChange={(e) => onChange({ ...data, dailyCarbs: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function TrainingStep({ data, onChange, language }: { data: SetupData; onChange: (v: SetupData) => void; language: 'en' | 'ru' }) {
  const levels = [
    { value: 'beginner', labelRu: 'Новичок', labelEn: 'Beginner', descRu: 'Только начинаю', descEn: 'Just starting', icon: '🌱' },
    { value: 'intermediate', labelRu: 'Средний', labelEn: 'Intermediate', descRu: 'Тренируюсь регулярно', descEn: 'Training regularly', icon: '💪' },
    { value: 'advanced', labelRu: 'Продвинутый', labelEn: 'Advanced', descRu: 'Опытный атлет', descEn: 'Experienced athlete', icon: '🏆' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {language === 'ru'
          ? 'Выберите ваш текущий уровень физической подготовки.'
          : 'Select your current fitness level.'}
      </p>
      <div className="space-y-2">
        {levels.map((lvl) => (
          <button
            key={lvl.value}
            onClick={() => onChange({ ...data, fitnessLevel: lvl.value })}
            className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
              data.fitnessLevel === lvl.value
                ? 'border-primary bg-primary/5'
                : 'border-transparent bg-muted/50 hover:bg-muted'
            }`}
          >
            <span className="text-2xl">{lvl.icon}</span>
            <div className="text-left">
              <p className="text-sm font-medium">
                {language === 'ru' ? lvl.labelRu : lvl.labelEn}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'ru' ? lvl.descRu : lvl.descEn}
              </p>
            </div>
            {data.fitnessLevel === lvl.value && (
              <Check className="h-5 w-5 text-primary ml-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function HabitsStep({ data, onChange, language }: { data: SetupData; onChange: (v: SetupData) => void; language: 'en' | 'ru' }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {language === 'ru'
          ? 'Настройте целевые параметры сна и пробуждения.'
          : 'Set your target sleep and wake parameters.'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {language === 'ru' ? 'Сон (часов)' : 'Sleep (hours)'}
          </label>
          <Input
            type="number"
            step="0.5"
            value={data.targetSleepHours}
            onChange={(e) => onChange({ ...data, targetSleepHours: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {language === 'ru' ? 'Время подъёма' : 'Wake time'}
          </label>
          <input
            type="time"
            value={data.targetWakeTime}
            onChange={(e) => onChange({ ...data, targetWakeTime: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}

function FocusStep({ data, onToggle, language }: { data: SetupData; onToggle: (area: string) => void; language: 'en' | 'ru' }) {
  const areas = [
    { id: 'strength', icon: '⚔️', nameRu: 'Сила', nameEn: 'Strength', descRu: 'Тренировки, рекорды', descEn: 'Workouts, records' },
    { id: 'agility', icon: '⚡', nameRu: 'Ловкость', nameEn: 'Agility', descRu: 'Привычки, дисциплина', descEn: 'Habits, discipline' },
    { id: 'intelligence', icon: '🧠', nameRu: 'Интеллект', nameEn: 'Intelligence', descRu: 'Финансы, знания', descEn: 'Finance, knowledge' },
    { id: 'endurance', icon: '🛡️', nameRu: 'Выносливость', nameEn: 'Endurance', descRu: 'Питание, здоровье', descEn: 'Nutrition, health' },
    { id: 'charisma', icon: '⭐', nameRu: 'Харизма', nameEn: 'Charisma', descRu: 'Дневник, лента', descEn: 'Diary, social feed' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {language === 'ru'
          ? 'Выберите направления для развития. Это определяет ваш стартовый класс.'
          : 'Choose your development focus. This determines your starting class.'}
      </p>
      <div className="space-y-2">
        {areas.map((area) => {
          const isSelected = data.focusAreas.includes(area.id);
          return (
            <button
              key={area.id}
              onClick={() => onToggle(area.id)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              }`}
            >
              <span className="text-xl">{area.icon}</span>
              <div className="text-left flex-1">
                <p className="text-sm font-medium">
                  {language === 'ru' ? area.nameRu : area.nameEn}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {language === 'ru' ? area.descRu : area.descEn}
                </p>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
