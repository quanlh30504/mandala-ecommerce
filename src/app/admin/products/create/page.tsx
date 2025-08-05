"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  validateProductForm,
  uploadImagesToCloudinary,
} from "@/lib/utils/productUtils";

interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  salePrice: string;
  sku: string;
  stock: string;
  images: string[];
  categoryIds: string[];
  tags: string[];
  attributes: {
    brand?: string;
    type?: string;
    material?: string;
    color?: string;
    size?: string;
    weight?: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  isHotTrend: boolean;
  discountPercentage: string;
}

export default function CreateProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    salePrice: "",
    sku: "",
    stock: "0",
    images: [],
    categoryIds: [],
    tags: [],
    attributes: {},
    isActive: true,
    isFeatured: false,
    isHotTrend: false,
    discountPercentage: "0",
  });

  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAttributeChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addCategory = () => {
    if (
      newCategory.trim() &&
      !formData.categoryIds.includes(newCategory.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categoryIds: [...prev.categoryIds, newCategory.trim()],
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.filter((cat) => cat !== categoryToRemove),
    }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error("Vui lòng chọn ít nhất một file");
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrls = await uploadImagesToCloudinary(files);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));

      toast.success(`Tải lên ${imageUrls.length} ảnh thành công`);
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed:", cloudinaryError);
      toast.error(
        cloudinaryError instanceof Error
          ? cloudinaryError.message
          : "Lỗi khi tải lên ảnh"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation using utility function
    const validationError = validateProductForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Tạo sản phẩm thành công!");
        router.push("/admin/products");
      } else {
        toast.error(data.error || "Lỗi khi tạo sản phẩm");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Lỗi khi tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Thêm sản phẩm mới
              </h1>
              <p className="text-muted-foreground">
                Tạo sản phẩm mới trong hệ thống
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">Mã SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    placeholder="Ví dụ: MYPHAM-001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    handleInputChange("shortDescription", e.target.value)
                  }
                  placeholder="Mô tả ngắn về sản phẩm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Mô tả chi tiết về sản phẩm"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Giá và kho */}
          <Card>
            <CardHeader>
              <CardTitle>Giá và kho hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá gốc (VND) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Giá khuyến mãi (VND)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) =>
                      handleInputChange("salePrice", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Tồn kho</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">
                  Phần trăm giảm giá (%)
                </Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    handleInputChange("discountPercentage", e.target.value)
                  }
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hình ảnh */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Tải lên hình ảnh</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <Button type="button" disabled={uploadingImage} size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingImage ? "Đang tải..." : "Tải lên"}
                  </Button>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border">
                        <Image
                          src={image}
                          alt={`Product image ${index + 1}`}
                          width={200}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danh mục và Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Danh mục và Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nhập ID danh mục (ví dụ: cat-1)"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCategory())
                    }
                  />
                  <Button type="button" onClick={addCategory} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.categoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.categoryIds.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                      >
                        {category}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-auto p-0"
                          onClick={() => removeCategory(category)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nhập tag"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-auto p-0"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thuộc tính */}
          <Card>
            <CardHeader>
              <CardTitle>Thuộc tính sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Thương hiệu</Label>
                  <Input
                    id="brand"
                    value={formData.attributes.brand || ""}
                    onChange={(e) =>
                      handleAttributeChange("brand", e.target.value)
                    }
                    placeholder="Ví dụ: Lancôme"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Loại sản phẩm</Label>
                  <Input
                    id="type"
                    value={formData.attributes.type || ""}
                    onChange={(e) =>
                      handleAttributeChange("type", e.target.value)
                    }
                    placeholder="Ví dụ: Kem dưỡng ẩm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material">Chất liệu</Label>
                  <Input
                    id="material"
                    value={formData.attributes.material || ""}
                    onChange={(e) =>
                      handleAttributeChange("material", e.target.value)
                    }
                    placeholder="Ví dụ: Cotton"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Màu sắc</Label>
                  <Input
                    id="color"
                    value={formData.attributes.color || ""}
                    onChange={(e) =>
                      handleAttributeChange("color", e.target.value)
                    }
                    placeholder="Ví dụ: Đỏ, Xanh"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Kích thước</Label>
                  <Input
                    id="size"
                    value={formData.attributes.size || ""}
                    onChange={(e) =>
                      handleAttributeChange("size", e.target.value)
                    }
                    placeholder="Ví dụ: S, M, L, XL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Trọng lượng</Label>
                  <Input
                    id="weight"
                    value={formData.attributes.weight || ""}
                    onChange={(e) =>
                      handleAttributeChange("weight", e.target.value)
                    }
                    placeholder="Ví dụ: 50ml, 100g"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cài đặt */}
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Kích hoạt sản phẩm</Label>
                  <p className="text-sm text-muted-foreground">
                    Sản phẩm sẽ hiển thị trên website
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sản phẩm nổi bật</Label>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị trong danh sách sản phẩm nổi bật
                  </p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    handleInputChange("isFeatured", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Xu hướng hot</Label>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị trong danh sách xu hướng hot
                  </p>
                </div>
                <Switch
                  checked={formData.isHotTrend}
                  onCheckedChange={(checked) =>
                    handleInputChange("isHotTrend", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/admin/products">
              <Button type="button" variant="outline" disabled={loading}>
                Hủy
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo sản phẩm"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
