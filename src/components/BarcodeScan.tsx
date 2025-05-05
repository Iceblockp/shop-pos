import { useEffect, useState } from "react";
import { useZxing } from "react-zxing";

interface BarcodeScanProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScan: React.FC<BarcodeScanProps> = ({
  onScan,
  onError,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>("");
  const scanSound = new Audio("/src/assets/sounds/scan.mp3");

  const { ref } = useZxing({
    onDecodeResult(result) {
      const text = result.getText();
      // Prevent duplicate scans within 2 seconds
      if (text && text.length > 0 && text !== lastScan) {
        scanSound.play();
        setLastScan(text);
        onScan(text);

        // Reset last scan after 2 seconds to allow rescanning same code
        setTimeout(() => {
          setLastScan("");
        }, 2000);
      }
    },
    onError(error: any) {
      if (onError) {
        onError(error);
      }
    },
    constraints: {
      // Optimize camera settings for barcode scanning
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        // Enable auto focus and exposure
      },
    },
    timeBetweenDecodingAttempts: 100, // Scan more frequently
  });

  useEffect(() => {
    setIsScanning(true);
    return () => {
      setIsScanning(false);
    };
  }, []);

  return (
    <div className="barcode-scanner">
      <div className="camera-view">
        <video
          //@ts-ignore
          ref={ref}
          autoPlay
          playsInline
        />
        <div className="scanning-overlay">
          <div className="scanning-line" />
          <div className="corner-guides">
            <div className="corner top-left" />
            <div className="corner top-right" />
            <div className="corner bottom-left" />
            <div className="corner bottom-right" />
          </div>
        </div>
        {isScanning && (
          <div className="scanning-hint">
            <div className="hint-text">Position barcode within frame</div>
            <div className="sub-hint">Hold steady for best results</div>
          </div>
        )}
      </div>
      <style>
        {`
          .barcode-scanner {
            width: 100%;
            max-width: 640px;
            margin: 0 auto;
          }
          .camera-view {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            background: #000;
            overflow: hidden;
            border-radius: 8px;
          }
          .camera-view video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .scanning-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 200px;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 10px;
          }
          .scanning-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: #2196f3;
            box-shadow: 0 0 8px #2196f3;
            animation: scan 2s linear infinite;
          }
          .corner-guides {
            position: absolute;
            width: 100%;
            height: 100%;
          }
          .corner {
            position: absolute;
            width: 20px;
            height: 20px;
            border: 2px solid #2196f3;
          }
          .top-left {
            top: -1px;
            left: -1px;
            border-right: none;
            border-bottom: none;
          }
          .top-right {
            top: -1px;
            right: -1px;
            border-left: none;
            border-bottom: none;
          }
          .bottom-left {
            bottom: -1px;
            left: -1px;
            border-right: none;
            border-top: none;
          }
          .bottom-right {
            bottom: -1px;
            right: -1px;
            border-left: none;
            border-top: none;
          }
          @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
          }
          .scanning-hint {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 12px 20px;
            border-radius: 20px;
            text-align: center;
          }
          .hint-text {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }
          .sub-hint {
            font-size: 12px;
            opacity: 0.8;
          }
        `}
      </style>
    </div>
  );
};
