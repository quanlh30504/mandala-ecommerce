import { notFound } from "next/navigation";
import { Metadata } from "next";
import { productService } from "@/services/productService";
import { getImageUrl } from "@/lib/getImageUrl";
import { IProduct } from "@/models/Product";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductTabs from "@/components/products/ProductTabs";
import RelatedProducts from "@/components/products/RelatedProducts";
import { formatCurrency } from "@/lib/utils";
interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return {
        title: "Sản phẩm không tìm thấy",
      };
    }

    return {
      title: `${product.name} | Mandala Store`,
      description:
        product.shortDescription || product.description.substring(0, 160),
      openGraph: {
        title: product.name,
        description: product.shortDescription || product.description,
        images: [getImageUrl(product.images?.[0] || "")],
      },
    };
  } catch (error) {
    return {
      title: "Sản phẩm không tìm thấy",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  let product: IProduct | null = null;
  let relatedProducts: IProduct[] = [];

  try {
    const productResult = await productService.getProductBySlug(slug);

    if (!productResult) {
      return notFound();
    }

    product = productResult;

    // Lấy sản phẩm liên quan (cùng category)
    if (product.categoryIds && product.categoryIds.length > 0) {
      const allCategoryProducts = await productService.getProductsByCategory(
        product.categoryIds[0]
      );
      relatedProducts = allCategoryProducts
        .filter((p) => p._id !== product?._id)
        .slice(0, 4);
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return notFound();
  }

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const discountPercentage = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <span>Trang chủ</span> → <span>Sản phẩm</span> →{" "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div>
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              description={product.description}
              shortDescription={product.shortDescription}
            />
          </div>

          {/* Product Info */}
          <div>
            <ProductInfo
              productId={product._id}
              name={product.name}
              price={product.price}
              salePrice={product.salePrice}
              description={product.description}
              shortDescription={product.shortDescription}
              attributes={product.attributes}
              rating={product.rating}
              stock={product.stock}
              tags={product.tags}
              discountPercentage={discountPercentage}
            />
          </div>

          {/* Related Products */}
          <div>
            {relatedProducts && relatedProducts.length > 0 && (
              <RelatedProducts products={relatedProducts} />
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-12">
          <ProductTabs
            productId={product.slug}
            description={product.description}
            attributes={product.attributes}
            rating={product.rating}
          />
        </div>
      </div>
    </div>
  );
}
