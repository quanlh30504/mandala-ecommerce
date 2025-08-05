import { useFormStatus } from "react-dom";
import { Loader2Icon } from "lucide-react";
import { type ButtonProps, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Nối classNames

interface SubmitButtonProps extends ButtonProps {
  content: string;
  loadingText?: string;
  className?: string;
}

export default function SubmitButton({
  content,
  loadingText = "Đang xử lý...",
  className,
  ...rest // props còn lại của Button (variant, size, onClick,...)
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={cn("tracking-wider", className)}
      disabled={pending || rest?.disabled}
      {...rest}
    >
      {pending ? (
        <>
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        content
      )}
    </Button>
  );
}
