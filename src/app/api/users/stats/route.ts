import { NextRequest, NextResponse } from "next/server";
import connectToDB from '@/lib/db';
import User from '@/models/User';

// GET /api/users/stats - Lấy thống kê users
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const [
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      activeUsers,
      bannedUsers,
      weeklyUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ roles: 'admin' }),
      User.countDocuments({ roles: { $ne: 'admin' } }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      weeklyUsers,
      activeUsers,
      bannedUsers,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user statistics",
      },
      { status: 500 }
    );
  }
}
