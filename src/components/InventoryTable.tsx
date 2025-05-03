import React from "react";
import { Package, Plus, Minus } from "lucide-react";
import { ProductWithStock } from "../hooks/useInventory";

interface InventoryTableProps {
  products: ProductWithStock[];
  onUpdateStock: (
    productId: number | undefined,
    stockId: number | undefined,
    change: number
  ) => void;
  onSetStock: (
    productId: number | undefined,
    stockId: number | undefined,
    currentStock: number
  ) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onUpdateStock,
  onSetStock,
}) => {
  const getStockLevelClass = (quantity: number) => {
    if (quantity === 0) return "bg-red-100 text-red-800";
    if (quantity < 5) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity < 5) return "Low Stock";
    return "In Stock";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU/Barcode
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {product.barcode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-lg font-semibold">
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockLevelClass(
                        product.stockQuantity
                      )}`}
                    >
                      {getStockStatus(product.stockQuantity)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 focus:outline-none"
                        onClick={() =>
                          onUpdateStock(product.id, product.stockId, -1)
                        }
                        disabled={product.stockQuantity === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <button
                        className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none"
                        onClick={() =>
                          onSetStock(
                            product.id,
                            product.stockId,
                            product.stockQuantity
                          )
                        }
                      >
                        Set
                      </button>

                      <button
                        className="p-1 rounded-md bg-green-100 text-green-600 hover:bg-green-200 focus:outline-none"
                        onClick={() =>
                          onUpdateStock(product.id, product.stockId, 1)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No products found. Add products or clear your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
