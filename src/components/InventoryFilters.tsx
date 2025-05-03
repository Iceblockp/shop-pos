import React from "react";
import { Search, Filter, X } from "lucide-react";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  stockFilter: "all" | "low" | "out";
  onStockFilterChange: (filter: "all" | "low" | "out") => void;
  categories: { id: number; name: string }[];
  onReset: () => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
  categories,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="w-full md:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCategory || ""}
              onChange={(e) =>
                onCategoryChange(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full md:w-48">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={stockFilter}
            onChange={(e) =>
              onStockFilterChange(e.target.value as "all" | "low" | "out")
            }
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock Items</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <button
          className="btn-secondary flex items-center self-start"
          onClick={onReset}
        >
          <X className="w-4 h-4 mr-1" />
          Reset
        </button>
      </div>
    </div>
  );
};
