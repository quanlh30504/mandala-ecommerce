import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/products/slug/[slug] - Lấy sản phẩm theo slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const { slug } = await params;

    // Tìm sản phẩm theo slug - chỉ lấy sản phẩm đang hoạt động
    const product = await db.collection("products").findOne({
      slug: slug,
      isActive: true,
    });

    if (!product) {
      console.log(`Product not found for slug: ${slug} or cleaned slug: ${cleanSlug}`);
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    // Cập nhật view count
    await db
      .collection("products")
      .updateOne(
        { _id: product._id }, 
        { $inc: { viewCount: 1 } }
      );

    // Lấy related products
    const relatedProducts = await db
      .collection("products")
      .find({
        _id: { $ne: product._id },
        categoryIds: { $in: product.categoryIds || [] },
        $or: [{ isActive: { $exists: false } }, { isActive: true }],
      })
      .limit(4)
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        product: {
          ...product,
          viewCount: (product.viewCount || 0) + 1,
        },
        relatedProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}
