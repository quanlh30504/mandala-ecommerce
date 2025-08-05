"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BlogService, BlogPost, formatDate } from "@/services/blogService";

export default function NewsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const postsPerPage = 6;

  useEffect(() => {
    fetchBlogPosts(currentPage);
  }, [currentPage]);

  const fetchBlogPosts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await BlogService.getBlogPosts(page, postsPerPage);
      setBlogPosts(response.data.posts);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError("Không thể tải danh sách bài viết");
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <span>Tin tức</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">TIN TỨC</h1>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div
        className={`grid gap-6 mb-8 ${
          viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {blogPosts.map((post) => (
          <Card
            key={post._id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`${viewMode === "list" ? "flex" : ""}`}>
              <div
                className={`${
                  viewMode === "list" ? "w-1/3 flex-shrink-0" : ""
                }`}
              >
                <Link href={`/news/${post.slug}`}>
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                  />
                </Link>
              </div>
              <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
                    <Link href={`/news/${post.slug}`}>{post.title}</Link>
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{formatDate(post.publishedAt)}</span>
                    <div className="flex items-center space-x-4">
                      <span>{post.viewCount} lượt xem</span>
                      <span>{post.commentsCount} bình luận</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-4 text-xs">
                    <Link
                      href={`/news/${post.slug}`}
                      className="text-muted-foreground hover:text-primary"
                    >
                      Đọc thêm
                    </Link>
                    <button className="text-muted-foreground hover:text-primary">
                      Bình luận
                    </button>
                    <button className="text-muted-foreground hover:text-primary">
                      Chia sẻ
                    </button>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="w-8 h-8"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
