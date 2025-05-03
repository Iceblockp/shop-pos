import { useState, useEffect } from "react";
import { useDatabase, Product } from "../context/DatabaseContext";
import { toast } from "react-toastify";

export interface StockItem {
  id?: number;
  productId: number;
  quantity: number;
  updatedAt: Date;
}

export interface ProductWithStock extends Product {
  stockId?: number;
  stockQuantity: number;
}

export const useInventory = () => {
  const { db, isLoading } = useDatabase();
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  const loadData = async () => {
    if (!db) return;

    try {
      const [productsData, stockItems, categoriesData] = await Promise.all([
        db.getAll("products"),
        db.getAll("stock"),
        db.getAll("categories"),
      ]);

      setCategories(categoriesData.map((c) => ({ id: c.id!, name: c.name })));

      const productsWithStock: ProductWithStock[] = productsData.map(
        (product) => {
          const stockItem = stockItems.find((s) => s.productId === product.id);
          return {
            ...product,
            stockId: stockItem?.id,
            stockQuantity: stockItem?.quantity || 0,
          };
        }
      );

      setProducts(productsWithStock);
    } catch (error) {
      console.error("Error loading inventory data:", error);
      toast.error("Failed to load inventory data.");
    }
  };

  const updateStock = async (
    productId: number | undefined,
    stockId: number | undefined,
    change: number
  ) => {
    if (!productId || !db) return;

    try {
      const now = new Date();

      if (stockId) {
        const stockItem = await db.get("stock", stockId);
        if (stockItem) {
          const newQuantity = Math.max(0, stockItem.quantity + change);
          await db.put("stock", {
            ...stockItem,
            quantity: newQuantity,
            updatedAt: now,
          });
          updateProductState(productId, newQuantity);
          toast.success("Stock updated successfully");
        }
      } else {
        const quantity = Math.max(0, change);
        const newStockId = await db.add("stock", {
          productId,
          quantity,
          updatedAt: now,
        });
        updateProductState(productId, quantity, newStockId);
        toast.success("Stock created successfully");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock. Please try again.");
    }
  };

  const setStockQuantity = async (
    productId: number | undefined,
    stockId: number | undefined,
    quantity: number
  ) => {
    if (!productId || !db || quantity < 0) return;

    try {
      const now = new Date();

      if (stockId) {
        await db.put("stock", {
          id: stockId,
          productId,
          quantity,
          updatedAt: now,
        });
        updateProductState(productId, quantity);
      } else {
        const newStockId = await db.add("stock", {
          productId,
          quantity,
          updatedAt: now,
        });
        updateProductState(productId, quantity, newStockId);
      }

      toast.success("Stock updated successfully");
    } catch (error) {
      console.error("Error setting stock:", error);
      toast.error("Failed to update stock. Please try again.");
    }
  };

  const updateProductState = (
    productId: number,
    quantity: number,
    newStockId?: number
  ) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId
          ? { ...p, stockId: newStockId ?? p.stockId, stockQuantity: quantity }
          : p
      )
    );
  };

  useEffect(() => {
    if (db && !isLoading) {
      loadData();
    }
  }, [db, isLoading]);

  return {
    products,
    categories,
    isLoading,
    updateStock,
    setStockQuantity,
  };
};
