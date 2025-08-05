import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string | null;
    level: number;
    sortOrder: number;
    isActive: boolean;
}

const CategorySchema = new Schema<ICategory>({
    categoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    parentId: { type: String, default: null },
    level: { type: Number, default: 1 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
