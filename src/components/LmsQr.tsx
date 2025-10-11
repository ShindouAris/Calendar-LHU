import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { ApiService } from "@/services/apiService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [scanned, setScanned] = useState<string>("");
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<null | string>(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        console.log("decoded qr code:", result);
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
    scanner.start();

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, []);

  useEffect(() => {

    qrScanner?.pause()

    setError(null)

    if (scanned.includes("http")) {
      window.open(scanned)
    }

    const access_token = localStorage.getItem("access_token")

    if (!access_token) {setError("Đăng nhập để sử dụng"); return}

    if (scanned !== "" && scanned.substring(0,3) !== "STB") {
      setError("QR này không được hỗ trợ...")
    }


    ApiService.send_diem_danh(scanned, access_token).then((res) => {
      
      if (!res) return

      if (!res.success) {
        setError(String(res.error))
      }
      else {
        toast.custom((t) => (
           <div
             className={`${
               t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
             } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
           >
             <div className="flex-1 w-0 p-4">
               <div className="flex items-start">
                 <div className="flex-shrink-0 pt-0.5">
                   <img
                     className="h-10 w-10 rounded-full"
                     src=""
                     alt=""
                   />
                 </div>
                 <div className="ml-3 flex-1">
                   <p className="text-sm font-medium text-gray-900">
                     Điểm danh
                   </p>
                   <p className="mt-1 text-sm text-gray-500">
                     Điểm danh thành công
                   </p>
                 </div>
               </div>
             </div>
             <div className="flex border-l border-gray-200">
               <button
                 onClick={() => toast.dismiss(t.id)}
                 className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                 Close
               </button>
             </div>
           </div>
        ))
      }
      
       
      }
    )
  }, [scanned])

  const handleReset = () => {
    setScanned("");
    qrScanner?.start();
  };

  const handleBack = () => {
    setScanned("")
    qrScanner?.stop()
    nav("/")
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
        setScale((prev) => Math.min(Math.max(prev * zoomFactor, 1), 3)); // zoom range 1x–3x
      }

      lastDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white select-none">
      <Card className="w-[360px] bg-gray-800 border-gray-700 shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col items-center space-y-4">
          <div
            className="relative w-[300px] h-[300px] rounded-lg overflow-hidden touch-none"
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <video
              ref={videoRef}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
              }}
            />
            <motion.div
              className="absolute top-0 left-0 w-full h-[2px] bg-green-400"
              animate={{ y: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
            <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none" />
          </div>

          {scanned && !error ? (
            <div className="bg-gray-900 p-3 rounded-lg w-full break-all text-green-400 text-center border border-green-500">
              <p>{scanned}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Waiting for QR code...</p>
          )}

          {error && (
            <div className="bg-gray-900 p-3 rounded-lg w-full break-all text-red-400 text-center border border-green-500">
              <p>{error}</p>
            </div>
          )}

          <Button
            onClick={handleReset}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </Button>
          <Button
            className="flex items-center gap-3 bg-gray-500 hover:bg-gray-700 rounded-lg"
            onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4" /> Trở về
            </Button>
        </CardContent>
      </Card>
    </div>
  );
};
