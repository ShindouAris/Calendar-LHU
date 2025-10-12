import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, QrCode, RefreshCw } from "lucide-react";
import { ApiService } from "@/services/apiService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"

export const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [scanned, setScanned] = useState<string>("");
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<null | string>(null)
  const [success, setIsSuccess] = useState<boolean>(false)
  const nav = useNavigate()

  const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // grab the video track from the stream
        const videoTrack = stream.getVideoTracks()[0];

        // now you can do things like apply constraints dynamically too
        videoTrack.applyConstraints({
          // track-specific constraints
          // @ts-ignore
          advanced: [{ exposureMode: "continuous", focusMode: "continuous" }],
        });
      } catch (err) {
        console.error("Lỗi khi truy cập camera:", err);
      }
    };

  useEffect(() => {
    if (!videoRef.current) return;

    getCamera()

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        // console.log("decoded qr code:", result);
        setScanned(result.data);
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );
    setQrScanner(scanner);
    setError(null)
    scanner.start().catch((error) => {
      if (error instanceof Error) {
        toast.error("Mở camera thất bại: " + error.message)
      }
      console.error ("Mở camera thất bại: " + error)
    });

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, []);

  useEffect(() => {

    setError(null)

    if (scanned === "") return

    if (scanned.includes("http")) {
      window.open(scanned)
      return
    }

    const access_token = localStorage.getItem("access_token")

    if (!access_token) {setError("Đăng nhập để sử dụng"); return}

    if (scanned !== "" && scanned.substring(0,3) !== "STB") {
      setError("QR này không được hỗ trợ...")
      return
    }

    qrScanner?.pause()
    .then(() => {console.log("Tạm dừng camera vì đã tìm thấy QR phù hợp")})
    .catch((error) => {
      console.log("Thất bại trong việc nỗ lực dừng camera" + error)
    })


    ApiService.send_diem_danh(scanned, access_token).then((res) => {
      
      if (!res) return

      if (!res.success) {
        setError(String(res.error))
      }
      else { 
        setIsSuccess(true)
        toast.success(`Điểm danh thành công - ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`)
      }})
  }, [scanned])

  const handleReset = () => {
    setScanned("");
    setIsSuccess(false)
    setError(null)
    toast.promise(
      async () => {qrScanner?.start()},
      {
        loading: "Đang khởi động camera",
        success: "Khởi động camera thành công",
        error: "Không thể khởi động camera"
      }
    )
  //   qrScanner?.start().then((_) => {
  //     console.log("Đã khởi động hệ thống camscanner")
  //     setIsScanning(true)
  //   }).catch((error) => console.log("Không thể bắt đầu hệ thống quét qr: " + error));
  };

  const handleBack = () => {
    setScanned("")
    nav("/")
    qrScanner?.stop()
  }

  // --- Pinch zoom handlers ---
  const lastDistance = useRef<number | null>(null);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastDistance.current) {
        const zoomFactor = distance / lastDistance.current;
        setScale((prev) => Math.min(Math.max(prev * zoomFactor, 1), 5)); // zoom range 1x–5x
      }

      lastDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-900 select-none p-4">
      {/* App Bar */}
      <div className="w-full max-w-md mb-4">
        <div className="bg-blue-600 text-white px-4 py-4 rounded-t-lg shadow-md">
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6" />
            <h1 className="text-xl font-medium">Quét mã điểm danh</h1>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-0">
          {/* Scanner Container */}
          <div className="relative w-full bg-black overflow-hidden">
            <div
              className="relative w-full aspect-square touch-none"
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {videoRef.current ? (<div><img src="/cibi.png"/></div>) : (<></>)}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                }}
              />

              {/* Zoom indicator */}
              {scale > 1 && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {scale.toFixed(1)}x
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          <div className="p-4">
            <AnimatePresence mode="wait">
              {success && !error ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-green-50 border-l-4 border-green-500 p-4 rounded"
                >
                  <div className="flex items-start">
                    {/* <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> */}
                    <img className="w-8 h-8" src="/Success.gif" alt="Success"/>
                    <div className="flex-1">
                      <p className="text-green-800 font-medium text-sm">
                        Điểm danh thành công
                      </p>
                      <p className="text-green-700 text-xs mt-1 break-all">
                        {scanned ? scanned : "Không có data"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-800 font-medium text-sm">Lỗi</p>
                      <p className="text-red-700 text-xs mt-1 break-all">
                        {error}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-blue-800 text-sm">
                      Đang quét QR...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Helper Text */}
            <p className="text-gray-500 text-xs text-center mt-4">
              Sử dụng hai ngón tay để phóng to/thu nhỏ
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 p-4 pt-0">
            <Button
              onClick={handleBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded shadow-md hover:shadow-lg transition-all duration-200 py-6 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Trở về
            </Button>
            <Button
              onClick={handleReset}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-md hover:shadow-lg transition-all duration-200 py-6 font-medium"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAB-style zoom reset (optional) */}
      {scale > 1 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={() => setScale(1)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <span className="text-sm font-bold">1x</span>
        </motion.button>
      )}
    </div>
  );
};
