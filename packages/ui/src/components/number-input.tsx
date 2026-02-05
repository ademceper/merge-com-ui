import * as React from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { cn } from "@merge/ui/lib/utils";
import { Input } from "./input";
import { Button } from "./button";

const numberInputBase =
  "h-12 rounded-lg bg-muted dark:bg-input/30 border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring px-2.5 py-1 transition-colors w-full min-w-0 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-input/50 dark:disabled:bg-input/80 aria-invalid:ring-destructive/20 aria-invalid:ring-2 md:text-sm text-base";

const hideNativeSpinner =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export interface NumberInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value?: number | "";
  onChange?: (value: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  customStepper?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      onChange,
      min,
      max,
      step = 1,
      disabled,
      customStepper = true,
      ...props
    },
    ref
  ) => {
    const numValue = value === "" || value == null ? "" : Number(value);
    const numMin = min != null ? Number(min) : undefined;
    const numMax = max != null ? Number(max) : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v === "") {
        onChange?.("");
        return;
      }
      const n = Number(v);
      onChange?.(Number.isNaN(n) ? "" : n);
    };

    const clamp = (n: number) => {
      let v = n;
      if (numMin != null && v < numMin) v = numMin;
      if (numMax != null && v > numMax) v = numMax;
      return v;
    };

    const handleStep = (delta: number) => {
      const current = numValue === "" ? (numMin ?? 0) : Number(numValue);
      const next = clamp(current + delta);
      onChange?.(next);
    };

    if (!customStepper) {
      return (
        <Input
          ref={ref}
          type="number"
          className={cn(hideNativeSpinner, className)}
          value={value === "" ? "" : value}
          onChange={(e) => {
            const v = e.target.value;
            onChange?.(v === "" ? "" : Number(v));
          }}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          {...props}
        />
      );
    }

    return (
      <div className={cn("relative flex w-full items-stretch", className)}>
        <input
          ref={ref}
          type="number"
          data-slot="input"
          className={cn(
            numberInputBase,
            hideNativeSpinner,
            "pr-10"
          )}
          value={value === "" ? "" : value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          {...props}
        />
        <div className="absolute right-0 top-0 flex h-full flex-col border-l border-border/50 rounded-r-lg overflow-hidden [&_button]:h-1/2 [&_button]:min-h-0">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-1/2 rounded-none border-0 shadow-none hover:bg-muted/80"
            tabIndex={-1}
            disabled={disabled}
            aria-label="Increment"
            onClick={() => handleStep(step ?? 1)}
          >
            <CaretUp className="size-4" weight="bold" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-1/2 rounded-none border-0 shadow-none hover:bg-muted/80"
            tabIndex={-1}
            disabled={disabled}
            aria-label="Decrement"
            onClick={() => handleStep(-(step ?? 1))}
          >
            <CaretDown className="size-4" weight="bold" />
          </Button>
        </div>
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
