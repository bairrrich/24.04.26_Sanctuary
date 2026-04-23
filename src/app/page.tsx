'use client';

import { ThemeProvider } from 'next-themes';
import { AppShell } from '@/components/layout/app-shell';

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppShell />
    </ThemeProvider>
  );
}
