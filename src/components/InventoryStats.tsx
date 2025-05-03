import React from "react";
import { Package } from "lucide-react";
import { ProductWithStock } from "../hooks/useInventory";

interface InventoryStatsProps {
  products: ProductWithStock[];
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ products }) => {
  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity < 5
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <Package className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">
              Total Products
            </h3>
            <p className="text-2xl font-semibold">{products.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600">
            <Package className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">
              Low Stock Items
            </h3>
            <p className="text-2xl font-semibold">{lowStockCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <Package className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
            <p className="text-2xl font-semibold">{outOfStockCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
