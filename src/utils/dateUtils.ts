// Date utility functions

export const getCurrentDate = (): Date => {
  return new Date();
};

export const getCurrentTimestamp = (): number => {
  return Date.now();
};

export const getCurrentDateString = (): string => {
  return new Date().toISOString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

export const subtractMonths = (date: Date, months: number): Date => {
  return addMonths(date, -months);
};

export const subtractYears = (date: Date, years: number): Date => {
  return addYears(date, -years);
};

export const getStartOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const getStartOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const getStartOfYear = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfYear = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = subtractDays(new Date(), 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = addDays(new Date(), 1);
  return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

export const isSameYear = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear();
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const getMonthsBetween = (startDate: Date, endDate: Date): number => {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 +
         (endDate.getMonth() - startDate.getMonth());
};

export const getYearsBetween = (startDate: Date, endDate: Date): number => {
  return endDate.getFullYear() - startDate.getFullYear();
};

export const getAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const getQuarter = (date: Date): number => {
  return Math.ceil((date.getMonth() + 1) / 3);
};

export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};

export const parseDateFromAPI = (dateString: string): Date => {
  return new Date(dateString);
}; 