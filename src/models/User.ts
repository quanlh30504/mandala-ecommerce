import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  image?: string;
  roles?: string;
  nickname?: string;
  gender?: string;
  country?: string;
  birthDate?: Date;
  isActive?: boolean;
  mandalaPayBalance: number; 
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    image: {
      type: String,
    },
    roles: {
      type: String,
      default: "user",
    },
    nickname: {
      type: String,
    },
    gender: {
      type: String,
    },
    country: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true, 
    },
    mandalaPayBalance: {
      type: Number,
      required: true,
      default: 5000000, // Demo: mỗi user mới vó 5.000.000đ trong ví 
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
