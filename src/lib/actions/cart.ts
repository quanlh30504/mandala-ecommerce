"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import connectToDB from "../db";
import Cart from "@/models/Cart";
import CartItem from "@/models/CartItem";
import Product, {IProduct} from "@/models/Product";
import { PopulatedCartItem } from "@/app/cart/context/CartContext";
import { redirect } from "next/navigation"; 


type ActionResponseWithId = {
    success: boolean;
    message: string;
    data?: { cartItemId: string };
};


type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
};

/**
 * Lấy thông tin giỏ hàng của người dùng đang đăng nhập
 * và populate đầy đủ thông tin sản phẩm.
 * @returns {Promise<ActionResponse>} Giỏ hàng đã được populate hoặc thông báo lỗi.
 */
export async function getCart(): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Người dùng chưa đăng nhập." };
  }

  try {
    await connectToDB();
    const cart = await Cart.findOne({ user: session.user.id }).populate({
      path: "items",
      populate: {
        path: "product",
        model: Product,
        select: "name images price salePrice stock slug", 
      },
    });

    if (!cart) {
      return { success: true, message: "Giỏ hàng trống.", data: null };
    }
    
    return { success: true, message: "Lấy giỏ hàng thành công.", data: JSON.parse(JSON.stringify(cart)) };
  } catch (error) {
    console.error("[GET_CART_ERROR]", error);
    return { success: false, message: "Lỗi khi lấy thông tin giỏ hàng." };
  }
}

/**
 * Thêm một sản phẩm vào giỏ hàng hoặc cập nhật số lượng nếu đã tồn tại.
 * @param {string} productId - ID của sản phẩm cần thêm.
 * @param {number} quantity - Số lượng cần thêm.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function addItemToCart(productId: string, quantity: number): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Vui lòng đăng nhập để thêm sản phẩm." };
  }

  if (!productId || quantity <= 0) {
    return { success: false, message: "Dữ liệu không hợp lệ." };
  }

  try {
    await connectToDB();
    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] });
    }

    const existingCartItem = await CartItem.findOne({
      _id: { $in: cart.items },
      product: productId,
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      const newCartItem = new CartItem({ product: productId, quantity });
      await newCartItem.save();
      cart.items.push(newCartItem._id);
    }
    
    await cart.save();
    revalidatePath("/cart"); 
    return { success: true, message: "Thêm sản phẩm vào giỏ hàng thành công." };

  } catch (error) {
    console.error("[ADD_TO_CART_ERROR]", error);
    return { success: false, message: "Lỗi khi thêm sản phẩm." };
  }
}

/**
 * Cập nhật số lượng của một CartItem đã có trong giỏ.
 * @param {string} cartItemId - ID của CartItem cần cập nhật.
 * @param {number} quantity - Số lượng mới.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function updateItemQuantity(cartItemId: string, quantity: number): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Vui lòng đăng nhập." };
  }
  
  if (quantity <= 0) {
    return removeItemFromCart(cartItemId); // nếu số lượng <= 0, xóa sản phẩm
  }

  try {
    await connectToDB();
    // --- Các step check ---

    // Step 1. Tìm giỏ hàng của người dùng hiện tại.
    const userCart = await Cart.findOne({ user: session.user.id });

    // Step 2. Kiểm tra cartItemId được yêu cầu có thực sự nằm trong danh sách `items` của giỏ hàng này không.
    //    Nếu không tìm thấy giỏ hàng hoặc item không thuộc giỏ hàng, từ chối yêu cầu.
    if (!userCart || !userCart.items.some(id => id.equals(cartItemId))) {
      return { success: false, message: "Sản phẩm không hợp lệ hoặc không có trong giỏ hàng của bạn." };
    }
    
    // --- Kiểm tra tồn kho ---
    // Lấy thông tin CartItem và thông tin tồn kho của sản phẩm tương ứng
    const cartItem = await CartItem.findById(cartItemId).populate<{product: {stock: number}}>('product', 'stock');

    if (!cartItem) {
        return { success: false, message: "Sản phẩm không tồn tại." };
    }

    if (quantity > cartItem.product.stock) {
        return { success: false, message: `Số lượng tồn kho không đủ. Chỉ còn ${cartItem.product.stock} sản phẩm.` };
    }

    // --- Cập nhật ---
    await CartItem.findByIdAndUpdate(cartItemId, { quantity });
    
    revalidatePath("/cart");
    return { success: true, message: "Cập nhật số lượng thành công." };
  } catch (error) {
    console.error("[UPDATE_QUANTITY_ERROR]", error);
    return { success: false, message: "Lỗi khi cập nhật số lượng." };
  }
}

/**
 * Xóa một CartItem khỏi giỏ hàng.
 * @param {string} cartItemId - ID của CartItem cần xóa.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function removeItemFromCart(cartItemId: string): Promise<ActionResponse> {
  return removeItemsFromCart([cartItemId]);
}

/**
 * Xóa một danh sách các CartItem khỏi giỏ hàng sau khi đã xác thực quyền sở hữu.
 * @param {string[]} cartItemIds - Mảng các ID của CartItem cần xóa.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function removeItemsFromCart(cartItemIds: string[]): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Vui lòng đăng nhập." };
  }

  if (!cartItemIds || cartItemIds.length === 0) {
    return { success: false, message: "Không có sản phẩm nào được chọn để xóa." };
  }

  try {
    await connectToDB();

    // ---Step check---

    // Step 1. tìm giỏ hàng của người dùng đang đăng nhập để lấy danh sách các item ID hợp lệ.
    const userCart = await Cart.findOne({ user: session.user.id }).select('items').lean();

    if (!userCart) {
      return { success: false, message: "Không tìm thấy giỏ hàng." };
    }

    // Step 2. lọc ra danh sách các ID cần xóa mà thực sự thuộc về người dùng.
    //    -> ngăn chặn việc một người dùng gửi ID của người khác để xóa.
    const userItemIdsSet = new Set(userCart.items.map(id => id.toString()));
    const itemsToDelete = cartItemIds.filter(id => userItemIdsSet.has(id));

    // trả về nếu không có item nào hợp lệ
    if (itemsToDelete.length === 0) {
      return { success: false, message: "Sản phẩm không hợp lệ." };
    }
    
    // --- thực thi xóa ---
    // Step 3. Chỉ sử dụng danh sách itemsToDelete đã được xác thực để thực hiện các thao tác.
    
    // xóa các tham chiếu trong giỏ hàng của người dùng
    await Cart.updateOne(
      { user: session.user.id },
      { $pull: { items: { $in: itemsToDelete } } }
    );
    
    // Xóa các document CartItem tương ứng
    await CartItem.deleteMany({ _id: { $in: itemsToDelete } });

    revalidatePath("/cart");
    return { success: true, message: "Xóa sản phẩm khỏi giỏ hàng thành công." };
    
  } catch (error) {
    console.error("[REMOVE_ITEMS_ERROR]", error);
    return { success: false, message: "Lỗi khi xóa sản phẩm." };
  }
}



export async function getCheckoutItems(itemIds: string[]): Promise<{ success: boolean; message: string; data?: PopulatedCartItem[] }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Người dùng chưa đăng nhập." };
    }

    try {
        await connectToDB();
        // Lấy thông tin các CartItem được chọn và populate sản phẩm
        const items = await CartItem.find({
            _id: { $in: itemIds },
        }).populate<{ product: IProduct }>({
            path: "product",
            select: "name images price salePrice stock slug",
        });

        // Đảm bảo các item này thuộc về giỏ hàng của người dùng (tăng cường bảo mật)
        const userCart = await Cart.findOne({ user: session.user.id }).select('items').lean();
        if (!userCart) {
            return { success: false, message: "Không tìm thấy giỏ hàng." };
        }
        const userItemIdsSet = new Set(userCart.items.map(id => id.toString()));
        const validItems = items.filter(item => userItemIdsSet.has(item._id.toString()));

        return { success: true, message: "Lấy sản phẩm thanh toán thành công.", data: validItems };
    } catch (error) {
        console.error("[GET_CHECKOUT_ITEMS_ERROR]", error);
        return { success: false, message: "Lỗi khi lấy thông tin sản phẩm thanh toán." };
    }
}


/**
 * Thêm một sản phẩm vào giỏ hàng và trả về ID của CartItem.
 * @param {string} productId - ID của sản phẩm cần thêm.
 * @param {number} quantity - Số lượng cần thêm.
 * @returns {Promise<ActionResponseWithId>} Kết quả và ID của CartItem.
 */
