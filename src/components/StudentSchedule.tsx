import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, User, Clock, ArrowLeft, GraduationCap, BookOpen, MapPin } from 'lucide-react';

import { StudentIdInput } from './StudentIdInput';
import { ScheduleCard } from './ScheduleCard';
import { EmptySchedule } from './EmptySchedule';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { StatsCard } from './StatsCard';
import { Header } from './Header';

import { ApiService } from '@/services/apiService';
import { cacheService } from '@/services/cacheService';
import { ApiResponse } from '@/types/schedule';
import { formatDate, getNextClass, hasClassesInNext7Days, isWithinNext7Days, getRealtimeStatus } from '@/utils/dateUtils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export const StudentSchedule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<ApiResponse | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [page, setPage] = useState("home"); // "home" or "schedule"
  const [showEnded, setShowEnded] = useState(false); // mặc định không hiển thị lớp đã kết thúc

  useEffect(() => {
    cacheService.init();
  }, []);

  const fetchSchedule = useCallback(async (studentId: string, useCache = true) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check cache first
      if (useCache) {
        const cachedData = await cacheService.get(studentId);
        if (cachedData) {
          setScheduleData(cachedData);
          setCurrentStudentId(studentId);
          setLoading(false);
          return;
        }
      }

      // Make API request
      const apiRequest = {
        Ngay: new Date().toISOString(),
        PageIndex: 1,
        PageSize: 50,
        StudentID: studentId
      };

      const response = await ApiService.getSchedule(apiRequest);
      
      // Cache the response
      await cacheService.set(studentId, response);
      
      setScheduleData(response);
      setCurrentStudentId(studentId);
      if (!navigator.onLine) {
        toast({
          title: 'Đang ngoại tuyến',
          description: 'Đã đồng bộ dữ liệu khi có mạng trở lại.',
        });
      }
    } catch (err) {
      // Thử fallback sang dữ liệu đã lưu (kể cả khi đã hết hạn) để hỗ trợ offline
      try {
        const stale = await cacheService.getStale(studentId);
        if (stale) {
          setScheduleData(stale);
          setCurrentStudentId(studentId);
          toast({
            title: 'Hiển thị dữ liệu offline',
            description: 'Không thể kết nối máy chủ. Đang dùng dữ liệu đã lưu.',
          });
        } else {
          setError(err instanceof Error ? err.message : 'Không thể tải lịch học');
        }
      } catch {
        setError(err instanceof Error ? err.message : 'Không thể tải lịch học');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = () => {
    if (currentStudentId) {
      fetchSchedule(currentStudentId, false);
    }
  };

  const handleBackToInput = () => {
    setScheduleData(null);
    setCurrentStudentId('');
    setShowFullSchedule(false);
    setError(null);
    setPage("home");
  };

  const handleRefresh = () => {
    if (currentStudentId) {
      fetchSchedule(currentStudentId, false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Button
              onClick={handleBackToInput}
              variant="ghost"
              className="mb-4 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="min-h-screen py-6 sm:py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3 sm:mb-4">
              Lịch Học Sinh Viên - LHU
            </h1>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Tra cứu lịch học nhanh chóng
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <StudentIdInput onSubmit={fetchSchedule} loading={loading} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleChangeView = () => {
    if (page === "schedule") {
      setPage("home");
      setShowFullSchedule(false);
    } else {
      setPage("schedule");
      setShowFullSchedule(true);
      return;
    }
  }


  const studentInfo = scheduleData.data[0]?.[0];
  const weekInfo = scheduleData.data[1]?.[0];
  const schedules = scheduleData.data[2] || [];

  const nextClass = getNextClass(schedules);
  const hasUpcomingClasses = hasClassesInNext7Days(schedules);

  const baseSchedules = showFullSchedule 
    ? schedules 
    : schedules.filter(schedule => isWithinNext7Days(schedule.ThoiGianBD));

  const displaySchedules = baseSchedules.filter(s => {
    if (showEnded) return true;
    const status = getRealtimeStatus(s.ThoiGianBD, s.ThoiGianKT);
    return status !== 3; // ẩn các lớp đã kết thúc khi toggle OFF
  });

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Header
          showBack={true}
          showRefresh={true}
          onBack={handleBackToInput}
          onRefresh={handleRefresh}
          page={page}
          onPageChange={handleChangeView}
          title="Lịch Học Sinh Viên - LHU"
        />

        {/* Student Info Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div> */}
          <CardHeader className="relative pb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-white mb-2">
                    {studentInfo?.HoTen || 'Không có thông tin'}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      Mã SV: <span className="font-mono font-semibold">{currentStudentId}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>Tuần học hiện tại</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {weekInfo?.TuanBD && formatDate(weekInfo.TuanBD)} - {weekInfo?.TuanKT && formatDate(weekInfo.TuanKT)}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <StatsCard
                title="Tổng số tiết"
                value={schedules.length}
                icon={BookOpen}
                color="blue"
                description="Tiết học trong tuần học"
              />
              
              {nextClass && (
                <StatsCard
                  title="Tiết tiếp theo"
                  value={formatDate(nextClass.ThoiGianBD)}
                  icon={Clock}
                  color="green"
                  description="Thời gian bắt đầu tiết học"
                />
              )}
              
              <StatsCard
                title="Trạng thái"
                value={hasUpcomingClasses ? "Có lịch" : "Không có lịch"}
                icon={CalendarDays}
                color={hasUpcomingClasses ? "purple" : "orange"}
                description={hasUpcomingClasses ? "Trong 7 ngày tới" : "Trong 7 ngày tới"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Display */}
        {!hasUpcomingClasses && !showFullSchedule ? (
          <EmptySchedule onViewFullSchedule={handleChangeView} />
        ) : (
          <>
            {/* Toggle View Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3 sm:gap-4 flex-wrap sm:flex-nowrap min-w-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {showFullSchedule ? 'Lịch học đầy đủ' : 'Lịch học 7 ngày tới'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {displaySchedules.length} tiết được tìm thấy
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap gap-y-2">
                <Button
                  onClick={handleChangeView}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors shrink-0 min-w-[180px] sm:min-w-[200px]"
                >
                  {showFullSchedule ? 'Xem lịch 7 ngày tới' : 'Xem lịch đầy đủ'}
                </Button>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch id="toggle-ended" checked={showEnded} onCheckedChange={setShowEnded} />
                <Label htmlFor="toggle-ended" className="whitespace-nowrap">Hiển thị lớp đã kết thúc</Label>
              </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-4 sm:space-y-6">
              {displaySchedules.length === 0 ? (
                <Card className="text-center py-16 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">Không có lịch học nào</p>
                  </CardContent>
                </Card>
              ) : (
                displaySchedules.map((schedule, index) => (
                  <ScheduleCard
                    key={schedule.ID || index}
                    schedule={schedule}
                    isNext={nextClass?.ID === schedule.ID}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};