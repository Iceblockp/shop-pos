import React, { useState, useEffect } from "react";
import { Product, Category, Supplier } from "../context/DatabaseContext";
import { X } from "lucide-react";
import { toast } from "react-toastify";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Partial<Product> | null;
  categories: Category[];
  suppliers: Supplier[];
  onSave: (product: Partial<Product>) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  suppliers,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    barcode: "",
    description: "",
    price: 0,
    cost: 0,
    categoryId: categories.length > 0 ? categories[0].id : undefined,
    supplierId: suppliers.length > 0 ? suppliers[0].id : undefined,
    imageUrl: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else {
      setFormData({
        name: "",
        barcode: "",
        description: "",
        price: 0,
        cost: 0,
        categoryId: categories.length > 0 ? categories[0].id : undefined,
        supplierId: suppliers.length > 0 ? suppliers[0].id : undefined,
        imageUrl: "",
      });
    }
  }, [product, categories, suppliers]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "price" || name === "cost") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === "categoryId" || name === "supplierId") {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.barcode) {
      toast.error("Name and barcode are required fields.");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  const title = product?.id ? "Edit Product" : "Add New Product";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label htmlFor="name" className="label">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input w-full"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="barcode" className="label">
                  Barcode
                </label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  className="input w-full"
                  value={formData.barcode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="label">
                  Selling Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  className="input w-full"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="cost" className="label">
                  Cost Price ($)
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  step="0.01"
                  min="0"
                  className="input w-full"
                  value={formData.cost}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="categoryId" className="label">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  className="input w-full"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="supplierId" className="label">
                  Supplier
                </label>
                <select
                  id="supplierId"
                  name="supplierId"
                  className="input w-full"
                  value={formData.supplierId}
                  onChange={handleChange}
                  required
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="imageUrl" className="label">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  className="input w-full"
                  value={formData.imageUrl || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="input w-full"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {product?.id ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ... rest of the modal component code remains the same
};
