import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <Label ref={ref} className={cn(className)} {...props}>
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
    );
  }
);
FormLabel.displayName = "FormLabel";

export { FormLabel };
