import React from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { BusinessSettings } from "../hooks/useSettings";

interface BusinessSettingsFormProps {
  settings: BusinessSettings;
  onSettingChange: (
    key: keyof BusinessSettings,
    value: string | number
  ) => void;
  onSave: () => void;
}

export const BusinessSettingsForm: React.FC<BusinessSettingsFormProps> = ({
  settings,
  onSettingChange,
  onSave,
}) => {
  return (
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
            value={settings.businessName}
            onChange={(e) => onSettingChange("businessName", e.target.value)}
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
            value={settings.taxRate}
            onChange={(e) =>
              onSettingChange("taxRate", parseInt(e.target.value))
            }
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
            value={settings.currencySymbol}
            onChange={(e) => onSettingChange("currencySymbol", e.target.value)}
          />
        </div>

        <button className="btn-primary w-full mt-4" onClick={onSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
};
