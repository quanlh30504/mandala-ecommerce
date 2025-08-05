/**
 * ADMINGUARD.TSX - React Component bảo vệ Admin Routes
 * 
 * CHỨC NĂNG CHÍNH:
 * - Wrapper component kiểm tra quyền admin trước khi render children
 * - Redirect users không phải admin về trang chủ
 * - Redirect users chưa đăng nhập về trang login
 * - Hiển thị loading state trong khi check authentication
 * 
 * CÁCH SỬ DỤNG:
 * <AdminGuard>
 *   <AdminDashboard />
 * </AdminGuard>
 * 
 * LOGIC:
 * 1. Check session status (loading/authenticated/unauthenticated)
 * 2. Nếu chưa đăng nhập → redirect /login
 * 3. Nếu không phải admin → redirect /
 * 4. Nếu admin → render children
 * 
 * DEPENDENCIES: NextAuth useSession, Next.js useRouter
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; // Still loading

        if (!session) {
            router.push('/login');
            return;
        }

        // Check if user has admin role
        if (session.user?.roles !== 'admin') {
            router.push('/'); // Redirect to home if not admin
            return;
        }
    }, [session, status, router]);

    // Show loading while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show loading if no session or not admin
    if (!session || session.user?.roles !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang kiểm tra quyền truy cập...</h2>
                    <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
