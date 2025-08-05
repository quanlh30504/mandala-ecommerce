import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICartItem extends Document {
  product: Types.ObjectId; // Tham chiếu đến ID của sản phẩm
  quantity: number;
}

const CartItemSchema: Schema<ICartItem> = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product', // Tham chiếu đến model 'Product'
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Số lượng phải lớn hơn hoặc bằng 1'],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const CartItem: Model<ICartItem> = 
  mongoose.models.CartItem || mongoose.model<ICartItem>('CartItem', CartItemSchema);

export default CartItem;
