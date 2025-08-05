import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAddress extends Document {
    userId: Types.ObjectId;
    fullName: string;
    phoneNumber: string;
    street: string;
    city: string; // Thành phố/Tỉnh
    district: string; // Quận/Huyện
    ward: string; // Phường/Xã
    isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true, trim: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Đảm bảo mỗi user chỉ có 1 địa chỉ mặc định
AddressSchema.index({ userId: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

export default mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
