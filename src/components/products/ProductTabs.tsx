"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import {
  RatingService,
  CommentService,
  ProductStatsService,
  formatDate,
} from "@/services/ratingCommentService";

interface ProductAttribute {
  brand?: string;
  spf?: string;
  skinType?: string[];
  volume?: string;
  type?: string;
  concentration?: string;
  benefits?: string[];
  usage?: string;
  material?: string;
  color?: string | string[];
  size?: any;
  weight?: string;
}

interface ProductRating {
  average: number;
  count: number;
  details?: {
    [key: string]: number;
  };
}

interface ProductTabsProps {
  productId: string;
  description: string;
  attributes?: ProductAttribute;
  rating?: ProductRating;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  productId,
  description,
  attributes,
  rating,
}) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = React.useState("features");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [productStats, setProductStats] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const safeRating = rating || {
    average: 0,
    count: 0,
    details: {},
  };

  const avg = safeRating.average;
  const userId = session?.user?.id;
  const userName = session?.user?.name;

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const renderInteractiveStars = (
    currentRating: number,
    onRate?: (rating: number) => void
  ) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoverRating || currentRating);

      return (
        <Star
          key={i}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            isFilled
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-300"
          }`}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRate && onRate(starValue)}
        />
      );
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const stats = await ProductStatsService.getProductStats(productId);
        setProductStats(stats);
        const commentsData = await CommentService.getComments(
          productId,
          currentPage,
          5
        );
        setComments(commentsData.comments);
        setTotalPages(commentsData.pagination.totalPages);

        if (userId) {
          try {
            const userRatingData = await RatingService.getUserRating(
              productId,
              userId
            );
            setUserRating(userRatingData.rating.rating);
          } catch (error) {}
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    if (productId) {
      loadData();
    }
  }, [productId, userId, currentPage]);

  const handleRatingSubmit = async (newRating: number) => {
    if (!userId || !userName) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    const ratingData = {
      slug: productId,
      userId,
      rating: newRating,
    };
    try {
      setIsSubmitting(true);
      await RatingService.submitRating(ratingData);

      setUserRating(newRating);
      const updatedStats = await ProductStatsService.getProductStats(productId);
      setProductStats(updatedStats);

      toast.success(`Bạn đã đánh giá ${newRating} sao cho sản phẩm này`);
    } catch (error) {
      console.error("ProductTabs - Error submitting rating:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi gửi đánh giá"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!userId || !userName) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      setIsSubmitting(true);
      await CommentService.addComment({
        slug: productId,
        userId,
        userName,
        comment: comment.trim(),
      });

      setComment("");

      const commentsData = await CommentService.getComments(productId, 1, 5);
      setComments(commentsData.comments);
      setCurrentPage(1);
      const updatedStats = await ProductStatsService.getProductStats(productId);
      setProductStats(updatedStats);

      toast.success("Bình luận của bạn đã được đăng");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Có lỗi xảy ra khi gửi bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReviews = safeRating.details
    ? Object.values(safeRating.details).reduce((sum, count) => sum + count, 0)
    : safeRating.count;

  const tabs = React.useMemo(
    () => [
      { id: "features", label: "ĐẶC ĐIỂM NỔI BẬT" },
      { id: "info", label: "THÔNG TIN SẢN PHẨM" },
      {
        id: "reviews",
        label: `ĐÁNH GIÁ`,
      },
    ],
    [comment]
  );

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-[#8BC34A] text-[#8BC34A]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "features" && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Đặc điểm nổi bật</h3>
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>

              {attributes?.benefits && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Lợi ích chính:</h4>
                  <ul className="space-y-2">
                    {attributes.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-[#8BC34A] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === "info" && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin sản phẩm</h3>
            {attributes && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(attributes).map(([key, value]) => {
                  if (!value) return null;

                  if (Array.isArray(value)) {
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="font-medium capitalize mb-1">
                          {key === "skinType"
                            ? "Loại da"
                            : key === "benefits"
                            ? "Lợi ích"
                            : key === "usage"
                            ? "Cách sử dụng"
                            : key}
                          :
                        </span>
                        <span className="text-muted-foreground">
                          {value.join(", ")}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium capitalize mb-1">
                        {key === "brand"
                          ? "Thương hiệu"
                          : key === "volume"
                          ? "Dung tích"
                          : key === "type"
                          ? "Loại sản phẩm"
                          : key === "spf"
                          ? "Chỉ số SPF"
                          : key === "concentration"
                          ? "Nồng độ"
                          : key === "material"
                          ? "Chất liệu"
                          : key === "color"
                          ? "Màu sắc"
                          : key}
                        :
                      </span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {activeTab === "reviews" && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Đánh giá khách hàng</h3>

            {/* Rating Summary */}
            <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {productStats?.rating?.average
                    ? productStats.rating.average.toFixed(1)
                    : safeRating.average.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {renderStars(
                    Math.floor(
                      productStats?.rating?.average || safeRating.average
                    )
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {comments.length} nhận xét
                </div>
              </div>

              {(productStats?.rating?.details || safeRating.details) && (
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const details =
                      productStats?.rating?.details || safeRating.details || {};
                    const totalCount =
                      productStats?.rating?.count || safeRating.count;
                    return (
                      <div key={stars} className="flex items-center space-x-2">
                        <span className="text-sm w-6">{stars}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${
                                ((details[stars] || 0) / totalCount) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {details[stars] || 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Rating Form */}
            {userId && (
              <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Đánh giá của bạn</h4>

                {/* Star Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Đánh giá sao {userRating > 0 && `(${userRating}/5)`}
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderInteractiveStars(userRating, handleRatingSubmit)}
                  </div>
                  {userRating > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Bạn đã đánh giá {userRating} sao cho sản phẩm này
                    </p>
                  )}
                </div>

                {/* Comment Form */}
                <div className="mb-4">
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium mb-2"
                  >
                    Nhận xét
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                    maxLength={1000}
                  />
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    {comment.length}/1000
                  </div>
                </div>

                <Button
                  onClick={handleCommentSubmit}
                  disabled={isSubmitting || !comment.trim()}
                  className="bg-[#8BC34A] hover:bg-[#7CB342]"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi nhận xét"}
                </Button>
              </div>
            )}

            {!userId && (
              <div className="mb-8 p-4 border rounded-lg bg-blue-50">
                <p className="text-center text-blue-700">
                  <strong>Đăng nhập</strong> để đánh giá và nhận xét sản phẩm
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              <h4 className="font-medium">
                Nhận xét từ khách hàng ({comments.length})
              </h4>

              {comments.length > 0 ? (
                <>
                  {comments.map((commentItem, index) => (
                    <div
                      key={commentItem._id || index}
                      className="border-b pb-4"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">
                          {commentItem.userName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(commentItem.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {commentItem.comment}
                      </p>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Chưa có nhận xét nào cho sản phẩm này.</p>
                  {userId && (
                    <p className="mt-2">
                      Hãy là người đầu tiên đánh giá sản phẩm!
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
