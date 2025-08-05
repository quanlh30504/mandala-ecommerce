import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  CheckCircle,
  AlertTriangle,
  UserPlus
} from "lucide-react";

export const statsData = [
  {
    title: "Tổng sản phẩm",
    value: "1,234",
    change: {
      value: "+12.5%",
      isPositive: true
    },
    icon: Package,
    iconColor: {
      bg: "bg-blue-100",
      text: "text-blue-600"
    }
  },
  {
    title: "Người dùng",
    value: "856",
    change: {
      value: "+8.2%",
      isPositive: true
    },
    icon: Users,
    iconColor: {
      bg: "bg-green-100",
      text: "text-green-600"
    }
  },
  {
    title: "Đơn hàng",
    value: "2,341",
    change: {
      value: "-2.1%",
      isPositive: false
    },
    icon: ShoppingCart,
    iconColor: {
      bg: "bg-yellow-100",
      text: "text-yellow-600"
    }
  },
  {
    title: "Doanh thu",
    value: "₫12.5M",
    change: {
      value: "+15.3%",
      isPositive: true
    },
    icon: DollarSign,
    iconColor: {
      bg: "bg-purple-100",
      text: "text-purple-600"
    }
  }
];

export const activityData = [
  {
    title: "Sản phẩm mới được thêm",
    time: "2 phút trước",
    icon: Plus,
    iconColor: {
      bg: "bg-blue-100",
      text: "text-blue-600"
    }
  },
  {
    title: "Đơn hàng #1234 đã hoàn thành",
    time: "15 phút trước",
    icon: CheckCircle,
    iconColor: {
      bg: "bg-green-100",
      text: "text-green-600"
    }
  },
  {
    title: "Cảnh báo: Sản phẩm sắp hết hàng",
    time: "1 giờ trước",
    icon: AlertTriangle,
    iconColor: {
      bg: "bg-yellow-100",
      text: "text-yellow-600"
    }
  },
  {
    title: "Người dùng mới đăng ký",
    time: "2 giờ trước",
    icon: UserPlus,
    iconColor: {
      bg: "bg-purple-100",
      text: "text-purple-600"
    }
  }
];

export const progressData = [
  {
    label: "Sản phẩm bán chạy",
    percentage: 85,
    color: "bg-blue-600"
  },
  {
    label: "Đánh giá tích cực",
    percentage: 92,
    color: "bg-green-600"
  },
  {
    label: "Khách hàng quay lại",
    percentage: 68,
    color: "bg-yellow-600"
  },
  {
    label: "Tỷ lệ chuyển đổi",
    percentage: 3.2,
    color: "bg-purple-600"
  }
];
