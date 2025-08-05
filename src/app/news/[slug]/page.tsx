"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BlogService, BlogPost, formatDate } from "@/services/blogService";
import toast from "react-hot-toast";

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [navigation, setNavigation] = useState<{
    previous: BlogPost | null;
    next: BlogPost | null;
  }>({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentForm, setCommentForm] = useState({
    name: "",
    email: "",
    comment: "",
  });

  useEffect(() => {
    if (slug) {
      fetchBlogPost(slug);
    }
  }, [slug]);

  const fetchBlogPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await BlogService.getBlogPost(postSlug);
      setBlogPost(response.data.post);
      setNavigation(response.data.navigation);
    } catch (err) {
      setError("Không thể tải bài viết");
      console.error("Error fetching blog post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Hiển thị toast thành công
    toast.success("Gửi ý kiến thành công!", {
      duration: 3000,
      position: "top-right",
    });

    // Reset form
    setCommentForm({ name: "", email: "", comment: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setCommentForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">
            {error || "Không tìm thấy bài viết"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/news" className="hover:text-primary">
          Tin tức
        </Link>
        <span>/</span>
        <span className="line-clamp-1">{blogPost.title}</span>
      </nav>

      {/* Featured Image */}
      <div className="mb-8">
        <img
          src={blogPost.featuredImage}
          alt={blogPost.title}
          className="w-full h-64 md:h-96 object-cover rounded-lg"
        />
      </div>

      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {blogPost.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blogPost.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {blogPost.content}
        </div>
      </div>

      {/* Article Meta */}
      <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
        <span>Ngày đăng: {formatDate(blogPost.publishedAt)}</span>
        <span>{blogPost.viewCount} lượt xem</span>
        <span>{blogPost.likesCount} lượt thích</span>
        <span>{blogPost.commentsCount} bình luận</span>
      </div>

      {/* Comment Form */}
      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">ĐÓNG GÓP Ý KIẾN</h3>

        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tên *
            </label>
            <Input
              type="text"
              value={commentForm.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={commentForm.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ý kiến *
            </label>
            <Textarea
              value={commentForm.comment}
              onChange={(e) => handleInputChange("comment", e.target.value)}
              required
              rows={6}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            GỬI Ý KIẾN
          </Button>
        </form>
      </div>
    </div>
  );
}
