import Product from '@/models/Product'; 
import connectToDB from '@/lib/db';

export async function findHotTrendProducts(limit: number = 9) {
    try {
        await connectToDB();
        const products = await Product.find({ isHotTrend: true, isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm hot trend:", error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}
