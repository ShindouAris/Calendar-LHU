import { ScheduleItem } from '@/types/schedule';

export interface DuplicateScheduleGroup {
  key: string;
  schedules: ScheduleItem[];
  startTime: string;
  endTime: string;
  subject: string;
}

export interface ScheduleWithMetadata extends ScheduleItem {
  isDuplicate: boolean;
  duplicateGroup?: string;
  priority: number;
}

/**
 * Kiểm tra xem 2 lịch có overlap không
 */
const hasTimeOverlap = (schedule1: ScheduleItem, schedule2: ScheduleItem): boolean => {
  const start1 = new Date(schedule1.ThoiGianBD).getTime();
  const end1 = new Date(schedule1.ThoiGianKT).getTime();
  const start2 = new Date(schedule2.ThoiGianBD).getTime();
  const end2 = new Date(schedule2.ThoiGianKT).getTime();
  
  // Kiểm tra overlap: lịch 1 bắt đầu trong khoảng lịch 2 hoặc ngược lại
  return (start1 < end2 && end1 > start2);
};

/**
 * Kiểm tra xem 2 lịch có cùng thời gian bắt đầu không
 */
const hasSameStartTime = (schedule1: ScheduleItem, schedule2: ScheduleItem): boolean => {
  return schedule1.ThoiGianBD === schedule2.ThoiGianBD;
};

/**
 * Phát hiện các nhóm lịch trùng thời gian
 * Logic: Trùng nếu cùng thời gian bắt đầu HOẶC có overlap thời gian
 */
export const detectDuplicateSchedules = (schedules: ScheduleItem[]): DuplicateScheduleGroup[] => {
  const duplicateGroups: DuplicateScheduleGroup[] = [];
  const processed = new Set<number>();
  
  schedules.forEach((schedule, index) => {
    if (processed.has(schedule.ID)) return;
    
    const duplicateSchedules: ScheduleItem[] = [schedule];
    processed.add(schedule.ID);
    
    // Tìm các lịch trùng với lịch hiện tại
    schedules.forEach((otherSchedule, otherIndex) => {
      if (otherIndex === index || processed.has(otherSchedule.ID)) return;
      
      // Trùng nếu: cùng thời gian bắt đầu HOẶC có overlap thời gian
      const isDuplicate = hasSameStartTime(schedule, otherSchedule) || 
                         hasTimeOverlap(schedule, otherSchedule);
      
      if (isDuplicate) {
        duplicateSchedules.push(otherSchedule);
        processed.add(otherSchedule.ID);
      }
    });
    
    // Chỉ tạo group nếu có nhiều hơn 1 lịch
    if (duplicateSchedules.length > 1) {
      const key = `group_${duplicateSchedules.map(s => s.ID).sort().join('_')}`;
      duplicateGroups.push({
        key,
        schedules: duplicateSchedules,
        startTime: schedule.ThoiGianBD,
        endTime: schedule.ThoiGianKT,
        subject: schedule.TenMonHoc
      });
    }
  });
  
  return duplicateGroups;
};

/**
 * Tính độ ưu tiên của lịch học
 * Ưu tiên: Bình thường (0) > Dời lịch (1) > Báo nghỉ (2)
 */
export const calculateSchedulePriority = (schedule: ScheduleItem): number => {
  // Ưu tiên thấp hơn = hiển thị trước
  switch (schedule.TinhTrang) {
    case 0: return 1; // Bình thường - ưu tiên cao nhất
    case 1: return 2; // Dời lịch - ưu tiên trung bình
    case 2: return 3; // Báo nghỉ - ưu tiên thấp nhất
    default: return 4; // Không xác định
  }
};

/**
 * Sắp xếp lịch học theo độ ưu tiên
 */
export const prioritizeSchedules = (schedules: ScheduleItem[]): ScheduleItem[] => {
  return [...schedules].sort((a, b) => {
    const priorityA = calculateSchedulePriority(a);
    const priorityB = calculateSchedulePriority(b);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Nếu cùng độ ưu tiên, sắp xếp theo ID
    return a.ID - b.ID;
  });
};

/**
 * Thêm metadata cho lịch học để xử lý trùng lịch
 */
export const addScheduleMetadata = (schedules: ScheduleItem[]): ScheduleWithMetadata[] => {
  const duplicates = detectDuplicateSchedules(schedules);
  const duplicateKeys = new Set(duplicates.map(d => d.key));
  
  return schedules.map(schedule => {
    const key = `${schedule.ThoiGianBD}_${schedule.ThoiGianKT}_${schedule.TenMonHoc}`;
    const isDuplicate = duplicateKeys.has(key);
    
    return {
      ...schedule,
      isDuplicate,
      duplicateGroup: isDuplicate ? key : undefined,
      priority: calculateSchedulePriority(schedule)
    };
  });
};

/**
 * Lấy lịch học chính từ nhóm trùng (lịch có độ ưu tiên cao nhất)
 */
export const getPrimarySchedule = (schedules: ScheduleItem[]): ScheduleItem => {
  const prioritized = prioritizeSchedules(schedules);
  return prioritized[0];
};

/**
 * Kiểm tra xem có lịch trùng không
 */
export const hasDuplicateSchedules = (schedules: ScheduleItem[]): boolean => {
  return detectDuplicateSchedules(schedules).length > 0;
};

/**
 * Lấy thông tin trạng thái của nhóm lịch trùng
 */
export const getDuplicateGroupStatus = (schedules: ScheduleItem[]): {
  hasNormal: boolean;
  hasRescheduled: boolean;
  hasCancelled: boolean;
  statusText: string;
} => {
  const hasNormal = schedules.some(s => s.TinhTrang === 0);
  const hasRescheduled = schedules.some(s => s.TinhTrang === 1);
  const hasCancelled = schedules.some(s => s.TinhTrang === 2);
  
  let statusText = '';
  if (hasCancelled) {
    statusText = 'Có lịch báo nghỉ';
  } else if (hasRescheduled) {
    statusText = 'Có lịch dời';
  } else if (hasNormal) {
    statusText = 'Lịch bình thường';
  }
  
  return {
    hasNormal,
    hasRescheduled,
    hasCancelled,
    statusText
  };
};
