import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  slug: string;
  userId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema = new Schema({
  slug: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Tạo index compound để đảm bảo một user chỉ có thể rate một product một lần
RatingSchema.index({ slug: 1, userId: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);
