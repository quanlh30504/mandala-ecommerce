"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string | { $date: string };
  updatedAt: string | { $date: string };
  publishedAt: string | { $date: string };
}

interface BlogStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

const STATS_CARDS = [
  {
    key: "total" as keyof BlogStats,
    label: "Tổng bài viết",
    icon: FileText,
    color: "text-muted-foreground",
    format: false,
  },
  {
    key: "published" as keyof BlogStats,
    label: "Đã xuất bản",
    icon: Eye,
    color: "text-green-500",
    format: false,
  },
  {
    key: "draft" as keyof BlogStats,
    label: "Bản nháp",
    icon: Edit,
    color: "text-yellow-500",
    format: false,
  },
  {
    key: "totalViews" as keyof BlogStats,
    label: "Tổng lượt xem",
    icon: TrendingUp,
    color: "text-blue-500",
    format: true,
  },
];

export default function BlogManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats>({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const apiCall = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "API call failed");
    }
    return result;
  };

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const result = await apiCall(
        "/api/blog?limit=100&includeUnpublished=true"
      );

      setBlogPosts(result.data.posts);

      const posts = result.data.posts;
      const totalViews = posts.reduce(
        (sum: number, post: BlogPost) => sum + post.viewCount,
        0
      );

      setStats({
        total: posts.length,
        published: posts.filter((p: BlogPost) => p.isPublished).length,
        draft: posts.filter((p: BlogPost) => !p.isPublished).length,
        totalViews,
      });
    } catch (error) {
      toast.error("Lỗi khi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) return;

    try {
      setDeleting(slug);
      await apiCall(`/api/blog/${slug}`, { method: "DELETE" });
      toast.success("Xóa bài viết thành công");
      fetchBlogPosts();
    } catch (error) {
      toast.error("Lỗi khi xóa bài viết");
    } finally {
      setDeleting(null);
    }
  };

  const togglePublishStatus = async (slug: string, currentStatus: boolean) => {
    try {
      await apiCall(`/api/blog/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: !currentStatus,
          publishedAt: !currentStatus ? new Date().toISOString() : undefined,
        }),
      });

      toast.success(
        `${!currentStatus ? "Xuất bản" : "Hủy xuất bản"} bài viết thành công`
      );
      fetchBlogPosts();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const filteredPosts = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isPublished: boolean) => (
    <Badge variant={isPublished ? "default" : "secondary"}>
      {isPublished ? "Đã xuất bản" : "Bản nháp"}
    </Badge>
  );

  const formatDate = (dateInput: string | any) => {
    const date =
      typeof dateInput === "object" && dateInput.$date
        ? new Date(dateInput.$date)
        : new Date(dateInput);

    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
  };

  const ActionButtons = ({ post }: { post: BlogPost }) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(`/news/${post.slug}`, "_blank")}
        title="Xem bài viết"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (window.location.href = `/admin/blog/edit/${post.slug}`)}
        title="Chỉnh sửa"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => togglePublishStatus(post.slug, post.isPublished)}
        className={post.isPublished ? "text-yellow-600" : "text-green-600"}
        title={post.isPublished ? "Hủy xuất bản" : "Xuất bản"}
      >
        {post.isPublished ? "Hủy xuất bản" : "Xuất bản"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(post.slug, post.title)}
        disabled={deleting === post.slug}
        className="text-red-600 hover:text-red-700"
        title="Xóa bài viết"
      >
        {deleting === post.slug ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

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
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý Blog</h1>
            <p className="text-muted-foreground">
              Quản lý bài viết và tin tức website
            </p>
          </div>
          <Button onClick={() => (window.location.href = "/admin/blog/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Viết bài mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STATS_CARDS.map(({ key, label, icon: Icon, color, format }) => (
            <Card key={key}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">
                      {format ? stats[key].toLocaleString() : stats[key]}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Blog Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách bài viết</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Lượt xem</TableHead>
                  <TableHead>Lượt thích</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell>
                      <div className="relative w-16 h-12 rounded-md overflow-hidden">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div>
                        <p className="font-medium truncate">{post.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {post.excerpt}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.isPublished)}</TableCell>
                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                    <TableCell>{post.viewCount.toLocaleString()}</TableCell>
                    <TableCell>{post.likesCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <ActionButtons post={post} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredPosts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Không tìm thấy bài viết nào phù hợp"
                    : "Chưa có bài viết nào"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
