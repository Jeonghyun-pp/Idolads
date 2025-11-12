import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, locale: string = 'ko'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatCurrency(amount: number, currency: string = 'KRW', locale: string = 'ko-KR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDateRange(start: Date | string, end: Date | string, locale: string = 'ko'): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  });
  
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

