import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface ContactItemProps {
  icon: LucideIcon;
  children: ReactNode;
}

export default function ContactItem({ icon: Icon, children }: ContactItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-[#8BC34A] mt-1 flex-shrink-0" />
      <div className="text-sm text-gray-300">{children}</div>
    </div>
  );
}
