import React from "react";
import { Database, Download, Upload, RefreshCw } from "lucide-react";

interface DatabaseManagementProps {
  exportLoading: boolean;
  importLoading: boolean;
  resetLoading: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

export const DatabaseManagement: React.FC<DatabaseManagementProps> = ({
  exportLoading,
  importLoading,
  resetLoading,
  onExport,
  onImport,
  onReset,
}) => {
  const handleImportClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.style.display = "none";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  return (
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
            Export your data for backup or transfer to another device. Import
            previously exported data.
          </p>

          <div className="flex space-x-2">
            <button
              className="btn-secondary flex-1 flex items-center justify-center"
              onClick={onExport}
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
              onClick={handleImportClick}
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
            This will permanently delete all data and reset the application to
            its initial state. This action cannot be undone.
          </p>

          <button
            className="btn-danger w-full flex items-center justify-center"
            onClick={onReset}
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
  );
};
