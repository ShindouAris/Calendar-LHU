import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/authService';
import {AuthStorage, MarkApiResponse, type MonHocAPI, type DiemThanhPhanItem} from '@/types/user';
import toast from 'react-hot-toast';
import { PiChalkboardSimpleDuotone, PiDiceThreeDuotone } from "react-icons/pi";
import { Input } from '@/components/ui/input';

interface MarkPageProps {
  onBackToSchedule?: () => void;
}

export const MarkPage: React.FC<MarkPageProps> = ({ onBackToSchedule }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marks, setMarks] = useState<MarkApiResponse | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [tinchi, setTinchi] = useState<number>(0)
  const [studentIdQuery, setStudentIdQuery] = useState<string>("")
  // const [is_maintenance, setIsMaintenance] = useState<boolean>(false)
  const user = AuthStorage.getUser();

  const formatScore = (value: string | number | null | undefined, fixed: number = 2) => {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
    if (Number.isNaN(num)) return String(value) || '—';
    return num.toFixed(fixed);
  };

  const safeText = (value: string | null | undefined) => {
    if (!value || String(value).trim() === '') return '—';
    return value;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
          const user = AuthStorage.getUser()
          if (!user?.UserID) {
            throw new Error("Chưa đăng nhập");
          }
        const data = await authService.getMark(user.UserID);
        setMarks(data ?? null);
      } catch (e) {
        if (e instanceof Error && e.message === "Phiên đăng nhập không hợp lệ!") {
          toast.error(e.message)
          AuthStorage.deleteUser()
        } else {
          setError(e instanceof Error ? e.message : 'Không thể tải điểm');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.UserID]);

  const getUserMark = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!uid) {
        throw new Error("Mã sinh viên không hợp lệ");
      }
      const data = await authService.getMark(uid);
      setMarks(data ?? null);
    } catch (e) {
      if (e instanceof Error && e.message === "Phiên đăng nhập không hợp lệ!") {
        toast.error(e.message)
      } else {
        setError(e instanceof Error ? e.message : 'Không thể tải điểm');
      }
    } finally {
      setLoading(false);
    }
  };

  const semesters = useMemo(() => {
    if (!marks?.data) return {} as Record<number, MonHocAPI[]>;
    return marks.data.reduce((acc: Record<number, MonHocAPI[]>, item) => {
      const hk = Number(item.HocKy || 0);
      if (!acc[hk]) acc[hk] = [];
      acc[hk].push(item);
      return acc;
    }, {} as Record<number, MonHocAPI[]>);
  }, [marks]);

  useEffect(() => {
    const keys = Object.keys(semesters).map((k) => Number(k)).sort((a, b) => a - b);
    if (keys.length > 0) {
      setSelectedSemester((current) => (current !== null && keys.includes(current) ? current : keys[0]));
    } else {
      setSelectedSemester(null);
    }
  }, [semesters]);

  useEffect(() => {
    if (!selectedSemester) {
      setTinchi(0);
      return;
    }
    const hocki = semesters[selectedSemester] || [];
    const tin_chi = hocki.reduce((sum, mh) => sum + Number(mh.HeSo || 0), 0);
    setTinchi(tin_chi);
  }, [selectedSemester, semesters])

  const totalAccumulatedCredits = useMemo(() => {
    if (!marks?.data) return 0;
    return marks.data.reduce((sum, mh) => sum + Number(mh.HeSo || 0), 0);
  }, [marks]);

  const renderThanhPhan = (raw: string | null) => {
    if (!raw) return '—';
    try {
      const items = JSON.parse(raw) as DiemThanhPhanItem[];
      if (!Array.isArray(items) || items.length === 0) return '—';
      return (
        <div className="space-y-1">
          {items.map((it) => (
            <div key={it.STT} className="flex items-center justify-between gap-2">
              <span className="truncate">{it.HinhThuc}</span>
              <span className="ml-auto font-medium">{formatScore(it.Diem)}</span>
              <span className="text-gray-500">({formatScore(it.ptDiem, 0)}%)</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return raw;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="h-6 w-6" /> Kết quả học tập
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <form
            className="flex w-full sm:w-auto items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading && studentIdQuery.trim()) {
                getUserMark(studentIdQuery.trim());
              }
            }}
          >
            <Input
              placeholder="Nhập mã SV..."
              className="w-full sm:w-56"
              value={studentIdQuery}
              onChange={(e) => setStudentIdQuery(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !studentIdQuery.trim()} className="shrink-0">
              Xem
            </Button>
          </form>
          {!loading && !error && marks && (
            <select
              className="w-full sm:w-64 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSemester ?? ''}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
            {
              ...(undefined as any)
            }
            >
              {Object.keys(semesters)
                .map((k) => Number(k))
                .sort((a, b) => a - b)
                .map((hk) => (
                  <option key={hk} value={hk}>
                   Học kỳ {hk}
                  </option>
                ))}
            </select>
          )}
          {onBackToSchedule && (
            <Button variant="outline" onClick={onBackToSchedule} className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại lịch học
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-8 text-center">Đang tải dữ liệu điểm…</CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-8 text-center text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && marks && (
        <>
          <Card className="overflow-hidden border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <img
                  src={marks.StudentImage}
                  alt={marks.HoTen}
                  className="w-28 h-28 rounded-md object-cover border border-gray-200 dark:border-gray-700"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div>
                    <div className="text-sm text-gray-500">Họ tên</div>
                    <div className="font-medium">{marks.HoTen}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Mã SV</div>
                    <div className="font-medium">{marks.StudentID}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Lớp</div>
                    <div className="font-medium">{marks.LopID}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ngày sinh</div>
                    <div className="font-medium">{marks.NgaySinh}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tình trạng</div>
                    <div className="font-medium">{marks.TinhTrang}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Điểm TB</div>
                    <div className="font-medium">{formatScore(marks.DiemTB)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedSemester !== null && (
            <div className="space-y-6">
              {(() => {
                const hocKy = selectedSemester as number;
                const monHocs = semesters[hocKy] ?? [];
                return (
                  <Card key={hocKy} className="overflow-hidden border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" /> Học kỳ {hocKy}
                        <PiChalkboardSimpleDuotone className="h-5 w-5 text-green-600" /> Số tín chỉ trong kì {tinchi}
                        <PiDiceThreeDuotone className="h-5 w-5 text-yellow-600" /> Số tín chỉ tích luỹ {totalAccumulatedCredits}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse text-sm sm:text-base table-auto">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-center">
                              <th className="px-4 py-2">Mã MH</th>
                              <th className="px-4 py-2">Tên môn học</th>
                              <th className="px-4 py-2">Tín chỉ</th>
                              <th className="px-4 py-2">Điểm TP</th>
                              <th className="px-4 py-2">Điểm TB</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(monHocs) && monHocs.length > 0 ? (
                              monHocs.map((mh: MonHocAPI, idx: number) => (
                                <tr
                                  key={mh.MonHocID || `${hocKy}-${idx}`}
                                  className="border-b border-gray-200 dark:border-gray-700"
                                >
                                  <td className="px-4 py-2 font-mono break-words">{String(mh.MonHocID)}</td>
                                  <td className="px-4 py-2 break-words">{safeText(mh.TenMH)}</td>
                                  <td className="px-4 py-2">{formatScore(mh.HeSo, 0)}</td>
                                  <td className="px-4 py-2">{renderThanhPhan(mh.DiemThanhPhan)}</td>
                                  <td className="px-4 py-2 font-semibold">{formatScore(mh.DiemTBMon)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                                  Không có dữ liệu môn học cho học kỳ này
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          )}
        </>
      )}

      {!loading && !error && !marks && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-8 text-center text-gray-500">
            Không có dữ liệu điểm
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarkPage;
