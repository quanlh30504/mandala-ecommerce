export const FOOTER_ROUTES = {
  SHIPPING: {
    ONLINE_DELIVERY: "/shipping/online-delivery",
    POLICY: "/shipping/policy", 
    INFO: "/shipping/info",
    CONTACT: "/shipping/contact"
  },
  SUPPORT: {
    FAQ: "/support/faq",
    PAYMENT: "/support/payment",
    DELIVERY: "/support/delivery",
    RETURNS: "/support/returns"
  },
  INFO: {
    ABOUT: "/about",
    PRIVACY: "/privacy-policy",
    TERMS: "/terms-conditions",
    ORDER_RETURNS: "/order-returns"
  },
  ACCOUNT: {
    WISHLIST: "/account/wishlist",
    PROFILE: "/account/profile",
    ORDERS: "/account/orders",
    LOGIN: "/auth/login"
  }
} as const;

export const shippingLinks = [
  {
    href: FOOTER_ROUTES.SHIPPING.ONLINE_DELIVERY,
    text: "Chuyển hàng trực tuyến"
  },
  {
    href: FOOTER_ROUTES.SHIPPING.CONTACT, 
    text: "Điều từ chúng tôi gửi đến"
  },
  {
    href: FOOTER_ROUTES.SHIPPING.POLICY,
    text: "Chính sách vận chuyển"
  },
  {
    href: FOOTER_ROUTES.SHIPPING.INFO,
    text: "Thông tin vận chuyển"
  }
];

export const supportLinks = [
  {
    href: FOOTER_ROUTES.SUPPORT.FAQ,
    text: "Câu chuyện của chúng ta"
  },
  {
    href: FOOTER_ROUTES.SUPPORT.PAYMENT,
    text: "Thanh toán an toàn"
  },
  {
    href: FOOTER_ROUTES.SUPPORT.DELIVERY,
    text: "Tùy chọn Vận Chuyển"
  },
  {
    href: FOOTER_ROUTES.SUPPORT.RETURNS,
    text: "Chính sách vận chuyển"
  }
];

export const informationLinks = [
  {
    href: FOOTER_ROUTES.INFO.ABOUT,
    text: "Về Chúng Tôi"
  },
  {
    href: FOOTER_ROUTES.INFO.TERMS,
    text: "Điều khoản & điều kiện"
  },
  {
    href: FOOTER_ROUTES.INFO.PRIVACY,
    text: "Chính Sách Riêng Tư"
  },
  {
    href: FOOTER_ROUTES.INFO.ORDER_RETURNS,
    text: "Đơn đặt hàng và Returns"
  }
];

export const accountLinks = [
  {
    href: FOOTER_ROUTES.ACCOUNT.WISHLIST,
    text: "Sản phẩm yêu thích"
  },
  {
    href: FOOTER_ROUTES.ACCOUNT.PROFILE,
    text: "Tài khoản"
  },
  {
    href: FOOTER_ROUTES.ACCOUNT.ORDERS,
    text: "Đặt hàng"
  },
  {
    href: FOOTER_ROUTES.ACCOUNT.LOGIN,
    text: "Đăng nhập"
  }
];

export const paymentMethods = [
  {
    src: "/api/images/payments/mastercard.png",
    alt: "Mastercard"
  },
  {
    src: "/api/images/payments/visa.png",
    alt: "Visa"
  },
  {
    src: "/api/images/payments/paypal.png",
    alt: "PayPal"
  },
  {
    src: "/api/images/payments/maestro.png",
    alt: "Maestro"
  }
];
