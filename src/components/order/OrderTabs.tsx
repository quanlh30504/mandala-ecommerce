"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/models/Order';

const TABS: { label: string; value?: OrderStatus }[] = [
    { label: "Tất cả đơn", value: undefined },
    { label: "Chờ thanh toán", value: "pending" },
    { label: "Đang xử lý", value: "processing" },
    { label: "Đang vận chuyển", value: "shipped" },
    { label: "Đã giao", value: "delivered" },
    { label: "Đã hủy", value: "cancelled" },
];

export default function OrderTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get('status') as OrderStatus | null;

    const handleTabClick = (status?: OrderStatus) => {
        const params = new URLSearchParams(searchParams);
        if (status) {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        // thay đổi URL mà ko phải tải lại trang
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="border-b mb-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                {TABS.map((tab) => {
                    const isActive = (!currentStatus && !tab.value) || currentStatus === tab.value;
                    return (
                        <button
                            key={tab.label}
                            onClick={() => handleTabClick(tab.value)}
                            className={cn(
                                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none",
                                isActive
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
