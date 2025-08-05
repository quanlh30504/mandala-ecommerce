import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Star, ShoppingCart, TrendingUp, Award, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/products/ProductCard";
import { getImageUrl } from "@/lib/getImageUrl";
import { productService } from "@/services/productService";
import { findHotTrendProducts } from "@/lib/actions/product";
import { IProduct } from "@/models/Product";
import SocialLinks from "@/components/SocialLinks";
import AboutSection from "@/components/AboutSection";
import BlogSection from "@/components/BlogSection";
import SubscribeForm from "@/components/SubscribeForm";

const features = [
  {
    icon: Award,
    title: "Chất lượng cao cấp",
    description: "Sản phẩm được tuyển chọn kỹ lưỡng từ các thương hiệu uy tín",
  },
  {
    icon: TrendingUp,
    title: "Xu hướng mới nhất",
    description: "Cập nhật liên tục những xu hướng thời trang mới nhất",
  },
  {
    icon: ShoppingCart,
    title: "Giao hàng nhanh",
    description: "Giao hàng toàn quốc, thanh toán an toàn và thuận tiện",
  },
];

const heroButtons = [
  {
    href: "/products",
    text: "Mua sắm ngay",
    variant: "mandala" as const,
    icon: ShoppingCart,
  },
  {
    href: "/aboutus",
    text: "Tìm hiểu thêm",
    variant: "outline" as const,
    icon: null,
  },
];

export default async function Home() {
  // let hotTrendProducts: IProduct[] = [];

  // try {
  //   const products = await productService.getProducts({
  //     hotTrend: true,
  //   });
  //   // Giới hạn chỉ lấy 9 sản phẩm đầu tiên
  //   hotTrendProducts = products.slice(0, 9);
  // } catch (error) {
  //   console.error("Error fetching hot trend products:", error);
  // }
  const hotTrendProducts: IProduct[] = await findHotTrendProducts(9);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#8BC34A]">
            Mandala Store
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Khám phá bộ sưu tập trang sức và mỹ phẩm cao cấp, mang đến vẻ đẹp
            hoàn hảo cho bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {heroButtons.map((button, index) => (
              <Button key={index} size="lg" variant={button.variant} asChild>
                <Link href={button.href}>
                  {button.icon && <button.icon className="h-5 w-5 mr-2" />}
                  {button.text}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-[#8BC34A]" />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Trend Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="mb-4 text-lg border-amber-500"
            >
              <Flame className="text-yellow-600" /> Hot Trend
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Sản phẩm xu hướng</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Những sản phẩm được yêu thích nhất, cập nhật theo xu hướng thời
              trang mới nhất
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {hotTrendProducts.length > 0 ? (
              hotTrendProducts.map((product: IProduct) => (
                <ProductCard
                  key={product._id as string}
                  id={product._id as string}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  salePrice={product.salePrice}
                  image={getImageUrl(product.images?.[0] || "")}
                  rating={product.rating}
                  isHotTrend={product.isHotTrend}
                  isFeatured={product.isFeatured}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Đang tải sản phẩm hot trend...
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">Xem tất cả sản phẩm</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Aboutus */}
      <section className="px-4 md:px-20 py-10 bg-white">
        <SocialLinks />

        <section className="grid md:grid-cols-3 gap-8 mt-4">
          <AboutSection />
          <BlogSection />
          <SubscribeForm />
        </section>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[#8BC34A] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Đăng ký nhận tin
          </h2>
          <p className="text-xl mb-8 opacity-90 text-white">
            Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
          </p>
          <div className="max-w-md mx-auto flex gap-4 items-center">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-10"
            />
            <Button
              variant="default"
              className="bg-white text-green-500 hover:bg-gray-50 h-10 px-6"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
