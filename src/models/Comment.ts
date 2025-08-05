import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  slug: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
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
  userName: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

CommentSchema.index({ slug: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