export async function addItemAndGetId(productId: string, quantity: number): Promise<ActionResponseWithId> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Vui lòng đăng nhập để thêm sản phẩm." };
    }

    if (!productId || quantity <= 0) {
        return { success: false, message: "Dữ liệu không hợp lệ." };
    }

    try {
        await connectToDB();
        let cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            cart = new Cart({ user: session.user.id, items: [] });
        }

        let cartItem = await CartItem.findOne({
            _id: { $in: cart.items },
            product: productId,
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = new CartItem({ product: productId, quantity });
            await cartItem.save();
            cart.items.push(cartItem._id);
        }
        
        await cart.save();
        revalidatePath("/cart"); 
        
        return { 
            success: true, 
            message: "Thêm sản phẩm thành công.",
            data: { cartItemId: cartItem._id.toString() } 
        };

    } catch (error) {
        console.error("[ADD_ITEM_AND_GET_ID_ERROR]", error);
        return { success: false, message: "Lỗi khi thêm sản phẩm." };
    }
}


/**
 * Thêm sản phẩm vào giỏ hàng và chuyển hướng đến trang giỏ hàng
 * với sản phẩm đó đã được chọn sẵn.
 * @param {string} productId - ID của sản phẩm.
 * @param {number} quantity - Số lượng.
 */
export async function buyNowAndRedirect(productId: string, quantity: number) {
    const session = await auth();
    if (!session?.user?.id) {
        // Trong action có redirect, nên throw error thay vì return
        throw new Error("Vui lòng đăng nhập để mua hàng.");
    }

    if (!productId || quantity <= 0) {
        throw new Error("Dữ liệu không hợp lệ.");
    }

    try {
        await connectToDB();
        let cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            cart = new Cart({ user: session.user.id, items: [] });
        }

        let cartItem = await CartItem.findOne({
            _id: { $in: cart.items },
            product: productId,
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = new CartItem({ product: productId, quantity });
            await cartItem.save();
            cart.items.push(cartItem._id);
        }
        
        await cart.save();
        revalidatePath("/cart");
        
        // Sau khi tất cả các thao tác DB hoàn tất, thực hiện chuyển hướng
        redirect(`/cart?selectItemId=${cartItem._id.toString()}`);

    } catch (error: any) {
         if (error.digest?.startsWith('NEXT_REDIRECT')) {
            throw error; 
        }
        
        console.error("[BUY_NOW_ACTION_ERROR]", error);
        return { error: error.message || "Lỗi khi thực hiện mua hàng." };
    }
}
