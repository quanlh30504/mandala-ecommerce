"use client";

import React, { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { ICategory } from "@/models/Category";
import { categoryService } from "@/services/categoryService";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  level: 1,
  sortOrder: 1,
  isActive: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [parentCategories, setParentCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  // Fetch data
  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories({
        includeInactive: true,
      });
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const data = await categoryService.getParentCategories();
      setParentCategories(data);
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form handlers
  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug when name changes
    if (field === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: categoryService.generateSlug(value),
      }));
    }

    // Auto-set level based on parentId
    if (field === "parentId") {
      setFormData((prev) => ({
        ...prev,
        level: value ? 2 : 1,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const categoryData = {
        ...formData,
        parentId: formData.parentId || null,
      };

      let result;
      if (editingCategory) {
        result = await categoryService.updateCategory(
          String(editingCategory._id),
          categoryData
        );
      } else {
        result = await categoryService.createCategory(categoryData);
      }

      if (result.success) {
        toast.success(
          result.message ||
            (editingCategory
              ? "Cập nhật thành công"
              : "Tạo danh mục thành công")
        );
        setIsDialogOpen(false);
        resetForm();
        fetchCategories();
        if (!editingCategory) fetchParentCategories(); // Refresh parent categories if new category
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Có lỗi xảy ra khi lưu danh mục");
    }
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId || "",
      level: category.level,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (category: ICategory) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      const result = await categoryService.deleteCategory(String(category._id));

      if (result.success) {
        toast.success(result.message || "Xóa danh mục thành công");
        fetchCategories();
        fetchParentCategories();
      } else {
        toast.error(result.error || "Có lỗi xảy ra khi xóa danh mục");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Có lỗi xảy ra khi xóa danh mục");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCategory(null);
  };

  const getParentCategoryName = (parentId: string | null | undefined) => {
    if (!parentId) return "-";
    const parent = categories.find(
      (cat) => String(cat._id) === parentId || cat.categoryId === parentId
    );
    return parent ? parent.name : parentId;
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý danh mục
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý danh mục sản phẩm của cửa hàng
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-[#8ba63a] hover:bg-[#7a942c]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm danh mục
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory
                        ? "Chỉnh sửa danh mục"
                        : "Thêm danh mục mới"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCategory
                        ? "Cập nhật thông tin danh mục"
                        : "Tạo danh mục mới cho cửa hàng"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Tên danh mục*
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="slug" className="text-right">
                        Slug*
                      </Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          handleInputChange("slug", e.target.value)
                        }
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Mô tả
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="col-span-3"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parentId" className="text-right">
                        Danh mục cha
                      </Label>
                      <Select
                        value={formData.parentId || "none"}
                        onValueChange={(value) =>
                          handleInputChange(
                            "parentId",
                            value === "none" ? "" : value
                          )
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn danh mục cha (tùy chọn)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Không có (Danh mục gốc)
                          </SelectItem>
                          {parentCategories.map((category) => (
                            <SelectItem
                              key={String(category._id)}
                              value={String(category._id)}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sortOrder" className="text-right">
                        Thứ tự
                      </Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) =>
                          handleInputChange(
                            "sortOrder",
                            parseInt(e.target.value)
                          )
                        }
                        className="col-span-3"
                        min="1"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="isActive" className="text-right">
                        Kích hoạt
                      </Label>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          handleInputChange("isActive", checked)
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#8ba63a] hover:bg-[#7a942c]"
                    >
                      {editingCategory ? "Cập nhật" : "Tạo danh mục"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Badge variant="secondary">
              {filteredCategories.length} danh mục
            </Badge>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục cha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cấp độ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thứ tự
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Đang tải...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Không tìm thấy danh mục nào
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr
                        key={String(category._id)}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getParentCategoryName(category.parentId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              category.level === 1 ? "default" : "secondary"
                            }
                          >
                            Cấp {category.level}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.sortOrder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              category.isActive ? "default" : "secondary"
                            }
                          >
                            {category.isActive ? "Hoạt động" : "Tạm dừng"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
