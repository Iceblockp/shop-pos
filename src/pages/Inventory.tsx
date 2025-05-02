import React, { useState, useEffect } from 'react';
import { useDatabase, Product } from '../context/DatabaseContext';
import { Search, Filter, Package, Plus, Minus, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface StockItem {
  id?: number;
  productId: number;
  quantity: number;
  updatedAt: Date;
}

interface ProductWithStock extends Product {
  stockId?: number;
  stockQuantity: number;
}

const Inventory: React.FC = () => {
  const { db, isLoading } = useDatabase();
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithStock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Load products with stock information
  useEffect(() => {
    const loadData = async () => {
      if (!db) return;
      
      try {
        // Get all products
        const productsData = await db.getAll('products');
        
        // Get all stock items
        const stockItems = await db.getAll('stock');
        
        // Get categories for filtering
        const categoriesData = await db.getAll('categories');
        setCategories(categoriesData.map(c => ({ id: c.id!, name: c.name })));
        
        // Combine products with their stock information
        const productsWithStock: ProductWithStock[] = productsData.map(product => {
          const stockItem = stockItems.find(s => s.productId === product.id);
          
          return {
            ...product,
            stockId: stockItem?.id,
            stockQuantity: stockItem?.quantity || 0
          };
        });
        
        setProducts(productsWithStock);
        setFilteredProducts(productsWithStock);
      } catch (error) {
        console.error('Error loading inventory data:', error);
        toast.error('Failed to load inventory data.');
      }
    };
    
    if (db && !isLoading) {
      loadData();
    }
  }, [db, isLoading]);
  
  // Filter products based on search, category, and stock status
  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];
      
      // Apply search filter
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          p => p.name.toLowerCase().includes(lowerSearch) || 
               p.barcode.includes(searchTerm)
        );
      }
      
      // Apply category filter
      if (selectedCategory !== null) {
        filtered = filtered.filter(p => p.categoryId === selectedCategory);
      }
      
      // Apply stock level filter
      if (stockFilter === 'low') {
        filtered = filtered.filter(p => p.stockQuantity > 0 && p.stockQuantity < 5);
      } else if (stockFilter === 'out') {
        filtered = filtered.filter(p => p.stockQuantity === 0);
      }
      
      setFilteredProducts(filtered);
    }
  }, [searchTerm, selectedCategory, stockFilter, products]);
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setStockFilter('all');
  };
  
  const updateStock = async (productId: number | undefined, stockId: number | undefined, change: number) => {
    if (!productId || !db) return;
    
    try {
      const now = new Date();
      
      if (stockId) {
        // Get current stock item
        const stockItem = await db.get('stock', stockId);
        
        if (stockItem) {
          // Calculate new quantity, don't allow negative
          const newQuantity = Math.max(0, stockItem.quantity + change);
          
          // Update stock item
          await db.put('stock', {
            ...stockItem,
            quantity: newQuantity,
            updatedAt: now
          });
          
          // Update local state
          setProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === productId 
                ? { ...p, stockQuantity: newQuantity }
                : p
            )
          );
          
          toast.success(`Stock updated successfully`);
        }
      } else {
        // Create new stock entry if it doesn't exist
        const newStockId = await db.add('stock', {
          productId,
          quantity: Math.max(0, change),
          updatedAt: now
        });
        
        // Update local state
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === productId 
              ? { ...p, stockId: newStockId, stockQuantity: Math.max(0, change) }
              : p
          )
        );
        
        toast.success(`Stock created successfully`);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock. Please try again.');
    }
  };
  
  const handleStockAdjustment = async (
    productId: number | undefined, 
    stockId: number | undefined, 
    currentStock: number
  ) => {
    if (!productId) return;
    
    // Prompt for quantity
    const quantityStr = prompt('Enter new stock quantity:', currentStock.toString());
    if (quantityStr === null) return;
    
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Please enter a valid positive number.');
      return;
    }
    
    try {
      const now = new Date();
      
      if (stockId) {
        // Update existing stock
        await db!.put('stock', {
          id: stockId,
          productId,
          quantity,
          updatedAt: now
        });
      } else {
        // Create new stock entry
        const newStockId = await db!.add('stock', {
          productId,
          quantity,
          updatedAt: now
        });
        
        // Update local state with new stock ID
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === productId 
              ? { ...p, stockId: newStockId, stockQuantity: quantity }
              : p
          )
        );
      }
      
      // Update local state with new quantity
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId 
            ? { ...p, stockQuantity: quantity }
            : p
        )
      );
      
      toast.success('Stock updated successfully');
    } catch (error) {
      console.error('Error setting stock:', error);
      toast.error('Failed to update stock. Please try again.');
    }
  };
  
  const getStockLevelClass = (quantity: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity < 5) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };
  
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 5) return 'Low Stock';
    return 'In Stock';
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
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock Items</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          
          <button
            className="btn-secondary flex items-center self-start"
            onClick={resetFilters}
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </button>
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU/Barcode
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.barcode}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="text-lg font-semibold">{product.stockQuantity}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStockLevelClass(product.stockQuantity)
                      }`}>
                        {getStockStatus(product.stockQuantity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          className="p-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 focus:outline-none"
                          onClick={() => updateStock(product.id, product.stockId, -1)}
                          disabled={product.stockQuantity === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none"
                          onClick={() => handleStockAdjustment(product.id, product.stockId, product.stockQuantity)}
                        >
                          Set
                        </button>
                        
                        <button
                          className="p-1 rounded-md bg-green-100 text-green-600 hover:bg-green-200 focus:outline-none"
                          onClick={() => updateStock(product.id, product.stockId, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No products found. Add products or clear your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Stock Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="text-2xl font-semibold">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
              <p className="text-2xl font-semibold">
                {products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 5).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
              <p className="text-2xl font-semibold">
                {products.filter(p => p.stockQuantity === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;