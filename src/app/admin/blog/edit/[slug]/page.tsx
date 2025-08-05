"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
}

export default function EditBlog() {
  const params = useParams();
  const slug = params.slug as string;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    tags: [] as string[],
    isPublished: false,
    isFeatured: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch blog post data
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}?admin=true`);
        const result = await response.json();

        if (result.success) {
          const post = result.data.post;
          setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            tags: post.tags || [],
            isPublished: post.isPublished,
            isFeatured: post.isFeatured,
          });
        } else {
          toast.error("Không tìm thấy bài viết");
          window.location.href = "/admin/blog";
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast.error("Lỗi khi tải bài viết");
        window.location.href = "/admin/blog";
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      // Only auto-generate slug if it matches the generated slug from current title
      // This prevents overwriting manually edited slugs
      slug:
        prev.slug === generateSlug(prev.title)
          ? generateSlug(title)
          : prev.slug,
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataImg = new FormData();
    formDataImg.append("image", file);

    try {
      setImageUploading(true);
      const response = await fetch("/api/blog/upload-image", {
        method: "POST",
        body: formDataImg,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          featuredImage: result.data.url,
        }));
        toast.success("Tải ảnh lên thành công");
      } else {
        toast.error(result.error || "Lỗi khi tải ảnh lên");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.excerpt.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!formData.featuredImage) {
      toast.error("Vui lòng chọn ảnh đại diện");
      return;
    }

    try {
      setSaving(true);
      const updateData: any = { ...formData };

      if (publish !== undefined) {
        updateData.isPublished = publish;
        if (publish) {
          updateData.publishedAt = new Date().toISOString();
        }
      }

      const response = await fetch(`/api/blog/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Cập nhật bài viết thành công");
        // If slug changed, redirect to new URL
        if (result.data.slug !== slug) {
          window.location.href = `/admin/blog/edit/${result.data.slug}`;
        }
      } else {
        toast.error(result.error || "Lỗi khi cập nhật bài viết");
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Lỗi khi cập nhật bài viết");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/admin/blog")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Chỉnh sửa bài viết</h1>
              <p className="text-muted-foreground">
                Cập nhật nội dung bài viết
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleSave()}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </Button>
            {!formData.isPublished && (
              <Button onClick={() => handleSave(true)} disabled={saving}>
                <Eye className="h-4 w-4 mr-2" />
                Xuất bản
              </Button>
            )}
            {formData.isPublished && (
              <Button
                variant="secondary"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                Hủy xuất bản
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Slug */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nhập tiêu đề bài viết..."
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    placeholder="slug-bai-viet"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Mô tả ngắn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Nhập mô tả ngắn về bài viết..."
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        excerpt: e.target.value,
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.excerpt.length}/500 ký tự
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Nội dung bài viết</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  placeholder="Viết nội dung bài viết ở đây..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={15}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.featuredImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={formData.featuredImage}
                        alt="Featured image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="featured-image"
                        disabled={imageUploading}
                      />
                      <label htmlFor="featured-image" className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={imageUploading}
                          asChild
                        >
                          <span>
                            {imageUploading ? "Đang tải..." : "Thay đổi ảnh"}
                          </span>
                        </Button>
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            featuredImage: "",
                          }))
                        }
                      >
                        Xóa ảnh
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="featured-image"
                      disabled={imageUploading}
                    />
                    <label
                      htmlFor="featured-image"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {imageUploading
                          ? "Đang tải lên..."
                          : "Chọn ảnh đại diện"}
                      </p>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Nhập tag và nhấn Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium">
                    Bài viết nổi bật
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublished: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium">
                    Đã xuất bản
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
