import React from "react";
import { Supplier } from "../context/DatabaseContext";
import {
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Package,
  Truck,
} from "lucide-react";

interface SupplierCardProps {
  supplier: Supplier;
  productCount: number;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  productCount,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">{supplier.name}</h3>
          </div>

          <div className="flex space-x-2">
            <button
              className="text-blue-600 hover:text-blue-900"
              onClick={() => onEdit(supplier)}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              className="text-red-600 hover:text-red-900"
              onClick={() => onDelete(supplier.id!)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm font-medium text-gray-700">
          {supplier.contactPerson}
        </p>

        <div className="mt-3 space-y-2">
          {supplier.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{supplier.phone}</span>
            </div>
          )}

          {supplier.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span>{supplier.email}</span>
            </div>
          )}

          {supplier.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span>{supplier.address}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-sm text-gray-500">
          <Package className="w-4 h-4 mr-1" />
          <span>{productCount} Products</span>
        </div>
      </div>
    </div>
  );
};
