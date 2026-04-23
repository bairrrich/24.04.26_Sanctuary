'use client';

import { motion } from 'framer-motion';
import { Droplets, Scale, Ruler, Coins, CalendarDays } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';
import { CURRENCY_SYMBOLS } from '@/lib/constants';
import type { WaterUnit, WeightUnit, DistanceUnit, CurrencyCode, FirstDayOfWeek } from '@/types';

interface UnitOption<T extends string> {
  value: T;
  labelKey: string;
}

export function UnitsSettings() {
  const language = useSettingsStore((s) => s.language);
  const waterUnit = useSettingsStore((s) => s.waterUnit);
  const weightUnit = useSettingsStore((s) => s.weightUnit);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const currency = useSettingsStore((s) => s.currency);
  const firstDayOfWeek = useSettingsStore((s) => s.firstDayOfWeek);
  const setWaterUnit = useSettingsStore((s) => s.setWaterUnit);
  const setWeightUnit = useSettingsStore((s) => s.setWeightUnit);
  const setDistanceUnit = useSettingsStore((s) => s.setDistanceUnit);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const setFirstDayOfWeek = useSettingsStore((s) => s.setFirstDayOfWeek);

  const waterUnits: UnitOption<WaterUnit>[] = [
    { value: 'ml', labelKey: 'units.ml' },
    { value: 'fl_oz', labelKey: 'units.fl_oz' },
  ];

  const weightUnits: UnitOption<WeightUnit>[] = [
    { value: 'kg', labelKey: 'units.kg' },
    { value: 'lbs', labelKey: 'units.lbs' },
  ];

  const distanceUnits: UnitOption<DistanceUnit>[] = [
    { value: 'km', labelKey: 'units.km' },
    { value: 'mi', labelKey: 'units.mi' },
  ];

  const currencies: UnitOption<CurrencyCode>[] = [
    { value: 'RUB', labelKey: 'units.RUB' },
    { value: 'USD', labelKey: 'units.USD' },
    { value: 'EUR', labelKey: 'units.EUR' },
    { value: 'GBP', labelKey: 'units.GBP' },
    { value: 'JPY', labelKey: 'units.JPY' },
    { value: 'CNY', labelKey: 'units.CNY' },
  ];

  const weekStarts: UnitOption<FirstDayOfWeek>[] = [
    { value: 'monday', labelKey: 'settings.monday' },
    { value: 'sunday', labelKey: 'settings.sunday' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">{t(language, 'settings.units')}</h3>
        <p className="text-xs text-muted-foreground">
          {t(language, 'settings.unitsDescription')}
        </p>
      </div>

      <UnitSection
        icon={Droplets}
        title={t(language, 'settings.waterUnit')}
        options={waterUnits}
        value={waterUnit}
        onChange={setWaterUnit}
        accentColor="oklch(0.695 0.152 195)"
        language={language}
      />

      <UnitSection
        icon={Scale}
        title={t(language, 'settings.weightUnit')}
        options={weightUnits}
        value={weightUnit}
        onChange={setWeightUnit}
        accentColor="oklch(0.645 0.246 16.439)"
        language={language}
      />

      <UnitSection
        icon={Ruler}
        title={t(language, 'settings.distanceUnit')}
        options={distanceUnits}
        value={distanceUnit}
        onChange={setDistanceUnit}
        accentColor="oklch(0.657 0.145 175.5)"
        language={language}
      />

      <UnitSection
        icon={Coins}
        title={t(language, 'settings.currency')}
        options={currencies}
        value={currency}
        onChange={setCurrency}
        accentColor="oklch(0.696 0.17 162.48)"
        language={language}
      />

      <UnitSection
        icon={CalendarDays}
        title={t(language, 'settings.firstDayOfWeek')}
        options={weekStarts}
        value={firstDayOfWeek}
        onChange={setFirstDayOfWeek}
        accentColor="oklch(0.551 0.027 240)"
        language={language}
      />
    </div>
  );
}

interface UnitSectionProps<T extends string> {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  options: UnitOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accentColor?: string;
  language: 'en' | 'ru';
}

function UnitSection<T extends string>({
  icon: Icon,
  title,
  options,
  value,
  onChange,
  accentColor,
  language,
}: UnitSectionProps<T>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={accentColor ? { backgroundColor: `${accentColor}15` } : undefined}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accentColor }} />
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>

      <div className="flex flex-wrap gap-2 ml-9">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(option.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
              style={isActive && accentColor ? {
                borderColor: accentColor,
                backgroundColor: `${accentColor}10`,
                color: accentColor,
              } : undefined}
            >
              {t(language, option.labelKey)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
