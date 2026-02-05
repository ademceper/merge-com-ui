import { Field, FieldContent, FieldLabel } from "@merge/ui/components/field";
import { cn } from "@merge/ui/lib/utils";
import { PropsWithChildren, ReactNode } from "react";
import { FieldError as RHFError, FieldValues, Merge } from "react-hook-form";
import { FormErrorText } from "./FormErrorText";
import { HelpItem } from "./HelpItem";

export type FieldProps<T extends FieldValues = FieldValues> = {
    id?: string | undefined;
    label?: string;
    name: string;
    labelIcon?: string | ReactNode;
    error?: RHFError | Merge<RHFError, T>;
    isRequired?: boolean;
    hasNoPaddingTop?: boolean;
    /** When false, label is not shown (use placeholder instead). Label is still rendered as sr-only for accessibility. */
    showLabel?: boolean;
};

type FormLabelProps = FieldProps & Omit<React.ComponentProps<"div">, "children">;

export const FormLabel = ({
    id,
    name,
    label,
    labelIcon,
    error,
    children,
    isRequired,
    hasNoPaddingTop,
    showLabel = false,
    ...rest
}: PropsWithChildren<FormLabelProps>) => (
    <Field className={hasNoPaddingTop ? "w-full pt-0" : "w-full"} {...rest}>
        <FieldLabel
            htmlFor={id || name}
            className={cn("flex items-center gap-1.5 flex-nowrap", !showLabel && "sr-only")}
        >
            {label || name}
            {isRequired && <span className="text-destructive">*</span>}
            {labelIcon && <HelpItem helpText={labelIcon} fieldLabelId={id || name} />}
        </FieldLabel>
        <FieldContent>
            {children}
            {error?.message && (
                <FormErrorText data-testid={`${name}-helper`} message={error.message} />
            )}
        </FieldContent>
    </Field>
);
