import type { ReminderFormValues } from './constants';

const WEEKDAY_MAP: Record<string, number> = {
  mon: 1, monday: 1, пн: 1, понедельник: 1,
  tue: 2, tuesday: 2, вт: 2, вторник: 2,
  wed: 3, wednesday: 3, ср: 3, среда: 3,
  thu: 4, thursday: 4, чт: 4, четверг: 4,
  fri: 5, friday: 5, пт: 5, пятница: 5,
  sat: 6, saturday: 6, сб: 6, суббота: 6,
  sun: 0, sunday: 0, вс: 0, воскресенье: 0,
};

export function formatISODate(date: Date) {
  return date.toISOString().split('T')[0];
}

export function getTodayISO() {
  return formatISODate(new Date());
}

export function defaultReminderForm(): ReminderFormValues {
  return { title: '', description: '', date: getTodayISO(), time: '', priority: 'normal', category: 'general' };
}

function nextWeekday(baseDate: Date, weekday: number) {
  const date = new Date(baseDate);
  const diff = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date;
}

function parseDateToken(token: string, now: Date) {
  if (token === 'today' || token === 'сегодня') return new Date(now);
  if (token === 'tomorrow' || token === 'завтра') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  if (WEEKDAY_MAP[token] !== undefined) {
    return nextWeekday(now, WEEKDAY_MAP[token]);
  }
  return null;
}

function normalizeTime(time: string) {
  const [rawHours, rawMinutes] = time.split(':');
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function parseNaturalInput(value: string, now: Date) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const fullPattern = /^(today|tomorrow|сегодня|завтра|[\p{L}]+)\s+(\d{1,2}:\d{2})\s+(.+)$/iu;
  const dateOnlyPattern = /^(today|tomorrow|сегодня|завтра|[\p{L}]+)\s+(.+)$/iu;

  const full = trimmed.match(fullPattern);
  if (full) {
    const [, tokenRaw, timeRaw, titleRaw] = full;
    const token = tokenRaw.toLowerCase();
    const time = normalizeTime(timeRaw);
    if (!time) return null;
    const parsedDate = parseDateToken(token, now);
    if (!parsedDate) return null;
    return { date: formatISODate(parsedDate), time, title: titleRaw.trim() };
  }

  const dateOnly = trimmed.match(dateOnlyPattern);
  if (dateOnly) {
    const [, tokenRaw, titleRaw] = dateOnly;
    const token = tokenRaw.toLowerCase();
    const parsedDate = parseDateToken(token, now);
    if (!parsedDate) return null;
    return { date: formatISODate(parsedDate), time: '', title: titleRaw.trim() };
  }

  return null;
}

function getWeekendDate(baseDate: Date) {
  const date = new Date(baseDate);
  const day = date.getDay();
  if (day === 6 || day === 0) return date;
  date.setDate(date.getDate() + (6 - day));
  return date;
}

export function getQuickDate(type: 'today' | 'tomorrow' | 'weekend', now = new Date()) {
  const target = type === 'today'
    ? now
    : type === 'tomorrow'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      : getWeekendDate(now);

  const defaultTime = type === 'today' ? '18:00' : type === 'tomorrow' ? '09:00' : '10:00';
  return { date: formatISODate(target), defaultTime };
}
