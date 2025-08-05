import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { ActivityItem } from "@/components/admin/ActivityItem";
import { ProgressBar } from "@/components/admin/ProgressBar";
import {
  statsData,
  activityData,
  progressData,
} from "@/constants/dashboardData";

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Chào mừng bạn đến với trang quản trị
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                iconColor={stat.iconColor}
              />
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Hoạt động gần đây
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {activityData.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      title={activity.title}
                      time={activity.time}
                      icon={activity.icon}
                      iconColor={activity.iconColor}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thống kê nhanh
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {progressData.map((progress, index) => (
                    <ProgressBar
                      key={index}
                      label={progress.label}
                      percentage={progress.percentage}
                      color={progress.color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
