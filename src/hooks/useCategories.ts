import { useState, useEffect } from "react";
import { useDatabase, Category } from "../context/DatabaseContext";
import { toast } from "react-toastify";

export const useCategories = () => {
  const { db, isLoading } = useDatabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<number, number>>(
    {}
  );

  const loadData = async () => {
    if (!db) return;

    try {
      const [categoriesData, products] = await Promise.all([
        db.getAll("categories"),
        db.getAll("products"),
      ]);

      setCategories(categoriesData);

      // Count products per category
      const counts = products.reduce((acc, product) => {
        if (product.categoryId) {
          acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);

      setProductCounts(counts);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories.");
    }
  };

  const saveCategory = async (
    categoryData: Omit<Category, "id">,
    editingId?: number
  ) => {
    if (!db) {
      toast.error("Database not available.");
      return null;
    }

    try {
      if (editingId) {
        const updatedCategory = { ...categoryData, id: editingId };
        await db.put("categories", updatedCategory);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? updatedCategory : c))
        );
        toast.success("Category updated successfully");
        return updatedCategory;
      } else {
        const id = await db.add("categories", categoryData);
        const newCategory = { ...categoryData, id };
        setCategories((prev) => [...prev, newCategory]);
        toast.success("Category added successfully");
        return newCategory;
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category. Please try again.");
      return null;
    }
  };

  const deleteCategory = async (id: number) => {
    if (!db) return false;

    const count = productCounts[id] || 0;
    if (count > 0) {
      toast.error(
        `Cannot delete category with ${count} products. Reassign products first.`
      );
      return false;
    }

    try {
      await db.delete("categories", id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
      return false;
    }
  };

  useEffect(() => {
    if (db && !isLoading) {
      loadData();
    }
  }, [db, isLoading]);

  return {
    categories,
    productCounts,
    isLoading,
    saveCategory,
    deleteCategory,
    refreshData: loadData,
  };
};
