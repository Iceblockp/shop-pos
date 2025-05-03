import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "../hooks/useSales";
import { useSettings } from "../hooks/useSettings";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number | undefined, quantity: number) => void;
  onRemove: (id: number | undefined) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const { businessSettings } = useSettings();

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500">
          {businessSettings.currencySymbol}
          {item.price.toFixed(2)} each
        </p>
      </div>
      <div className="flex items-center ml-4">
        <button
          className="p-1 text-gray-400 hover:text-gray-600"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="mx-2 w-8 text-center">{item.quantity}</span>
        <button
          className="p-1 text-gray-400 hover:text-gray-600"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          className="ml-3 p-1 text-red-400 hover:text-red-600"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
