"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { userService } from "@/services/userService";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  roles?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  weeklyUsers: number;
  activeUsers: number;
  bannedUsers: number;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch users
  const fetchUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        page,
        limit: usersPerPage,
        search: search || undefined,
      });

      if (response.success && response.data) {
        // Convert IUser[] to User[]
        const convertedUsers: User[] = response.data.map((user: any) => ({
          _id: user._id?.toString() || "",
          name: user.name,
          email: user.email,
          phone: user.phone,
          roles: user.roles,
          isActive: user.isActive,
          createdAt: user.createdAt,
        }));
        setUsers(convertedUsers);
        setTotalPages(response.totalPages || 1);
        setTotalUsers(response.total || 0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await userService.updateUser(userId, {
        isActive: !currentStatus,
      });

      if (response.success) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, isActive: !currentStatus } : user
          )
        );
        await fetchStats();
        toast.success(
          currentStatus
            ? "Đã khóa tài khoản người dùng"
            : "Đã mở khóa tài khoản người dùng"
        );
      } else {
        toast.error(
          response.error || "Có lỗi xảy ra khi cập nhật trạng thái người dùng"
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái người dùng");
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchUsers(1, value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchUsers(1, "");
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý người dùng
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý thông tin người dùng trong hệ thống
              </p>
            </div>
            <button
              onClick={() => {
                fetchStats();
                fetchUsers(currentPage, searchTerm);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Làm mới
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-600">Tổng số</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalUsers}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-600">Quản trị viên</div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalAdmins}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-600">Người dùng</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalRegularUsers}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-600">Hoạt động</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.activeUsers}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-600">Bị khóa</div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.bannedUsers}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-600">Tuần này</div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.weeklyUsers}
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Danh sách người dùng</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số điện thoại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vai trò
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr
                          key={user._id?.toString()}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.phone || (
                              <span className="text-gray-400">
                                Chưa cập nhật
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.roles === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.roles === "admin"
                                ? "Quản trị viên"
                                : "Người dùng"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? "Hoạt động" : "Bị khóa"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {user.roles === "admin" ? (
                              <span className="px-3 py-1 text-sm text-gray-500 italic">
                                Quản trị viên
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  toggleUserStatus(
                                    user._id!,
                                    user.isActive || false
                                  )
                                }
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  user.isActive
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                {user.isActive ? "Khóa" : "Mở khóa"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Hiển thị {(currentPage - 1) * usersPerPage + 1} đến{" "}
                        {Math.min(currentPage * usersPerPage, totalUsers)} của{" "}
                        {totalUsers} người dùng
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>

                      {/* Page numbers */}
                      <div className="flex space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 text-sm rounded ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}

                        {totalPages > 5 && (
                          <>
                            {currentPage < totalPages - 2 && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className={`px-3 py-1 text-sm rounded ${
                                currentPage === totalPages
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {!loading && users.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Không tìm thấy người dùng nào
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
