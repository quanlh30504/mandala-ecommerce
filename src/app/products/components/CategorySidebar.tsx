import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { ICategory } from '@/models/Category';

interface CategorySidebarProps {
  categories: ICategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Helper function to get the proper ID from category object
  const getCategoryId = (category: ICategory): string => {
    return String(category._id) || category.categoryId || '';
  };

  // Separate level 1 and level 2 categories
  const level1Categories = categories.filter(cat => cat.level === 1).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Get subcategories for a parent category
  const getSubcategories = (parentCategoryId: string) => {
    return categories
      .filter(cat => cat.level === 2 && cat.parentId === parentCategoryId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  console.log('CategorySidebar - All categories:', categories.map(c => ({
    id: getCategoryId(c),
    categoryId: c.categoryId,
    name: c.name,
    level: c.level,
    parentId: c.parentId
  })));

  console.log('CategorySidebar - Selected category:', selectedCategory);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
          ☰ DANH MỤC SẢN PHẨM
        </h3>
      </div>

      <div className="p-4 space-y-2">
        {/* Show All Products Button */}
        <button
          onClick={() => onSelectCategory('')}
          className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors border-b border-gray-200 pb-3 mb-3 ${
            selectedCategory === ''
              ? 'text-[#8ba63a]'
              : 'text-gray-700 hover:text-[#8ba63a]'
          }`}
        >
          Tất cả sản phẩm
        </button>

        {/* Level 1 Categories */}
        {level1Categories.map((category) => {
          const categoryId = getCategoryId(category);
          const subcategories = getSubcategories(category.categoryId || categoryId);
          const hasSubcategories = subcategories.length > 0;
          const isExpanded = expandedCategories.has(categoryId);
          const isSelected = selectedCategory === categoryId || selectedCategory === category.categoryId;

          return (
            <div key={categoryId}>
              {/* Main Category */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSelectCategory(category.categoryId || categoryId)}
                  className={`flex-1 text-left px-3 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'text-[#8ba63a]'
                      : 'text-gray-700 hover:text-[#8ba63a]'
                  }`}
                >
                  {category.name}
                </button>

                {/* Expand/Collapse Button for categories with subcategories */}
                {hasSubcategories && (
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isExpanded ? (
                      <FaChevronDown className="text-xs" />
                    ) : (
                      <FaChevronRight className="text-xs" />
                    )}
                  </button>
                )}
              </div>

              {/* Subcategories - shown when expanded */}
              {hasSubcategories && isExpanded && (
                <div className="ml-6 mt-2 space-y-1">
                  {subcategories.map((subcategory) => {
                    const subcategoryId = getCategoryId(subcategory);
                    const isSubcategorySelected = selectedCategory === subcategoryId || selectedCategory === subcategory.categoryId;

                    return (
                      <button
                        key={subcategoryId}
                        onClick={() => onSelectCategory(subcategory.categoryId || subcategoryId)}
                        className={`w-full text-left px-3 py-1.5 text-sm transition-colors rounded ${
                          isSubcategorySelected
                            ? 'text-[#8ba63a] bg-green-50'
                            : 'text-gray-600 hover:text-[#8ba63a] hover:bg-gray-50'
                        }`}
                      >
                        • {subcategory.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CategorySidebar;
