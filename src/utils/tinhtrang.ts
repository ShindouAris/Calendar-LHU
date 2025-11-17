export type TinhTrangType = 'normal' | 'menu' | 'cancelled' | 'holiday' | 'special';

export interface TinhTrangInfo {
  type: TinhTrangType;
  flagText: string | null;
  badgeClassName: string | null;
}

const MENU_STATUSES = new Set<number>([4, 5, 10]);
const CANCELLED_STATUSES = new Set<number>([1, 2]);
const HOLIDAY_STATUS = 6;

const DEFAULT_CANCELLED_BADGE =
  'bg-gradient-to-r from-rose-100 to-red-100 text-rose-900 dark:from-rose-900/40 dark:to-red-900/30 dark:text-rose-100 border border-rose-200/70 dark:border-rose-800';
const DEFAULT_HOLIDAY_BADGE =
  'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-900 dark:from-emerald-900/40 dark:to-green-900/30 dark:text-emerald-100 border border-emerald-200/70 dark:border-emerald-800';
const DEFAULT_SPECIAL_BADGE =
  'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 dark:from-amber-900/40 dark:to-orange-900/30 dark:text-amber-100 border border-amber-200/70 dark:border-amber-800';

export const getTinhTrangInfo = (status: number): TinhTrangInfo => {
  if (status === HOLIDAY_STATUS) {
    return {
      type: 'holiday',
      flagText: 'Nghỉ lễ',
      badgeClassName: DEFAULT_HOLIDAY_BADGE,
    };
  }

  if (CANCELLED_STATUSES.has(status)) {
    return {
      type: 'cancelled',
      flagText: 'Báo nghỉ',
      badgeClassName: DEFAULT_CANCELLED_BADGE,
    };
  }

  if (status === 0) {
    return {
      type: 'normal',
      flagText: null,
      badgeClassName: null,
    };
  }

  if (MENU_STATUSES.has(status)) {
    return {
      type: 'menu',
      flagText: null,
      badgeClassName: null,
    };
  }

  return {
    type: 'special',
    flagText: 'Báo nghỉ',
    badgeClassName: DEFAULT_SPECIAL_BADGE,
  };
};

export const isTinhTrangCancelled = (status: number): boolean => {
  const info = getTinhTrangInfo(status);
  return info.type === 'cancelled' || info.type === 'holiday' || info.type === 'special';
};

