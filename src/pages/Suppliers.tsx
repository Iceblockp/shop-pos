import React, { useState, useEffect } from "react";
import { Supplier } from "../context/DatabaseContext";
import { Search, Plus, X, Truck } from "lucide-react";
import { useSuppliers } from "../hooks/useSuppliers";
import { SupplierModal } from "../components/SupplierModal";
import { SupplierCard } from "../components/SupplierCard";

const Suppliers: React.FC = () => {
  const { suppliers, productCounts, isLoading, saveSupplier, deleteSupplier } =
    useSuppliers();
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    if (suppliers.length > 0) {
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = suppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(lowerSearch) ||
            supplier.contactPerson.toLowerCase().includes(lowerSearch) ||
            supplier.email.toLowerCase().includes(lowerSearch)
        );
        setFilteredSuppliers(filtered);
      } else {
        setFilteredSuppliers(suppliers);
      }
    }
  }, [searchTerm, suppliers]);

  const handleSaveSupplier = async (supplierData: Omit<Supplier, "id">) => {
    const result = await saveSupplier(supplierData, editingSupplier?.id);
    if (result) {
      setModalOpen(false);
      setEditingSupplier(null);
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      await deleteSupplier(id);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <button
          className="btn-primary flex items-center mt-3 sm:mt-0"
          onClick={() => {
            setEditingSupplier(null);
            setModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Supplier
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              productCount={productCounts[supplier.id!] || 0}
              onEdit={(supplier) => {
                setEditingSupplier(supplier);
                setModalOpen(true);
              }}
              onDelete={handleDeleteSupplier}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
            <Truck className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">
              No suppliers found
            </h3>
            <p className="text-gray-500 mt-1">
              {searchTerm
                ? "Try a different search term"
                : "Create your first supplier to get started"}
            </p>
            {searchTerm && (
              <button
                className="mt-4 text-blue-600 hover:text-blue-800 flex items-center"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-4 h-4 mr-1" />
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      <SupplierModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSave={handleSaveSupplier}
      />
    </div>
  );
};

export default Suppliers;
