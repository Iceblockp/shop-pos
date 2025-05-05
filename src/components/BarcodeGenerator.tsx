import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  format?: string;
  displayValue?: boolean;
  fontSize?: number;
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  width = 2,
  height = 100,
  format = "CODE128",
  displayValue = true,
  fontSize = 20,
}) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          width,
          height,
          format,
          displayValue,
          fontSize,
          margin: 10,
          background: "#ffffff",
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [value, width, height, format, displayValue, fontSize]);

  return (
    <div className="barcode-generator">
      <svg ref={barcodeRef} />
      <style>
        {`
          .barcode-generator {
            display: flex;
            justify-content: center;
            padding: 1rem;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .barcode-generator svg {
            max-width: 100%;
            height: auto;
          }
        `}
      </style>
    </div>
  );
};
