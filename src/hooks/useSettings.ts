import { useEffect, useState } from "react";
import { Setting, useDatabase } from "../context/DatabaseContext";
import { toast } from "react-toastify";

export interface BusinessSettings {
  businessName: string;
  taxRate: number;
  currencySymbol: string;
}
type StoreType =
  | "products"
  | "categories"
  | "suppliers"
  | "transactions"
  | "transactionItems"
  | "stock";

export const useSettings = () => {
  const { db, isLoading } = useDatabase();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<Setting>({
    businessName: "Mini Market POS",
    taxRate: 0.1,
    currencySymbol: "$",
    updatedAt: new Date(),
  });

  useEffect(() => {
    const loadData = async () => {
      if (!db || isLoading) return;
      try {
        // Check if store exists
        const storeNames = db.objectStoreNames;
        if (!storeNames.contains("setting")) {
          console.warn(
            "Settings store not found - database upgrade may be needed"
          );
          toast.warning("Please refresh the page to complete database upgrade");
          return;
        }

        const settings = await db.getAll("setting");
        if (settings && settings.length > 0) {
          setBusinessSettings(settings[0]);
          return settings[0];
        } else {
          const defaultSetting: Setting = {
            businessName: "Mini Market POS",
            taxRate: 0.1,
            currencySymbol: "$",
            updatedAt: new Date(),
          };
          await db.add("setting", defaultSetting);
          setBusinessSettings(defaultSetting);
        }
      } catch (error) {
        console.error("Error loading business settings:", error);
        toast.error("Failed to load business settings.");
      }
    };
    loadData();
  }, [db, isLoading]);

  const updateBusinessSettings = async (editSetting: Setting) => {
    if (!db) {
      toast.error("Database not available.");
      return;
    }
    try {
      // Get all settings to find the ID
      const settings = await db.getAll("setting");
      if (settings && settings.length > 0) {
        // Update existing setting
        const existingSetting = settings[0];
        const updatedSetting = {
          ...editSetting,
          id: existingSetting.id,
          updatedAt: new Date(),
        };
        await db.put("setting", updatedSetting);
        setBusinessSettings(updatedSetting);
        toast.success("Business settings updated successfully");
        return updatedSetting;
      } else {
        // Create new setting if none exists
        const newSetting = {
          ...editSetting,
          updatedAt: new Date(),
        };
        const id = await db.add("setting", newSetting);
        const savedSetting = { ...newSetting, id };
        setBusinessSettings(savedSetting);
        toast.success("Business settings created successfully");
        return savedSetting;
      }
    } catch (error) {
      console.error("Error updating business settings:", error);
      toast.error("Failed to update business settings.");
      return null;
    }
  };

  const exportData = async () => {
    if (!db) {
      toast.error("Database not available.");
      return;
    }

    try {
      setExportLoading(true);
      const stores: StoreType[] = [
        "products",
        "categories",
        "suppliers",
        "transactions",
        "transactionItems",
        "stock",
      ];
      const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0",
      };

      for (const store of stores) {
        //@ts-ignore
        exportData[store] = await db.getAll(store);
      }

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pos_export_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const importData = async (file: File) => {
    if (!db) {
      toast.error("Database not available.");
      return;
    }

    try {
      setImportLoading(true);
      const text = await file.text();
      const importData = JSON.parse(text);

      if (
        !importData.products ||
        !importData.categories ||
        !importData.suppliers
      ) {
        throw new Error("Invalid import file format");
      }

      if (
        window.confirm("Importing will replace all existing data. Continue?")
      ) {
        const stores: StoreType[] = [
          "products",
          "categories",
          "suppliers",
          "transactions",
          "transactionItems",
          "stock",
        ];
        const tx = db.transaction(stores, "readwrite");

        // Clear existing data
        await Promise.all(stores.map((store) => tx.objectStore(store).clear()));

        // Import new data
        for (const store of stores) {
          if (importData[store]) {
            for (const item of importData[store]) {
              await tx.objectStore(store).add(item);
            }
          }
        }

        await tx.done;
        toast.success(
          "Data imported successfully. Refresh the page to see changes."
        );
      }
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error("Failed to import data. Invalid file format or data.");
    } finally {
      setImportLoading(false);
    }
  };

  const resetDatabase = async () => {
    if (!db) {
      toast.error("Database not available.");
      return;
    }

    if (
      window.confirm(
        "This will permanently delete all data. This action cannot be undone. Continue?"
      )
    ) {
      try {
        setResetLoading(true);
        const stores: StoreType[] = [
          "products",
          "categories",
          "suppliers",
          "transactions",
          "transactionItems",
          "stock",
        ];

        for (const store of stores) {
          await db.clear(store);
        }

        toast.success(
          "Database reset successfully. Refresh the page to initialize with default data."
        );
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        console.error("Error resetting database:", error);
        toast.error("Failed to reset database. Please try again.");
      } finally {
        setResetLoading(false);
      }
    }
  };

  return {
    businessSettings,
    updateBusinessSettings,
    isLoading,
    exportLoading,
    importLoading,
    resetLoading,
    exportData,
    importData,
    resetDatabase,
  };
};
