import { useState, useEffect } from "react";
import { useDatabase, Supplier } from "../context/DatabaseContext";
import { toast } from "react-toastify";

export const useSuppliers = () => {
  const { db, isLoading } = useDatabase();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [productCounts, setProductCounts] = useState<Record<number, number>>(
    {}
  );

  const loadData = async () => {
    if (!db) return;

    try {
      const [suppliersData, products] = await Promise.all([
        db.getAll("suppliers"),
        db.getAll("products"),
      ]);

      setSuppliers(suppliersData);

      const counts: Record<number, number> = {};
      for (const product of products) {
        if (product.supplierId) {
          counts[product.supplierId] = (counts[product.supplierId] || 0) + 1;
        }
      }
      setProductCounts(counts);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toast.error("Failed to load suppliers.");
    }
  };

  const saveSupplier = async (
    supplierData: Omit<Supplier, "id">,
    editingId?: number
  ) => {
    if (!db) {
      toast.error("Database not available.");
      return null;
    }

    try {
      if (editingId) {
        const updatedSupplier = { ...supplierData, id: editingId };
        await db.put("suppliers", updatedSupplier);
        setSuppliers((prev) =>
          prev.map((s) => (s.id === editingId ? updatedSupplier : s))
        );
        toast.success("Supplier updated successfully");
        return updatedSupplier;
      } else {
        const id = await db.add("suppliers", supplierData);
        const newSupplier = { ...supplierData, id };
        setSuppliers((prev) => [...prev, newSupplier]);
        toast.success("Supplier added successfully");
        return newSupplier;
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error("Failed to save supplier. Please try again.");
      return null;
    }
  };

  const deleteSupplier = async (id: number) => {
    if (!db) return false;

    const count = productCounts[id] || 0;
    if (count > 0) {
      toast.error(
        `Cannot delete supplier with ${count} products. Reassign products first.`
      );
      return false;
    }

    try {
      await db.delete("suppliers", id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success("Supplier deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier. Please try again.");
      return false;
    }
  };

  useEffect(() => {
    if (db && !isLoading) {
      loadData();
    }
  }, [db, isLoading]);

  return {
    suppliers,
    productCounts,
    isLoading,
    saveSupplier,
    deleteSupplier,
  };
};
