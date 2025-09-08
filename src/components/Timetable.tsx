import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScheduleItem } from '@/types/schedule';
import { getRealtimeStatus } from '@/utils/dateUtils';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Timetable.css';

const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TimetableProps {
  schedules: ScheduleItem[];
  studentName?: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: ScheduleItem;
}

const getStatusColor = (status: number, is_cancelled: boolean) => {
  if (is_cancelled) {
    return 'bg-red-500'
  }
  switch (status) {
    case 1: return 'bg-green-500'; // Đang diễn ra
    case 2: return 'bg-yellow-500'; // Sắp diễn ra
    case 3: return 'bg-gray-400'; // Đã kết thúc
    default: return 'bg-blue-500';
  }
};

const getStatusText = (status: number, is_cancelled: boolean) => {
  if (is_cancelled) {
    return 'Báo Nghỉ'
  }
  switch (status) {
    case 1: return 'Đang diễn ra';
    case 2: return 'Sắp diễn ra';
    case 3: return 'Đã kết thúc';
    case 0: return "Chưa bắt đầu"
    default: return 'Không xác định';
  }
};



export const Timetable: React.FC<TimetableProps> = ({ schedules, studentName }) => {
  const events: CalendarEvent[] = useMemo(() => {
    return schedules.map(schedule => {
      const startDate = new Date(schedule.ThoiGianBD);
      const endDate = new Date(schedule.ThoiGianKT);
      
      return {
        id: schedule.ID,
        title: `${schedule.TenMonHoc} - ${schedule.TenNhom}`,
        start: startDate,
        end: endDate,
        resource: schedule,
      };
    });
  }, [schedules]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = getRealtimeStatus(event.start.toISOString(), event.end.toISOString());
    const is_cancelled = event.resource.TinhTrang !== 0;
    const color = getStatusColor(status, is_cancelled);
    
    return {
      style: {
        backgroundColor: color === 'bg-green-500' ? '#10b981' : 
                       color === 'bg-yellow-500' ? '#f59e0b' : 
                       color === 'bg-gray-400' ? '#9ca3af' : color==="bg-red-500" ? '#E62727' : '#3b82f6',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
      }
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const status = getRealtimeStatus(event.start.toISOString(), event.end.toISOString());
    const is_cancelled = event.resource.TinhTrang !== 0;
    const statusText = getStatusText(status, is_cancelled);
    
    return (
      <div className="p-1 text-xs">
        <div className="font-semibold mb-1 truncate text-white">{event.title}</div>
        <div className="text-xs opacity-90 text-white">
          <div className="truncate">{event.resource.TenPhong || event.resource.OnlineLink || 'Không có địa điểm'}</div>
          <div className="truncate">{event.resource.GiaoVien}</div>
          <div className="mt-1">
            <Badge 
              variant="secondary" 
              className={`text-xs px-1 py-0.5 ${getStatusColor(status, is_cancelled)} text-white border-0`}
            >
              {statusText}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const ToolbarComponent = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToPrev = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const viewNames = {
      month: 'Tháng',
      week: 'Tuần',
      day: 'Ngày',
      agenda: 'Danh sách',
    };

    return (
      <div className="flex flex-col gap-3 mb-4">
        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Hôm nay
            </button>
            <button
              onClick={goToPrev}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              ←
            </button>
            <button
              onClick={goToNext}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              →
            </button>
          </div>
          
          <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-center">
            {toolbar.label}
          </div>
        </div>
        
        {/* View Controls */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            {Object.entries(viewNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => toolbar.onView(key)}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                  toolbar.view === key
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (schedules.length === 0) {
    return (
      <Card className="text-center py-16 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent>
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Không có lịch học nào để hiển thị</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thống kê nhanh */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">
            Thống kê lịch học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{schedules.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tổng số tiết</div>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {schedules.filter(s => getRealtimeStatus(s.ThoiGianBD, s.ThoiGianKT) === 2).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sắp diễn ra</div>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {schedules.filter(s => getRealtimeStatus(s.ThoiGianBD, s.ThoiGianKT) === 1).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Đang diễn ra</div>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-600">
                {schedules.filter(s => getRealtimeStatus(s.ThoiGianBD, s.ThoiGianKT) === 3).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Đã kết thúc</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">
            Lịch học {studentName ? `của ${studentName}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="week"
              step={60}
              timeslots={1}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent,
                toolbar: ToolbarComponent,
              }}
              messages={{
                next: "Tiếp",
                previous: "Trước",
                today: "Hôm nay",
                month: "Tháng",
                week: "Tuần",
                day: "Ngày",
                agenda: "Danh sách",
                date: "Ngày",
                time: "Thời gian",
                event: "Sự kiện",
                noEventsInRange: "Không có sự kiện nào trong khoảng thời gian này.",
                showMore: (total: number) => `+${total} sự kiện khác`,
              }}
              culture="vi"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
