import Link from "next/link";

interface BreadcrumbProps {
    current: string;
}

export default function Breadcrumb({ current }: BreadcrumbProps) {
    return (
        <div className="text-sm text-gray-500 mb-4 border-b border-gray-300 pb-2">
            <Link href="/" className="hover:underline">Home</Link> &gt;{" "}
            <span className="text-green-600 font-medium">{current}</span>
        </div>
    );
}
