import React, { useEffect, useState } from "react";
import { useSettings, BusinessSettings } from "../hooks/useSettings";
import { BusinessSettingsForm } from "../components/BusinessSettingsForm";
import { DatabaseManagement } from "../components/DatabaseManagement";
import { toast } from "react-toastify";
import { Setting } from "../context/DatabaseContext";

const Settings: React.FC = () => {
  const {
    isLoading,
    businessSettings,
    updateBusinessSettings,
    exportLoading,
    importLoading,
    resetLoading,
    exportData,
    importData,
    resetDatabase,
  } = useSettings();

  const [settings, setSettings] = useState<Setting>(businessSettings);

  useEffect(() => {
    setSettings(businessSettings);
  }, [businessSettings]);

  const handleSettingChange = (
    key: keyof BusinessSettings,
    value: string | number
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In a real app, these would be saved to localStorage or IndexedDB
    updateBusinessSettings(settings);
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
        <BusinessSettingsForm
          settings={settings}
          onSettingChange={handleSettingChange}
          onSave={handleSaveSettings}
        />

        <DatabaseManagement
          exportLoading={exportLoading}
          importLoading={importLoading}
          resetLoading={resetLoading}
          onExport={exportData}
          onImport={importData}
          onReset={resetDatabase}
        />
      </div>

      {/* About Section */}
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
