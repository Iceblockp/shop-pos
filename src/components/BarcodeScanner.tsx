import React, { useState } from "react";
import { ScanLine, X } from "lucide-react";
import { BarcodeScan } from "./BarcodeScan";

interface BarcodeData {
  barcodeData: string;
}

declare global {
  interface Window {
    onScanDetected?: (data: BarcodeData) => void;
  }
}

type BarCodeScannerProps = {
  onScan: (barcode: string) => void;
  onError: (error: Error) => void;
};

const BarcodeScanner: React.FC<BarCodeScannerProps> = ({ onScan, onError }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`relative p-2 rounded-full  text-gray-500 hover:bg-gray-100 `}
        onClick={() => setIsOpen(!isOpen)}
        title="Scan Barcode"
        type="button"
      >
        <ScanLine className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Barcode Scan</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className=" p-2">
              <BarcodeScan
                onScan={(barcode) => {
                  onScan(barcode);
                  setIsOpen(false);
                }}
                onError={(error) => {
                  console.error("Scanner error:", error);
                  onError(error);
                  setIsOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BarcodeScanner;
