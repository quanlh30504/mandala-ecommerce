import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO' | 'CreditCard' | 'MandalaPay';


export interface IOrderItem {
    productId: Types.ObjectId;
    name: string;       // Snapshot tên sản phẩm
    sku: string;        // Snapshot SKU
    image: string;      // Snapshot ảnh
    price: number;      // Snapshot giá tại thời điểm đặt hàng
    quantity: number;
    attributes: {       // Các thuộc tính đã chọn
        color?: string;
        size?: string;
    };
}

const OrderItemSchema = new Schema<IOrderItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    attributes: {
        color: { type: String },
        size: { type: String },
    },
}, { _id: false }); // không tạo _id cho sub-document 


export interface IOrder extends Document {
    orderId: string; // ID thân thiện với người dùng, vd: "DH-20250801-XYZ"
    userId: Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: { // Snapshot của địa chỉ giao hàng
        fullName: string;
        phoneNumber: string;
        street: string;
        city: string;
        district: string;
        ward: string;
    };
    payment: {
        method: PaymentMethod;
        status: PaymentStatus;
        transactionId?: string; // ID giao dịch từ cổng thanh toán
    };
    status: OrderStatus;
    shipping: {
        method: string; // Tên đơn vị vận chuyển
        fee: number;
        trackingNumber?: string;
    };
    totals: {
        subtotal: number;       // Tổng tiền hàng
        shippingTotal: number;  // Phí vận chuyển
        discount: number;       // Giảm giá (từ coupon, etc.)
        grandTotal: number;     // TỔNG CỘNG phải trả
    };
    notes?: string; // Ghi chú 
}

const OrderSchema = new Schema<IOrder>(
    {
        orderId: { type: String, required: true, unique: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [OrderItemSchema],
        shippingAddress: {
            fullName: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            district: { type: String, required: true },
            ward: { type: String, required: true },
        },
        payment: {
            method: { type: String, enum: ['COD', 'VNPAY', 'MOMO', 'CreditCard', 'MandalaPay'], required: true },
            status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
            transactionId: { type: String },
        },
        status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'pending' },
        shipping: {
            method: { type: String, default: 'Giao hàng tiêu chuẩn' },
            fee: { type: Number, required: true, default: 0 },
            trackingNumber: { type: String },
        },
        totals: {
            subtotal: { type: Number, required: true },
            shippingTotal: { type: Number, required: true },
            discount: { type: Number, default: 0 },
            grandTotal: { type: Number, required: true },
        },
        notes: { type: String },
    },
    {
        timestamps: true,
    }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
