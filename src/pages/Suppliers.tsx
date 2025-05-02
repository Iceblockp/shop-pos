import React, { useState, useEffect } from 'react';
import { useDatabase, Supplier } from '../context/DatabaseContext';
import { Search, Plus, Edit, Trash2, X, Phone, Mail, MapPin, Package, Truck } from 'lucide-react';
import { toast } from 'react-toastify';

// Supplier Modal component
interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSave: (supplier: Omit<Supplier, 'id'>) => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ 
  isOpen, onClose, supplier, onSave 
}) => {
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        createdAt: supplier.createdAt,
        updatedAt: new Date()
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }, [supplier]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Supplier name is required');
      return;
    }
    
    onSave(formData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Supplier Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="input w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="contactPerson" className="label">Contact Person</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                className="input w-full"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="label">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="input w-full"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="input w-full"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="address" className="label">Address</label>
              <textarea
                id="address"
                name="address"
                rows={2}
                className="input w-full"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {supplier ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Suppliers: React.FC = () => {
  const { db, isLoading } = useDatabase();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [productCounts, setProductCounts] = useState<Record<number, number>>({});
  
  // Load suppliers and product counts
  useEffect(() => {
    const loadData = async () => {
      if (!db) return;
      
      try {
        // Get all suppliers
        const suppliersData = await db.getAll('suppliers');
        setSuppliers(suppliersData);
        setFilteredSuppliers(suppliersData);
        
        // Count products per supplier
        const products = await db.getAll('products');
        const counts: Record<number, number> = {};
        
        for (const product of products) {
          if (product.supplierId) {
            counts[product.supplierId] = (counts[product.supplierId] || 0) + 1;
          }
        }
        
        setProductCounts(counts);
      } catch (error) {
        console.error('Error loading suppliers:', error);
        toast.error('Failed to load suppliers.');
      }
    };
    
    if (db && !isLoading) {
      loadData();
    }
  }, [db, isLoading]);
  
  // Filter suppliers based on search
  useEffect(() => {
    if (suppliers.length > 0) {
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = suppliers.filter(
          supplier => supplier.name.toLowerCase().includes(lowerSearch) ||
                      supplier.contactPerson.toLowerCase().includes(lowerSearch) ||
                      supplier.email.toLowerCase().includes(lowerSearch)
        );
        setFilteredSuppliers(filtered);
      } else {
        setFilteredSuppliers(suppliers);
      }
    }
  }, [searchTerm, suppliers]);
  
  const openAddModal = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };
  
  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
    setEditingSupplier(null);
  };
  
  const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    if (!db) {
      toast.error('Database not available.');
      return;
    }
    
    try {
      if (editingSupplier?.id) {
        // Update existing supplier
        const updatedSupplier = {
          ...supplierData,
          id: editingSupplier.id
        };
        
        await db.put('suppliers', updatedSupplier);
        
        setSuppliers(prevSuppliers => 
          prevSuppliers.map(s => 
            s.id === editingSupplier.id ? updatedSupplier : s
          )
        );
        
        toast.success('Supplier updated successfully');
      } else {
        // Add new supplier
        const id = await db.add('suppliers', supplierData);
        
        setSuppliers(prevSuppliers => [
          ...prevSuppliers,
          { ...supplierData, id }
        ]);
        
        toast.success('Supplier added successfully');
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error('Failed to save supplier. Please try again.');
    }
  };
  
  const handleDeleteSupplier = async (id: number | undefined) => {
    if (!id || !db) return;
    
    // Check if supplier has products
    const count = productCounts[id] || 0;
    
    if (count > 0) {
      toast.error(`Cannot delete supplier with ${count} products. Reassign products first.`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await db.delete('suppliers', id);
        
        setSuppliers(prevSuppliers => 
          prevSuppliers.filter(s => s.id !== id)
        );
        
        toast.success('Supplier deleted successfully');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast.error('Failed to delete supplier. Please try again.');
      }
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
          onClick={openAddModal}
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Supplier
        </button>
      </div>
      
      {/* Search bar */}
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
      
      {/* Suppliers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{supplier.name}</h3>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => openEditModal(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {supplier.contactPerson}
                </p>
                
                <div className="mt-3 space-y-2">
                  {supplier.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  
                  {supplier.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  
                  {supplier.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{supplier.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-sm text-gray-500">
                  <Package className="w-4 h-4 mr-1" />
                  <span>{productCounts[supplier.id!] || 0} Products</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
            <Truck className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No suppliers found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? 'Try a different search term' : 'Create your first supplier to get started'}
            </p>
            {searchTerm && (
              <button
                className="mt-4 text-blue-600 hover:text-blue-800 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <X className="w-4 h-4 mr-1" />
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Supplier Modal */}
      <SupplierModal
        isOpen={modalOpen}
        onClose={closeModal}
        supplier={editingSupplier}
        onSave={handleSaveSupplier}
      />
    </div>
  );
};

export default Suppliers;