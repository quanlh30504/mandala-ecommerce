"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import connectToDB from "@/lib/db";
import Address, { IAddress } from "@/models/Address";

type ActionResponse<T = any> = {
    success: boolean;
    message: string;
    data?: T;
};

interface AddressInput {
    fullName: string;
    phoneNumber: string;
    street: string;
    city: string;
    district: string;
    ward: string;
    isDefault?: boolean;
}

/**
 * Lấy tất cả địa chỉ của người dùng đang đăng nhập.
 * @returns {Promise<ActionResponse<IAddress[]>>} Danh sách địa chỉ hoặc thông báo lỗi.
 */
export async function getAddresses(): Promise<ActionResponse<IAddress[]>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Vui lòng đăng nhập." };
    }

    try {
        await connectToDB();
        const addresses = await Address.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
        return { success: true, message: "Lấy danh sách địa chỉ thành công.", data: addresses };
    } catch (error) {
        console.error("[GET_ADDRESSES_ERROR]", error);
        return { success: false, message: "Lỗi khi lấy danh sách địa chỉ." };
    }
}

/**
 * Tạo một địa chỉ mới cho người dùng.
 * Nếu isDefault = true, các địa chỉ khác sẽ được bỏ mặc định.
 * @param {AddressInput} input - Dữ liệu của địa chỉ mới.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function createAddress(input: AddressInput): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Vui lòng đăng nhập." };
    }

    // Xác thực dữ liệu đầu vào cơ bản
    if (!input.fullName || !input.phoneNumber || !input.street || !input.city || !input.district || !input.ward) {
        return { success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc." };
    }

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
        await connectToDB();

        // Nếu địa chỉ mới được đặt làm mặc định, bỏ mặc định tất cả các địa chỉ cũ.
        if (input.isDefault) {
            await Address.updateMany(
                { userId: session.user.id, isDefault: true },
                { $set: { isDefault: false } },
                { session: mongoSession }
            );
        }

        const newAddress = new Address({
            ...input,
            userId: session.user.id,
        });

        await newAddress.save({ session: mongoSession });
        await mongoSession.commitTransaction();

        revalidatePath("/profile/addresses"); // Giả định có trang quản lý địa chỉ
        return { success: true, message: "Thêm địa chỉ mới thành công." };

    } catch (error) {
        await mongoSession.abortTransaction();
        console.error("[CREATE_ADDRESS_ERROR]", error);
        return { success: false, message: "Đã xảy ra lỗi khi thêm địa chỉ." };
    } finally {
        mongoSession.endSession();
    }
}

/**
 * Cập nhật một địa chỉ đã có.
 * @param {string} addressId - ID của địa chỉ cần cập nhật.
 * @param {Partial<AddressInput>} input - Dữ liệu cần cập nhật.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function updateAddress(addressId: string, input: Partial<AddressInput>): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Vui lòng đăng nhập." };
    }

    if (!addressId) {
        return { success: false, message: "ID địa chỉ không hợp lệ." };
    }

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
        await connectToDB();

        // Xác thực người dùng sở hữu địa chỉ này
        const address = await Address.findOne({ _id: addressId, userId: session.user.id }).session(mongoSession);
        if (!address) {
            throw new Error("Không tìm thấy địa chỉ hoặc bạn không có quyền chỉnh sửa.");
        }

        // Nếu địa chỉ này được cập nhật thành mặc định
        if (input.isDefault && !address.isDefault) {
            await Address.updateMany(
                { userId: session.user.id, isDefault: true },
                { $set: { isDefault: false } },
                { session: mongoSession }
            );
        }

        await Address.findByIdAndUpdate(addressId, input, { session: mongoSession });
        await mongoSession.commitTransaction();

        revalidatePath("/profile/addresses");
        return { success: true, message: "Cập nhật địa chỉ thành công." };

    } catch (error: any) {
        await mongoSession.abortTransaction();
        console.error("[UPDATE_ADDRESS_ERROR]", error);
        return { success: false, message: error.message || "Lỗi khi cập nhật địa chỉ." };
    } finally {
        mongoSession.endSession();
    }
}

/**
 * Xóa một địa chỉ.
 * @param {string} addressId - ID của địa chỉ cần xóa.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function deleteAddress(addressId: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Vui lòng đăng nhập." };
    }

    if (!addressId) {
        return { success: false, message: "ID địa chỉ không hợp lệ." };
    }

    try {
        await connectToDB();
        
        // Ngăn xóa địa chỉ cuối cùng (tùy chọn)
        const addressCount = await Address.countDocuments({ userId: session.user.id });
        if (addressCount <= 1) {
            return { success: false, message: "Không thể xóa địa chỉ cuối cùng của bạn." };
        }

        const result = await Address.deleteOne({ _id: addressId, userId: session.user.id });

        if (result.deletedCount === 0) {
            return { success: false, message: "Không tìm thấy địa chỉ hoặc bạn không có quyền xóa." };
        }

        revalidatePath("/profile/addresses");
        return { success: true, message: "Xóa địa chỉ thành công." };

    } catch (error) {
        console.error("[DELETE_ADDRESS_ERROR]", error);
        return { success: false, message: "Lỗi khi xóa địa chỉ." };
    }
}

/**
 * Đặt một địa chỉ làm mặc định.
 * @param {string} addressId - ID của địa chỉ cần đặt làm mặc định.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function setDefaultAddress(addressId: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Vui lòng đăng nhập." };
    }
    
    if (!addressId) {
        return { success: false, message: "ID địa chỉ không hợp lệ." };
    }

    // Sử dụng transaction để đảm bảo cả hai thao tác đều thành công hoặc thất bại cùng nhau
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
        await connectToDB();
        
        // Bước 1: Bỏ mặc định tất cả địa chỉ của người dùng
        await Address.updateMany(
            { userId: session.user.id },
            { $set: { isDefault: false } },
            { session: mongoSession }
        );

        // Bước 2: Đặt địa chỉ được chỉ định làm mặc định
        const result = await Address.updateOne(
            { _id: addressId, userId: session.user.id },
            { $set: { isDefault: true } },
            { session: mongoSession }
        );

        if (result.modifiedCount === 0) {
            throw new Error("Không tìm thấy địa chỉ hoặc địa chỉ đã là mặc định.");
        }

        await mongoSession.commitTransaction();
        
        revalidatePath("/profile/addresses");
        return { success: true, message: "Đặt địa chỉ mặc định thành công." };
        
    } catch (error: any) {
        await mongoSession.abortTransaction();
        console.error("[SET_DEFAULT_ADDRESS_ERROR]", error);
        return { success: false, message: error.message || "Lỗi khi đặt địa chỉ mặc định." };
    } finally {
        mongoSession.endSession();
    }
}

/**
 * Lấy thông tin một địa chỉ cụ thể bằng ID.
 * Đảm bảo địa chỉ thuộc về người dùng đang đăng nhập.
 * @param {string} addressId - ID của địa chỉ cần lấy.
 * @returns {Promise<ActionResponse<IAddress>>} Địa chỉ hoặc thông báo lỗi.
 */
export async function getAddressById(addressId: string): Promise<ActionResponse<IAddress>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Vui lòng đăng nhập." };
    }

    if (!addressId) {
        return { success: false, message: "ID địa chỉ không hợp lệ." };
    }

    try {
        await connectToDB();
        // Tìm địa chỉ theo ID và đảm bảo nó thuộc về user đang đăng nhập
        const address = await Address.findOne({ _id: addressId, userId: session.user.id }).lean();
        
        if (!address) {
            return { success: false, message: "Không tìm thấy địa chỉ." };
        }

        return { success: true, message: "Lấy thông tin địa chỉ thành công.", data: address };
    } catch (error) {
        console.error("[GET_ADDRESS_BY_ID_ERROR]", error);
        return { success: false, message: "Lỗi khi lấy thông tin địa chỉ." };
    }
}
