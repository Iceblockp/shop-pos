import React from "react";
import { Category } from "../context/DatabaseContext";
import { Edit, Trash2, Tag, Package } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  productCount: number;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  productCount,
  onEdit,
  onDelete,
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-4 flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center">
          <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
            <Tag className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold">{category.name}</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {category.description || "No description provided."}
        </p>
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-1" />
            <span>{productCount} Products</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          className="text-blue-600 hover:text-blue-900"
          onClick={() => onEdit(category)}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => onDelete(category.id!)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);
