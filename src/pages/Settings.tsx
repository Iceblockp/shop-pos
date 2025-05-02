import React, { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";
import {
  Download,
  Upload,
  RefreshCw,
  Database,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "react-toastify";

const Settings: React.FC = () => {
  const { db, isLoading } = useDatabase();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [businessName, setBusinessName] = useState("Mini Market POS");
  const [taxRate, setTaxRate] = useState(10);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const handleExportData = async () => {
    if (!db) {
      toast.error("Database not available.");
      return;
    }

    try {
      setExportLoading(true);

      // Gather all data from the database
      const products = await db.getAll("products");
      const categories = await db.getAll("categories");
      const suppliers = await db.getAll("suppliers");
      const transactions = await db.getAll("transactions");
      const transactionItems = await db.getAll("transactionItems");
      const stock = await db.getAll("stock");

      // Create the export object
      const exportData = {
        products,
        categories,
        suppliers,
        transactions,
        transactionItems,
        stock,
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0",
      };

      // Convert to JSON and create downloadable blob
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      // Create download link and trigger download
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pos_export_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
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

  const handleImportData = () => {
    if (!db) {
      toast.error("Database not available.");
      return;
    }

    // Create file input and trigger click
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.style.display = "none";

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setImportLoading(true);

        // Read the file
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const importData = JSON.parse(event.target?.result as string);

            // Validate import data
            if (
              !importData.products ||
              !importData.categories ||
              !importData.suppliers
            ) {
              throw new Error("Invalid import file format");
            }

            // Clear all object stores and import new data
            if (
              window.confirm(
                "Importing will replace all existing data. Continue?"
              )
            ) {
              // Use a transaction to ensure data consistency
              const tx = db.transaction(
                [
                  "products",
                  "categories",
                  "suppliers",
                  "transactions",
                  "transactionItems",
                  "stock",
                ],
                "readwrite"
              );

              // Clear existing data
              await Promise.all([
                tx.objectStore("products").clear(),
                tx.objectStore("categories").clear(),
                tx.objectStore("suppliers").clear(),
                tx.objectStore("transactions").clear(),
                tx.objectStore("transactionItems").clear(),
                tx.objectStore("stock").clear(),
              ]);

              // Import new data
              for (const category of importData.categories) {
                await tx.objectStore("categories").add(category);
              }

              for (const supplier of importData.suppliers) {
                await tx.objectStore("suppliers").add(supplier);
              }

              for (const product of importData.products) {
                await tx.objectStore("products").add(product);
              }

              for (const transaction of importData.transactions) {
                await tx.objectStore("transactions").add(transaction);
              }

              for (const item of importData.transactionItems) {
                await tx.objectStore("transactionItems").add(item);
              }

              for (const stockItem of importData.stock) {
                await tx.objectStore("stock").add(stockItem);
              }

              await tx.done;

              toast.success(
                "Data imported successfully. Refresh the page to see changes."
              );
            }
          } catch (error) {
            console.error("Error processing import:", error);
            toast.error("Failed to import data. Invalid file format or data.");
          } finally {
            setImportLoading(false);
          }
        };

        reader.readAsText(file);
      } catch (error) {
        console.error("Error importing data:", error);
        toast.error("Failed to import data. Please try again.");
        setImportLoading(false);
      }
    };

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleResetDatabase = async () => {
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

        const stores = [
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

        // Force page reload after a brief delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error("Error resetting database:", error);
        toast.error("Failed to reset database. Please try again.");
      } finally {
        setResetLoading(false);
      }
    }
  };

  const handleSaveSettings = () => {
    // In a real app, these would be saved to localStorage or IndexedDB
    toast.success("Settings saved successfully");
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
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="flex items-center text-lg font-semibold">
              <SettingsIcon className="w-5 h-5 mr-2 text-blue-600" />
              Business Settings
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="businessName" className="label">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                className="input w-full"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="taxRate" className="label">
                Tax Rate (%)
              </label>
              <input
                type="number"
                id="taxRate"
                className="input w-full"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseInt(e.target.value))}
              />
            </div>

            <div>
              <label htmlFor="currencySymbol" className="label">
                Currency Symbol
              </label>
              <input
                type="text"
                id="currencySymbol"
                className="input w-full"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
              />
            </div>

            <button
              className="btn-primary w-full mt-4"
              onClick={handleSaveSettings}
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="flex items-center text-lg font-semibold">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              Database Management
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Export/Import Data
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Export your data for backup or transfer to another device.
                Import previously exported data.
              </p>

              <div className="flex space-x-2">
                <button
                  className="btn-secondary flex-1 flex items-center justify-center"
                  onClick={handleExportData}
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export Data
                </button>

                <button
                  className="btn-secondary flex-1 flex items-center justify-center"
                  onClick={handleImportData}
                  disabled={importLoading}
                >
                  {importLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import Data
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Reset Database
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                This will permanently delete all data and reset the application
                to its initial state. This action cannot be undone.
              </p>

              <button
                className="btn-danger w-full flex items-center justify-center"
                onClick={handleResetDatabase}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Reset Database
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">About</h2>
        </div>

        <div className="p-4">
          <p className="text-gray-600">Mini Market POS v1.0.0</p>
          <p className="mt-2 text-sm text-gray-500">
            A complete point-of-sale system for small retail businesses.
            Features include inventory management, sales processing, barcode
            scanning, and reporting.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            © 2025 MarketPOS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
