import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Building, 
  ExternalLink,
  Video,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock3
} from 'lucide-react';
import { ScheduleItem } from '@/types/schedule';
import { formatTime, formatDate, getDayName, getRealtimeStatus, StartAfter } from '@/utils/dateUtils';

interface ScheduleCardProps {
  schedule: ScheduleItem;
  isNext?: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, isNext = false }) => {
  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1:
        return {
          color: 'bg-gradient-to-r from-green-500 to-emerald-600',
          text: 'Đang diễn ra',
          icon: CheckCircle2,
          textColor: 'text-green-700 dark:text-green-300'
        };
      case 2:
        return {
          color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          text: 'Sắp diễn ra',
          icon: Clock3,
          textColor: 'text-blue-700 dark:text-blue-300'
        };
      case 3:
        return {
          color: 'bg-gradient-to-r from-gray-500 to-slate-600',
          text: 'Đã kết thúc',
          icon: AlertCircle,
          textColor: 'text-gray-700 dark:text-gray-300'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-red-300 to-pink-300',
          text: 'Chưa bắt đầu',
          icon: AlertCircle,
          textColor: 'text-gray-700 dark:text-gray-300'
        };
    }
  };

  function minutesToHourMinute(minutes: number): string {
    const h = Math.floor(minutes / 60); // chia lấy giờ
    const m = minutes % 60; // còn dư là phút
    return `${h} giờ ${m > 0 ? `${m} phút` : ''}`;
  }
  // Ưu tiên trạng thái tính theo thời gian thực để tránh sai do API cũ
  const realtimeStatus = getRealtimeStatus(schedule.ThoiGianBD, schedule.ThoiGianKT);
  const effectiveStatus = realtimeStatus !== undefined && realtimeStatus !== null
    ? realtimeStatus
    : schedule.TinhTrang;
  const statusConfig = getStatusConfig(effectiveStatus);
  const StatusIcon = statusConfig.icon;

  const getStudyPlace = (schedule: ScheduleItem) => {
    if (schedule.TenCoSo.toLocaleLowerCase().includes("khác")) {
      return "Khác";
    }
    if (schedule.TenCoSo.toLocaleLowerCase().includes("online")) {
      return "Học Online Zoom";
    }

    return schedule.TenCoSo.replace("Cơ sở ", "").trim();
  }

  return (
    <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 overflow-hidden ${
      isNext 
        ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 shadow-blue-200 dark:shadow-blue-900/50' 
        : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800'
    }`}>
      {/* Next Class Banner */}
      {isNext && (
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 animate-pulse" />
            Tiết học tiếp theo - Bắt đầu sau: {StartAfter(schedule.ThoiGianBD)}
          </div>
        </div>
      )}
      
      <CardContent className="p-5 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-5 sm:mb-6 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold mb-2.5 sm:mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-violet-500 transition-all truncate">
              {schedule.TenMonHoc}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2 bg-pink-200 dark:bg-blue-950/50 px-2.5 sm:px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{getDayName(schedule.Thu)}</span>
              </div>
              <span className="hidden sm:inline text-gray-400">•</span>
              <span className="font-medium">{formatDate(schedule.ThoiGianBD)}</span>
            </div>
          </div>
          
          <Badge 
            className={`${statusConfig.color} text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap`}
          >
            <StatusIcon className="h-4 w-4 mr-2" />
            {statusConfig.text}
          </Badge>
        </div>

        {/* Schedule Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl min-h-[60px] sm:min-h-[72px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Thời gian</div>
                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  {formatTime(schedule.ThoiGianBD)} - {formatTime(schedule.ThoiGianKT)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 rounded-xl min-h-[60px] sm:min-h-[72px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Phòng học</div>
                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{schedule.TenPhong}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl min-h-[60px] sm:min-h-[72px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Giảng viên</div>
                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{schedule.GiaoVien}</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl min-h-[60px] sm:min-h-[72px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Nhóm học</div>
              <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{schedule.TenNhom}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl min-h-[60px] sm:min-h-[72px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Cơ sở</div>
                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{getStudyPlace(schedule)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 rounded-xl min-h-[60px] sm:min-h-[72px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Thời lượng tiết</div>
                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{minutesToHourMinute(schedule.SoTietBuoi)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-5 sm:pt-6 border-t border-gray-100 dark:border-gray-700">
          {schedule.GoogleMap && schedule.GoogleMap !== null && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open(schedule.GoogleMap, '_blank')}
              className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group w-full sm:w-auto"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Xem bản đồ</span>
              <ExternalLink className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}

          {schedule.OnlineLink && schedule.OnlineLink !== null && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open(schedule.OnlineLink, '_blank')}
              className="flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 group w-full sm:w-auto"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span>Tham gia online</span>
              <ExternalLink className="h-4 w-4 text-green-500 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};