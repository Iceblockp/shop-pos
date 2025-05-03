import React, { useState, useEffect } from "react";
import { Category } from "../context/DatabaseContext";
import { Search, Plus, X, Tag } from "lucide-react";
import { CategoryModal } from "../components/CategoryModal";
import { CategoryCard } from "../components/CategoryCard";
import { useCategories } from "../hooks/useCategories";

const Categories: React.FC = () => {
  const { categories, productCounts, isLoading, saveCategory, deleteCategory } =
    useCategories();
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  const handleSaveCategory = async (categoryData: Omit<Category, "id">) => {
    const savedCategory = await saveCategory(categoryData, editingCategory?.id);
    if (savedCategory) {
      setModalOpen(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const success = await deleteCategory(id);
      if (success) {
        // Category was deleted successfully
        // State is already updated in the hook
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
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Category
        </button>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              productCount={productCounts[category.id!] || 0}
              onEdit={(category) => {
                setEditingCategory(category);
                setModalOpen(true);
              }}
              onDelete={handleDeleteCategory}
            />
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

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default Categories;
