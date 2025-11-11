import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Car, Clock, ArrowDownRight, DollarSign, ArrowRight, AlertCircle, X, RefreshCw } from 'lucide-react';
import { AuthStorage, UserResponse } from '@/types/user';
import { parkingAPI } from '@/services/authService';
import { PaymentHistory, PlateData, DepositHistory } from '@/types/parking';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const ParkingLHUPage = () => {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [credit, setCredit] = useState<number>(0)
  const [vehicle, setVehicle] = useState<PlateData[]>([])
  const [paymentOut, setPaymentOut] = useState<PaymentHistory[]>([])
  const [depositHistory, setDepositHistory] = useState<DepositHistory[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = () => {
        const userdata = AuthStorage.getUser()
        if (!userdata) {
            return
        }
        setUser(userdata)
    }
    fetchUser()
  }, [])

  const fetchDataParking = useCallback(async () => {
    const api = parkingAPI
    setLoading(true)
    setError(null)
    try {
        const [balance, vehicleData, paymentData, depositData] = await Promise.all([
          api.getCredit(),
          api.getPlates(),
          api.getLogPay(),
          api.getDepositHistory()
        ])
        setCredit(balance)
        setVehicle(vehicleData)
        if (paymentData) {
          setPaymentOut(paymentData)
        }
        if (depositData) {
          setDepositHistory(depositData)
        }
    } catch (error) {
        console.error('Error fetching parking data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.'
        setError(errorMessage)
    } finally {
        setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDataParking()
  }, [fetchDataParking])

  const VEHICLEMAP = {
    "BIKE": "Xe Máy",
    "CAR": "Xe Hơi"
  }

  const formatDay = (time: string) => {
    const date = new Date(time);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} • ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  const formatDate = (time: string) => {
    const date = new Date(time);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      time: `${pad(date.getHours())}:${pad(date.getMinutes())}`
    };
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 dark:bg-red-950/50 dark:border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="dark:text-red-300">Lỗi</AlertTitle>
            <AlertDescription className="dark:text-red-200">
              <div className="flex items-center justify-between gap-4">
                <span className="flex-1">{error}</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={fetchDataParking}
                    size="sm"
                    variant="outline"
                    className="dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Thử lại
                  </Button>
                  <button
                    onClick={() => setError(null)}
                    className="hover:opacity-70 transition-opacity p-1"
                    aria-label="Đóng thông báo lỗi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Tài Khoản Của Tôi</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý số dư và lịch sử giao dịch</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 dark:bg-white/10 p-3 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm opacity-90 dark:opacity-80 mb-1">Số dư tài khoản</p>
            <h2 className="text-3xl font-bold mb-2">
              {loading ? '...' : formatCurrency(credit)}
            </h2>
            <p className="text-xs opacity-75 dark:opacity-70">{user?.FullName || 'Đang tải...'}</p>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-xl">
                <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng giao dịch</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {loading ? '...' : paymentOut.length + depositHistory.length}
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">↑ Hoạt động bình thường</p>
          </div>
        </div>

        {/* License Plates Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Car className="w-5 h-5" />
              Danh Sách Biển Số Xe
            </h2>
            <button className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            onClick={() => {toast.error("Dùng ME để thêm xe nhé, mình không làm cái tính năng này")}}>
              + Thêm xe
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-8">Đang tải...</div>
            ) : vehicle.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-8">Chưa có biển số xe nào</div>
            ) : (
              vehicle.map((plate) => (
                <div
                  key={plate.id}
                  className="relative bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 rounded-xl p-5 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="text-white">
                    <p className="text-xs opacity-75 dark:opacity-80 mb-2">{VEHICLEMAP[plate.type]}</p>
                    <h3 className="text-2xl font-bold tracking-wider text-center bg-white dark:bg-gray-100 text-gray-900 dark:text-gray-800 rounded-lg py-3 px-2">
                      {plate.plate}
                    </h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch Sử thanh toán đỗ xe
            </h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">Đang tải...</div>
            ) : paymentOut.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">Chưa có lịch sử thanh toán đỗ xe</div>
            ) : (
              paymentOut.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/50">
                      <ArrowRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {transaction.licensePlateIn}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDay(transaction.timeOut)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-red-600 dark:text-red-400">
                      -{formatCurrency(Math.abs(transaction.price))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deposit History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch Sử Nạp tiền
            </h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">Đang tải...</div>
            ) : depositHistory.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">Chưa có lịch sử nạp tiền</div>
            ) : (
              depositHistory.map((transaction) => {
                const { date, time } = formatDate(transaction.createdAt);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/50">
                        <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          Nạp tiền vào tài khoản
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {date} • {time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600 dark:text-green-400">
                        +{formatCurrency(transaction.price)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingLHUPage;