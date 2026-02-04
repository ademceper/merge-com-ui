import { Input } from "@merge/ui/components/input";
import { cn } from "@merge/ui/lib/utils";
import { ReactNode } from "react";
import {
    FieldPath,
    FieldValues,
    PathValue,
    UseControllerProps,
    useController
} from "react-hook-form";
import { getRuleValue } from "../utils/getRuleValue";
import { formInputClassName } from "./form-input-styles";
import { FormLabel } from "./FormLabel";

export type TextControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = UseControllerProps<T, P> &
    Omit<React.ComponentProps<typeof Input>, "name" | "required"> & {
        id?: string;
        label: string;
        labelIcon?: string | ReactNode;
        isDisabled?: boolean;
        readOnlyVariant?: string;
        validated?: string;
        customIcon?: ReactNode;
        helperText?: string;
        "data-testid"?: string;
        type?: string;
    };

export const TextControl = <T extends FieldValues, P extends FieldPath<T> = FieldPath<T>>(
    props: TextControlProps<T, P>
) => {
    const { labelIcon, helperText, ...rest } = props;
    const required = !!getRuleValue(props.rules?.required);
    const defaultValue = props.defaultValue ?? ("" as PathValue<T, P>);

    const { field, fieldState } = useController({
        ...props,
        defaultValue
    });

    return (
        <FormLabel
            name={props.name}
            label={props.label}
            labelIcon={labelIcon}
            isRequired={required}
            error={fieldState.error}
            showLabel={false}
        >
            <Input
                {...rest}
                {...field}
                required={required}
                id={props.name}
                data-testid={props["data-testid"] || props.name}
                aria-invalid={!!fieldState.error}
                disabled={props.isDisabled}
                placeholder={rest.placeholder ?? props.label}
                className={cn(formInputClassName, rest.className)}
            />
            {helperText && (
                <p className="text-muted-foreground text-xs mt-1.5">{helperText}</p>
            )}
        </FormLabel>
    );
};
