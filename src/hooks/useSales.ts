import { useState, useEffect } from "react";
import {
  useDatabase,
  Product,
  Transaction,
  TransactionItem,
} from "../context/DatabaseContext";
import { toast } from "react-toastify";
import { ProductWithStock } from "./useInventory";

export interface CartItem extends Product {
  quantity: number;
  total: number;
}

export const useSales = () => {
  const { db, isLoading } = useDatabase();
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  // Load initial data
  useEffect(() => {
    loadData();
  }, [db, isLoading]);

  const loadData = async () => {
    if (!db || isLoading) return;

    try {
      const [productsData, stockItems, categoriesData] = await Promise.all([
        db.getAll("products"),
        db.getAll("stock"),
        db.getAll("categories"),
      ]);

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
      setCategories(categoriesData.map((c) => ({ id: c.id!, name: c.name })));
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products.");
    }
  };

  const processCheckout = async ({
    cart,
    total,
    tax,
    discount,
    paymentMethod,
    paymentStatus,
    customerName,
  }: {
    cart: CartItem[];
    total: number;
    tax: number;
    discount: number;
    paymentMethod: string;
    paymentStatus: "paid" | "pending";
    customerName: string;
  }) => {
    if (!db) {
      toast.error("Database not available.");
      return false;
    }

    try {
      const transaction: Omit<Transaction, "id"> = {
        total,
        tax,
        discount,
        paymentMethod,
        paymentStatus,
        customerName: customerName || undefined,
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tx = db.transaction(
        ["transactions", "transactionItems", "stock"],
        "readwrite"
      );

      const transactionId = await tx
        .objectStore("transactions")
        .add(transaction);
      const itemsStore = tx.objectStore("transactionItems");
      const stockStore = tx.objectStore("stock");
      const stockIndex = stockStore.index("by-product");

      for (const item of cart) {
        await itemsStore.add({
          transactionId,
          productId: item.id!,
          quantity: item.quantity,
          price: item.price,
          discount: 0,
          total: item.total,
          createdAt: new Date(),
        });

        const stockItem = await stockIndex.get(item.id!);
        if (stockItem) {
          await stockStore.put({
            ...stockItem,
            quantity: stockItem.quantity - item.quantity,
            updatedAt: new Date(),
          });
        }
      }

      await tx.done;
      toast.success("Sale completed successfully.");
      return true;
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Failed to complete sale. Please try again.");
      return false;
    }
  };

  return {
    products,
    categories,
    isLoading,
    processCheckout,
    loadData,
  };
};
