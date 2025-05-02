import { useState, useEffect } from "react";
import {
  useDatabase,
  Product,
  Category,
  Supplier,
} from "../context/DatabaseContext";
import { toast } from "react-toastify";

export const useProducts = () => {
  const { db, isLoading } = useDatabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    loadData();
  }, [db, isLoading]);

  const loadData = async () => {
    if (!db) return;

    try {
      const productsData = await db.getAll("products");
      setProducts(productsData);

      const categoriesData = await db.getAll("categories");
      setCategories(categoriesData);

      const suppliersData = await db.getAll("suppliers");
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error loading products data:", error);
      toast.error("Failed to load products data.");
    }
  };

  const saveProduct = async (
    productData: Product,
    editingProduct: Product | null = null
  ) => {
    if (!db) {
      toast.error("Database not available.");
      return null;
    }

    try {
      const now = new Date();

      if (editingProduct?.id) {
        const updatedProduct = {
          ...productData,
          id: editingProduct.id,
          updatedAt: now,
        };

        await db.put("products", updatedProduct);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? (updatedProduct as Product) : p
          )
        );
        toast.success("Product updated successfully");
        return updatedProduct;
      } else {
        const newProduct = {
          ...productData,
          createdAt: now,
          updatedAt: now,
        };

        const id = await db.add("products", newProduct);

        await db.add("stock", {
          productId: id,
          quantity: 0,
          updatedAt: now,
        });

        const productWithId = { ...newProduct, id } as Product;
        setProducts((prev) => [...prev, productWithId]);
        toast.success("Product added successfully");
        return productWithId;
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product. Please try again.");
      return null;
    }
  };

  const deleteProduct = async (id: number) => {
    if (!db) return false;

    try {
      await db.delete("products", id);

      const stockTx = db.transaction("stock", "readwrite");
      const stockIndex = stockTx.store.index("by-product");
      const stockCursor = await stockIndex.openCursor(id);

      if (stockCursor) {
        await stockCursor.delete();
      }

      await stockTx.done;

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
      return false;
    }
  };

  return {
    products,
    categories,
    suppliers,
    isLoading,
    saveProduct,
    deleteProduct,
    refreshData: loadData,
  };
};
