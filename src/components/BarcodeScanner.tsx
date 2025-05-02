import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { toast } from 'react-toastify';

interface BarcodeData {
  barcodeData: string;
}

declare global {
  interface Window {
    onScanDetected?: (data: BarcodeData) => void;
  }
}

const BarcodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const { db } = useDatabase();
  
  const startScanning = () => {
    setIsScanning(true);
    
    // This would connect to a real barcode scanner or camera in a production app
    // For demo purposes, we'll simulate a barcode scan after a timeout
    
    window.onScanDetected = async ({ barcodeData }) => {
      if (db && barcodeData) {
        try {
          const tx = db.transaction('products', 'readonly');
          const index = tx.store.index('by-barcode');
          const product = await index.get(barcodeData);
          
          if (product) {
            toast.success(`Found: ${product.name}`, {
              position: "top-right",
              autoClose: 2000,
            });
            // In a real app, we'd likely add this product to a cart or trigger some other action
          } else {
            toast.warning(`No product found with barcode: ${barcodeData}`, {
              position: "top-right",
              autoClose: 2000,
            });
          }
        } catch (error) {
          console.error('Error looking up barcode:', error);
          toast.error('Error scanning barcode. Please try again.');
        }
      }
      
      setIsScanning(false);
    };
    
    // Simulate a scan for demo purposes
    setTimeout(() => {
      if (window.onScanDetected) {
        window.onScanDetected({ barcodeData: '8901234567890' });
      }
    }, 2000);
  };
  
  const simulateScan = async () => {
    if (!isScanning) {
      startScanning();
    }
  };

  return (
    <button
      className={`relative p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isScanning ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
      }`}
      onClick={simulateScan}
      title="Scan Barcode"
    >
      <ScanLine className="w-5 h-5" />
      {isScanning && (
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      )}
    </button>
  );
};

export default BarcodeScanner;