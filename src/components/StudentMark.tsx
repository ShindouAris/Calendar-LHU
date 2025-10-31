import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';
// import { authService } from '@/services/authService';
import { AuthStorage, type HocKyGroup, type MonHoc } from '@/types/user';
// import toast from 'react-hot-toast';
import { PiChalkboardSimpleDuotone, PiDiceThreeDuotone } from "react-icons/pi";

interface MarkPageProps {
  onBackToSchedule?: () => void;
}

export const MarkPage: React.FC<MarkPageProps> = ({ onBackToSchedule }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marks, setMarks] = useState<HocKyGroup | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [tinchi, setTinchi] = useState<number>(0)
  const [is_maintenance, setIsMaintenance] = useState<boolean>(false)
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
    // const load = async () => {
    //   setLoading(true);
    //   setError(null);
    //   try {
    //     const data = await authService.getMark();
    //     if (data?.reason) {
    //       setError(data.reason)
    //     }
    //     setMarks(data ?? null);
    //   } catch (e) {
    //     if (e instanceof Error && e.message === "Phiên đăng nhập không hợp lệ!") {
    //       toast.error(e.message)
    //       AuthStorage.deleteUser()
    //     } else {
    //       setError(e instanceof Error ? e.message : 'Không thể tải điểm');
    //     }
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    setIsMaintenance(true);
    setError("Đang bảo trì trang mark");
    setLoading(false);
    setMarks(null)

    // load();
  }, [user?.UserID]);

  useEffect(() => {
    if (!marks || !marks.semesters) {
      setSelectedSemester(null);
      return;
    }
    const keys = Object.keys(marks.semesters).sort((a, b) => Number(a) - Number(b));
    if (keys.length > 0) {
      setSelectedSemester((current) => (current && keys.includes(current) ? current : keys[0]));
    } else {
      setSelectedSemester(null);
    }
  }, [marks]);

  useEffect(() => {
    if (!marks || !marks.semesters) {
      setTinchi(0)
    }
      const hocki = marks?.semesters[selectedSemester || 1]

      if (hocki) {
        let tin_chi = 0
        hocki.forEach((monhoc, _) => {
          tin_chi += Number(monhoc.he_so)
        })
        setTinchi(tin_chi)
      }
    }, [selectedSemester])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="h-6 w-6" /> Kết quả học tập
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!loading && !error && marks && (
            <select
              className="w-full sm:w-64 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSemester ?? ''}
              onChange={(e) => setSelectedSemester(e.target.value)}
            {
              ...(undefined as any)
            }
            >
              {Object.keys(marks.semesters)
                .sort((a, b) => Number(a) - Number(b))
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

      {error || is_maintenance && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-8 text-center text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && marks && selectedSemester && (
        <div className="space-y-6">
          {(() => {
            const hocKy = selectedSemester;
            const monHocs = marks.semesters[hocKy] ?? [];
            return (
              <Card key={hocKy} className="overflow-hidden border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" /> Học kỳ {hocKy}
                    <PiChalkboardSimpleDuotone className="h-5 w-5 text-green-600" /> Số tín chỉ trong kì {tinchi}
                    <PiDiceThreeDuotone className="h-5 w-5 text-yellow-600" /> Số tín chỉ tích luỹ {marks.tin_chi_tich_luy}
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
                          monHocs.map((mh: MonHoc, idx: number) => (
                            <tr
                              key={mh.ma_mon_hoc || `${hocKy}-${idx}`}
                              className="border-b border-gray-200 dark:border-gray-700"
                            >
                              <td className="px-4 py-2 font-mono break-words">{safeText(mh.ma_mon_hoc)}</td>
                              <td className="px-4 py-2 break-words">{safeText(mh.ten_mon_hoc)}</td>
                              <td className="px-4 py-2">{formatScore(mh.he_so, 0)}</td>
                              <td className="px-4 py-2">{formatScore(mh.diem_thanh_phan)}</td>
                              <td className="px-4 py-2 font-semibold">{formatScore(mh.diem_trung_binh)}</td>
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
