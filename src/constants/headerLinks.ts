export interface MenuItem {
  href?: string;
  text: string;
  action?: string;
}

export const guestMenuItems: MenuItem[] = [
  {
    href: "/login",
    text: "Đăng nhập"
  },
  {
    href: "/register",
    text: "Đăng ký"
  }
];

export const userMenuItems: MenuItem[] = [
  {
    href: "/profile",
    text: "Hồ sơ cá nhân"
  },
  {
    href: "/profile/orders",
    text: "Đơn hàng của tôi"
  },
  {
    action: "logout",
    text: "Đăng xuất"
  }
];

export const HEADER_ROUTES = {
  HOME: "/",
  ABOUT: "/aboutus",
  PRODUCTS: "/products",
  NEWS: "/news",
  MAP: "/map",
  CONTACT: "/contact",
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register"
  },
  ACCOUNT: {
    WISHLIST: "/account/wishlist",
    CART: "/cart"
  }
} as const;

export const navigationItems = [
  {
    href: HEADER_ROUTES.HOME,
    text: "TRANG CHỦ",
    hasDropdown: false
  },
  {
    href: HEADER_ROUTES.ABOUT,
    text: "GIỚI THIỆU",
    hasDropdown: false
  },
  {
    href: HEADER_ROUTES.PRODUCTS,
    text: "SẢN PHẨM",
    hasDropdown: true
  },
  {
    href: HEADER_ROUTES.NEWS,
    text: "TIN TỨC",
    hasDropdown: false
  },
  {
    href: HEADER_ROUTES.MAP,
    text: "BẢN ĐỒ",
    hasDropdown: false
  },
  {
    href: HEADER_ROUTES.CONTACT,
    text: "LIÊN HỆ",
    hasDropdown: false
  }
];
