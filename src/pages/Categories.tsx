import React, { useState, useEffect } from "react";
import { useDatabase, Category } from "../context/DatabaseContext";
import { Search, Plus, Edit, Trash2, X, Tag, Package } from "lucide-react";
import { toast } from "react-toastify";

// Category Modal component
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (category: Omit<Category, "id">) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    onSave({
      name,
      description,
      createdAt: category?.createdAt || new Date(),
      updatedAt: new Date(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {category ? "Edit Category" : "Add New Category"}
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
              <label htmlFor="name" className="label">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                className="input w-full"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {category ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Categories: React.FC = () => {
  const { db, isLoading } = useDatabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [productCounts, setProductCounts] = useState<Record<number, number>>(
    {}
  );

  // Load categories and product counts
  useEffect(() => {
    const loadData = async () => {
      if (!db) return;

      try {
        // Get all categories
        const categoriesData = await db.getAll("categories");
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);

        // Count products per category
        const products = await db.getAll("products");
        const counts: Record<number, number> = {};

        for (const product of products) {
          if (product.categoryId) {
            counts[product.categoryId] = (counts[product.categoryId] || 0) + 1;
          }
        }

        setProductCounts(counts);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories.");
      }
    };

    if (db && !isLoading) {
      loadData();
    }
  }, [db, isLoading]);

  // Filter categories based on search
  useEffect(() => {
    if (categories.length > 0) {
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = categories.filter(
          (category) =>
            category.name.toLowerCase().includes(lowerSearch) ||
            category.description.toLowerCase().includes(lowerSearch)
        );
        setFilteredCategories(filtered);
      } else {
        setFilteredCategories(categories);
      }
    }
  }, [searchTerm, categories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async (categoryData: Omit<Category, "id">) => {
    if (!db) {
      toast.error("Database not available.");
      return;
    }

    try {
      if (editingCategory?.id) {
        // Update existing category
        const updatedCategory = {
          ...categoryData,
          id: editingCategory.id,
        };

        await db.put("categories", updatedCategory);

        setCategories((prevCategories) =>
          prevCategories.map((c) =>
            c.id === editingCategory.id ? updatedCategory : c
          )
        );

        toast.success("Category updated successfully");
      } else {
        // Add new category
        const id = await db.add("categories", categoryData);

        setCategories((prevCategories) => [
          ...prevCategories,
          { ...categoryData, id },
        ]);

        toast.success("Category added successfully");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category. Please try again.");
    }
  };

  const handleDeleteCategory = async (id: number | undefined) => {
    if (!id || !db) return;

    // Check if category has products
    const count = productCounts[id] || 0;

    if (count > 0) {
      toast.error(
        `Cannot delete category with ${count} products. Reassign products first.`
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await db.delete("categories", id);

        setCategories((prevCategories) =>
          prevCategories.filter((c) => c.id !== id)
        );

        toast.success("Category deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category. Please try again.");
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
        <h1 className="text-2xl font-bold">Product Categories</h1>
        <button
          className="btn-primary flex items-center mt-3 sm:mt-0"
          onClick={openAddModal}
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Category
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
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                      <Tag className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {category.description || "No description provided."}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      <span>{productCounts[category.id!] || 0} Products</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
            <Tag className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">
              No categories found
            </h3>
            <p className="text-gray-500 mt-1">
              {searchTerm
                ? "Try a different search term"
                : "Create your first category to get started"}
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

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={closeModal}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default Categories;
