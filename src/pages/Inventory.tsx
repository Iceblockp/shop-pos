import React, { useState, useEffect } from "react";
import { ProductWithStock, useInventory } from "../hooks/useInventory";
import { InventoryFilters } from "../components/InventoryFilters";
import { InventoryTable } from "../components/InventoryTable";
import { InventoryStats } from "../components/InventoryStats";
import { toast } from "react-toastify";

const Inventory: React.FC = () => {
  const { products, categories, isLoading, updateStock, setStockQuantity } =
    useInventory();
  const [filteredProducts, setFilteredProducts] = useState<ProductWithStock[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  // Filter products based on search, category, and stock status
  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            p.barcode.includes(searchTerm)
        );
      }

      if (selectedCategory !== null) {
        filtered = filtered.filter((p) => p.categoryId === selectedCategory);
      }

      if (stockFilter === "low") {
        filtered = filtered.filter(
          (p) => p.stockQuantity > 0 && p.stockQuantity < 5
        );
      } else if (stockFilter === "out") {
        filtered = filtered.filter((p) => p.stockQuantity === 0);
      }

      setFilteredProducts(filtered);
    }
  }, [searchTerm, selectedCategory, stockFilter, products]);

  const handleStockAdjustment = async (
    productId: number | undefined,
    stockId: number | undefined,
    currentStock: number
  ) => {
    const quantityStr = prompt(
      "Enter new stock quantity:",
      currentStock.toString()
    );
    if (quantityStr === null) return;

    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity < 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }

    await setStockQuantity(productId, stockId, quantity);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setStockFilter("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        categories={categories}
        onReset={resetFilters}
      />

      <InventoryTable
        products={filteredProducts}
        onUpdateStock={updateStock}
        onSetStock={handleStockAdjustment}
      />

      <InventoryStats products={products} />
    </div>
  );
};

export default Inventory;
