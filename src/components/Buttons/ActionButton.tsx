import { type ReactNode } from "react";
import { Loader2Icon } from "lucide-react";
import { type ButtonProps, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
  type?: "button" | "submit" | "reset";
  asChild?: boolean;
  disabled?: boolean;
}

export default function ActionButton({
  children,
  loading = false,
  loadingText = "Đang xử lý...",
  className,
  variant = "default",
  type = "button",
  asChild = false,
  disabled = false,
  ...rest // props còn lại của Button (variant, size, type, asChild,...)
}: ActionButtonProps) {
  return (
    <Button
      className={cn("flex items-center justify-center", className)}
      disabled={loading || disabled}
      variant={variant}
      type={type}
      asChild={asChild}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
