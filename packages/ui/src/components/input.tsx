import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

import { cn } from "@merge/ui/lib/utils";

const inputVariants = cva(
  "w-full min-w-0 rounded-lg text-base transition-colors outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-transparent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80",
        secondary:
          "border-0 bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
      },
      size: {
        default: "h-8 px-2.5 py-1",
        xs: "h-6 px-2 text-xs",
        sm: "h-7 px-2.5 text-[0.8rem]",
        lg: "h-9 px-2.5",
        xl: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>;

function Input({
  className,
  type,
  variant = "default",
  size = "default",
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  if (isPassword) {
    return (
      <div className="relative w-full">
        <input
          type={inputType}
          data-slot="input"
          className={cn(inputVariants({ variant, size }), "pr-10", className)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeSlashIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ variant, size }),
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Input, inputVariants };
