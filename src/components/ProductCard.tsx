import React from "react";
import { Product } from "../context/DatabaseContext";
import { Package } from "lucide-react";
import { ProductWithStock } from "../hooks/useInventory";
import { useSettings } from "../hooks/useSettings";

interface ProductCardProps {
  product: ProductWithStock;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
}) => {
  const { businessSettings } = useSettings();

  return (
    <div
      className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow transition-shadow cursor-pointer flex flex-col"
      onClick={() => onSelect(product)}
    >
      <div className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-10 h-10 text-gray-400" />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
        <div className="mt-1 flex justify-between items-center">
          <span className="text-blue-600 font-semibold">
            {businessSettings.currencySymbol}
            {product.price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {product.stockQuantity}
          </span>
        </div>
      </div>
    </div>
  );
};
