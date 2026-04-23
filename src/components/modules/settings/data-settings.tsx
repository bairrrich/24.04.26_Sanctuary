'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, Download, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function DataSettings() {
  const language = useSettingsStore((s) => s.language);
  const resetToDefaults = useSettingsStore((s) => s.resetToDefaults);
  const [isFilling, setIsFilling] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleFillTestData = async () => {
    setIsFilling(true);
    try {
      const res = await fetch('/api/settings/fill-test-data', { method: 'POST' });
      if (res.ok) {
        toast.success(language === 'ru' ? 'Тестовые данные добавлены' : 'Test data added');
      }
    } catch {
      toast.error(language === 'ru' ? 'Ошибка при заполнении' : 'Error filling data');
    } finally {
      setIsFilling(false);
    }
  };

  const handleClearTestData = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/settings/clear-test-data', { method: 'POST' });
      if (res.ok) {
        toast.success(language === 'ru' ? 'Тестовые данные удалены' : 'Test data cleared');
      }
    } catch {
      toast.error(language === 'ru' ? 'Ошибка при очистке' : 'Error clearing data');
    } finally {
      setIsClearing(false);
    }
  };

  const handleResetSettings = () => {
    resetToDefaults();
    toast.success(language === 'ru' ? 'Настройки сброшены' : 'Settings reset');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">{t(language, 'settings.data')}</h3>
        <p className="text-xs text-muted-foreground">
          {t(language, 'settings.dataDescription')}
        </p>
      </div>

      {/* Fill Test Data */}
      <DataCard
        icon={Database}
        title={t(language, 'settings.fillTestData')}
        description={t(language, 'settings.fillTestDataDescription')}
        accentColor="oklch(0.696 0.17 162.48)"
      >
        <Button
          onClick={handleFillTestData}
          disabled={isFilling}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Database className="h-3.5 w-3.5" />
          {isFilling
            ? (language === 'ru' ? 'Заполнение...' : 'Filling...')
            : t(language, 'settings.fillTestData')}
        </Button>
      </DataCard>

      {/* Clear Test Data */}
      <DataCard
        icon={Trash2}
        title={t(language, 'settings.clearTestData')}
        description={t(language, 'settings.clearTestDataDescription')}
        accentColor="oklch(0.577 0.245 27.325)"
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isClearing}
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isClearing
                ? (language === 'ru' ? 'Очистка...' : 'Clearing...')
                : t(language, 'settings.clearTestData')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {t(language, 'settings.confirmDeletion')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(language, 'settings.deletionWarning')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t(language, 'common.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleClearTestData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t(language, 'common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DataCard>

      {/* Reset Settings */}
      <DataCard
        icon={Download}
        title={t(language, 'settings.resetSettings')}
        description={t(language, 'settings.resetSettingsDescription')}
        accentColor="oklch(0.551 0.027 240)"
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-3.5 w-3.5" />
              {t(language, 'settings.resetSettings')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t(language, 'settings.resetConfirm')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(language, 'settings.resetWarning')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t(language, 'common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetSettings}>
                {t(language, 'common.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DataCard>
    </div>
  );
}

interface DataCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accentColor?: string;
  children: React.ReactNode;
}

function DataCard({ icon: Icon, title, description, accentColor, children }: DataCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={accentColor ? { backgroundColor: `${accentColor}15` } : undefined}
        >
          <Icon className="h-4 w-4" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="ml-12">{children}</div>
    </div>
  );
}
