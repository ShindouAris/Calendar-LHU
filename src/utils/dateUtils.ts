import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi });
  } catch {
    return 'Không xác định';
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm');
  } catch {
    return '';
  }
};

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: vi });
  } catch {
    return '';
  }
};

export const getDayName = (dayNumber: number): string => {
  return `Thứ ${dayNumber}`;
};

export const isWithinNext7Days = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const sevenDaysLater = addDays(now, 7);
    
    return isAfter(date, now) && isBefore(date, sevenDaysLater);
  } catch {
    return false;
  }
};

export const getNextClass = (schedules: any[]): any | null => {
  const now = new Date();
  
  const upcomingClasses = schedules
    .filter(schedule => {
      try {
        const classDate = parseISO(schedule.ThoiGianBD);
        return isAfter(classDate, now);
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      const dateA = parseISO(a.ThoiGianBD);
      const dateB = parseISO(b.ThoiGianBD);
      return dateA.getTime() - dateB.getTime();
    });

  return upcomingClasses.length > 0 ? upcomingClasses[0] : null;
};

export const hasClassesInNext7Days = (schedules: any[]): boolean => {
  return schedules.some((schedule: any) => isWithinNext7Days(schedule.ThoiGianBD));
};