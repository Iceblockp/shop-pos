import React, { useState, useEffect } from "react";
import {
  useDatabase,
  Product,
  Category,
  Supplier,
} from "../context/DatabaseContext";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  X,
  Package,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "react-toastify";

// ProductModal component for adding/editing products
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Partial<Product> | null;
  categories: Category[];
  suppliers: Supplier[];
  onSave: (product: Partial<Product>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  suppliers,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    barcode: "",
    description: "",
    price: 0,
    cost: 0,
    categoryId: categories.length > 0 ? categories[0].id : undefined,
    supplierId: suppliers.length > 0 ? suppliers[0].id : undefined,
    imageUrl: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else {
      setFormData({
        name: "",
        barcode: "",
        description: "",
        price: 0,
        cost: 0,
        categoryId: categories.length > 0 ? categories[0].id : undefined,
        supplierId: suppliers.length > 0 ? suppliers[0].id : undefined,
        imageUrl: "",
      });
    }
  }, [product, categories, suppliers]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "price" || name === "cost") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === "categoryId" || name === "supplierId") {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.barcode) {
      toast.error("Name and barcode are required fields.");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  const title = product?.id ? "Edit Product" : "Add New Product";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label htmlFor="name" className="label">
                  Product Name
                </label>
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
                <label htmlFor="barcode" className="label">
                  Barcode
                </label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  className="input w-full"
                  value={formData.barcode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="label">
                  Selling Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  className="input w-full"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="cost" className="label">
                  Cost Price ($)
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  step="0.01"
                  min="0"
                  className="input w-full"
                  value={formData.cost}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="categoryId" className="label">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  className="input w-full"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="supplierId" className="label">
                  Supplier
                </label>
                <select
                  id="supplierId"
                  name="supplierId"
                  className="input w-full"
                  value={formData.supplierId}
                  onChange={handleChange}
                  required
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="imageUrl" className="label">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  className="input w-full"
                  value={formData.imageUrl || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="input w-full"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {product?.id ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const { db, isLoading } = useDatabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Load data from DB
  useEffect(() => {
    const loadData = async () => {
      if (!db) return;

      try {
        const productsData = await db.getAll("products");
        setProducts(productsData);
        setFilteredProducts(productsData);

        const categoriesData = await db.getAll("categories");
        setCategories(categoriesData);

        const suppliersData = await db.getAll("suppliers");
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error loading products data:", error);
        toast.error("Failed to load products data.");
      }
    };

    if (db && !isLoading) {
      loadData();
    }
  }, [db, isLoading]);

  // Filter products based on search and category
  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            p.barcode.includes(searchTerm)
        );
      }

      if (selectedCategory !== null) {
        filtered = filtered.filter((p) => p.categoryId === selectedCategory);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        if (sortField === "name" || sortField === "description") {
          const valueA = (a[sortField] || "").toLowerCase();
          const valueB = (b[sortField] || "").toLowerCase();
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          const valueA = a[sortField] || 0;
          const valueB = b[sortField] || 0;
          return sortDirection === "asc"
            ? valueA > valueB
              ? 1
              : -1
            : valueA < valueB
            ? 1
            : -1;
        }
      });

      setFilteredProducts(filtered);

      // Reset to first page when filters change
      setCurrentPage(1);
    }
  }, [searchTerm, selectedCategory, products, sortField, sortDirection]);

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!db) {
      toast.error("Database not available.");
      return;
    }

    try {
      const now = new Date();

      if (editingProduct?.id) {
        // Update existing product
        const updatedProduct = {
          ...productData,
          id: editingProduct.id,
          updatedAt: now,
        };

        //@ts-ignore
        await db.put("products", updatedProduct);

        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === editingProduct.id ? (updatedProduct as Product) : p
          )
        );

        toast.success("Product updated successfully");
      } else {
        // Add new product
        const newProduct = {
          ...productData,
          createdAt: now,
          updatedAt: now,
        };

        //@ts-ignore
        const id = await db.add("products", newProduct);

        // Add initial stock for the new product
        await db.add("stock", {
          productId: id,
          quantity: 0,
          updatedAt: now,
        });

        setProducts((prevProducts) => [
          ...prevProducts,
          { ...newProduct, id } as Product,
        ]);

        toast.success("Product added successfully");
      }

      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product. Please try again.");
    }
  };

  const handleDeleteProduct = async (id: number | undefined) => {
    if (!id || !db) return;

    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await db.delete("products", id);

        // Also try to delete associated stock entry
        const stockTx = db.transaction("stock", "readwrite");
        const stockIndex = stockTx.store.index("by-product");
        const stockCursor = await stockIndex.openCursor(id);

        if (stockCursor) {
          await stockCursor.delete();
        }

        await stockTx.done;

        setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));

        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product. Please try again.");
      }
    }
  };

  const handleSort = (field: keyof Product) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSortField("name");
    setSortDirection("asc");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getCategoryName = (id: number | undefined) => {
    if (!id) return "N/A";
    const category = categories.find((c) => c.id === id);
    return category ? category.name : "N/A";
  };

  const getSupplierName = (id: number | undefined) => {
    if (!id) return "N/A";
    const supplier = suppliers.find((s) => s.id === id);
    return supplier ? supplier.name : "N/A";
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
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="btn-primary flex items-center mt-3 sm:mt-0"
          onClick={openAddModal}
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Product
        </button>
      </div>

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

          <div className="flex-1 md:max-w-xs">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCategory || ""}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
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

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("name")}
                  >
                    <span>Product</span>
                    {sortField === "name" && (
                      <ArrowUpDown
                        className={`ml-1 w-4 h-4 ${
                          sortDirection === "asc"
                            ? "transform rotate-0"
                            : "transform rotate-180"
                        }`}
                      />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("price")}
                  >
                    <span>Price</span>
                    {sortField === "price" && (
                      <ArrowUpDown
                        className={`ml-1 w-4 h-4 ${
                          sortDirection === "asc"
                            ? "transform rotate-0"
                            : "transform rotate-180"
                        }`}
                      />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
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
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.barcode}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {getSupplierName(product.supplierId)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No products found. Add a product or clear your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > itemsPerPage && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  products
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={closeModal}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Products;
