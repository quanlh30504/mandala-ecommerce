import mongoose, { Schema, Document } from 'mongoose';

/**
 * Định nghĩa Interface (IProduct) cho Product document để đảm bảo an toàn kiểu dữ liệu.
 * Cấu trúc rating được cập nhật để bao gồm cả details.
 */
export interface IProduct extends Document {
    productId: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    salePrice: number;
    sku: string;
    stock: number;
    images: string[];
    categoryIds: string[];
    tags: string[];
    attributes: {
        color: string[];
        material: string;
        brand: string;
        size: string[];
        weight: string;
    };
    rating: {
        average: number;
        count: number;
        details: Map<string, number>; 
    };
    isActive: boolean;
    isFeatured: boolean;
    isHotTrend: boolean;
    viewCount: number;
    discountPercentage: number;
    // Thêm virtual property vào interface để truy cập được
    calculatedDiscountPercentage?: number; 
}

//---

/**
 * Định nghĩa Schema cho Product, liên kết với IProduct interface.
 * Kết hợp các quy tắc validation chi tiết (unique, min, max, default).
 */
const ProductSchema = new Schema<IProduct>(
    {
        productId: { type: String, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        shortDescription: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        salePrice: { type: Number, default: 0, min: 0 },
        sku: { type: String, required: true, unique: true },
        stock: { type: Number, required: true, min: 0, default: 0 },
        images: [{ type: String, required: true }],
        categoryIds: [{ type: String, required: true }],
        tags: [{ type: String, trim: true }],
        attributes: {
            color: [{ type: String }],
            material: { type: String, default: null },
            brand: { type: String, default: null },
            size: [{ type: String }],
            weight: { type: String, default: null }
        },
        rating: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0, min: 0 },
            details: {
                type: Map,
                of: Number,
                default: () => new Map([['1', 0], ['2', 0], ['3', 0], ['4', 0], ['5', 0]])
            }
        },
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        isHotTrend: { type: Boolean, default: false },
        viewCount: { type: Number, default: 0, min: 0 },
        discountPercentage: { type: Number, default: 0, min: 0, max: 100 }
    },
    {
        timestamps: true,
        // Bật virtuals để chúng được hiển thị khi chuyển thành JSON hoặc object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

//---

/**
 * Định nghĩa các Index tăng tốc độ truy vấn.
 */
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isHotTrend: 1 });
ProductSchema.index({ categoryIds: 1 });
ProductSchema.index({ 'rating.average': -1 });
ProductSchema.index({ viewCount: -1 });
ProductSchema.index({ createdAt: -1 });

//---

/**
 * Định nghĩa Virtual property để tự động tính toán phần trăm giảm giá.
 * Trường này không được lưu vào database mà sẽ được tính toán khi truy vấn.
 */
ProductSchema.virtual('calculatedDiscountPercentage').get(function (this: IProduct) {
    if (this.salePrice && this.price > 0 && this.salePrice < this.price) {
        return Math.round(((this.price - this.salePrice) / this.price) * 100);
    }
    // Trả về discountPercentage đã lưu nếu không có salePrice, hoặc 0
    return this.discountPercentage || 0;
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
