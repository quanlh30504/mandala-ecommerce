import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { ICartItem } from './CartItem'; 

export interface ICart extends Document {
  user: Types.ObjectId; 
  items: Types.ObjectId[] | ICartItem[]; 
  totalItems: number; 
}

const CartSchema: Schema<ICart> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // tham chiếu đến model 'User'
      required: true,
      unique: true, 
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CartItem', // tham chiếu đến model 'CartItem'
      },
    ],
  },
  {
    timestamps: true,
    // Cho phép virtuals được trả về trong JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CartSchema.virtual('totalItems').get(function (this: ICart) {
  if (this.items && this.items.length > 0) {
    return this.items.length;
  }
  return 0;
});

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
