"use client";

import { useState, useEffect, use } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { getImageUrl, formatPrice } from "@/lib/utils/productUtils";
import { StatusBadge } from "@/components/StatusBadge";

export default function ViewProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `/api/admin/products/${resolvedParams.id}`
        );
        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
        } else {
          toast.error("Không tìm thấy sản phẩm");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Lỗi khi tải thông tin sản phẩm");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [resolvedParams.id, router]);

  const handleDelete = async () => {
    if (!product || !confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Xóa sản phẩm thành công");
        router.push("/admin/products");
      } else {
        toast.error(data.error || "Lỗi khi xóa sản phẩm");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Không tìm thấy sản phẩm
          </h2>
        </div>
      </AdminLayout>
    );
  }

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
                Chi tiết sản phẩm
              </h1>
              <p className="text-muted-foreground">
                Xem thông tin chi tiết sản phẩm
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/products/${product.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Xem trên web
              </Button>
            </Link>
            <Link href={`/admin/products/${product._id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {product.images.slice(1, 4).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden border"
                        >
                          <Image
                            src={getImageUrl(image)}
                            alt={`${product.name} ${index + 2}`}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {product.images.length > 4 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{product.images.length - 4} ảnh khác
                    </p>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Không có hình ảnh</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-muted-foreground">
                      {product.shortDescription}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <StatusBadge product={product} />
                    {product.isFeatured && (
                      <Badge variant="outline">Nổi bật</Badge>
                    )}
                    {product.isHotTrend && (
                      <Badge variant="outline">Xu hướng</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Mã SKU
                    </p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {product.sku}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Slug
                    </p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {product.slug}
                    </code>
                  </div>
                </div>

                {product.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Mô tả
                    </p>
                    <p className="text-sm">{product.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giá và kho hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Giá gốc
                    </p>
                    <p className="text-lg font-semibold">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  {product.salePrice && product.salePrice < product.price && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Giá khuyến mãi
                      </p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatPrice(product.salePrice)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tồn kho
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        product.stock === 0
                          ? "text-red-500"
                          : product.stock < 10
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock}
                    </p>
                  </div>
                </div>
                {product.discountPercentage > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Phần trăm giảm giá
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {product.discountPercentage}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danh mục và Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Danh mục
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(product.categoryIds || []).map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(product.tags || []).map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thuộc tính sản phẩm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.attributes).map(
                        ([key, value]) => (
                          <div key={key}>
                            <p className="text-sm font-medium text-muted-foreground capitalize">
                              {key}
                            </p>
                            <p className="text-sm">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Lượt xem
                    </p>
                    <p className="text-lg font-semibold">
                      {product.viewCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Đánh giá trung bình
                    </p>
                    <p className="text-lg font-semibold">
                      {product.rating?.average
                        ? product.rating.average.toFixed(1)
                        : "0"}
                      /5
                      {product.rating?.count
                        ? ` (${product.rating.count} đánh giá)`
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Bình luận
                    </p>
                    <p className="text-lg font-semibold">
                      {product.commentCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
