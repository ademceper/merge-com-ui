import { Textarea } from "@merge/ui/components/textarea";
import { cn } from "@merge/ui/lib/utils";
import {
    FieldPath,
    FieldValues,
    PathValue,
    UseControllerProps,
    useController
} from "react-hook-form";

import { formTextareaClassName } from "./form-input-styles";
import { FormLabel } from "./FormLabel";

export type TextAreaControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = UseControllerProps<T, P> &
    Omit<React.ComponentProps<typeof Textarea>, "name"> & {
        label: string;
        labelIcon?: string;
        isDisabled?: boolean;
    };

export const TextAreaControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>(
    props: TextAreaControlProps<T, P>
) => {
    const required = !!props.rules?.required;
    const defaultValue = props.defaultValue ?? ("" as PathValue<T, P>);

    const { field, fieldState } = useController({
        ...props,
        defaultValue
    });

    return (
        <FormLabel
            isRequired={required}
            label={props.label}
            labelIcon={props.labelIcon}
            name={props.name}
            error={fieldState.error}
            showLabel={false}
        >
            <Textarea
                {...props}
                {...field}
                required={required}
                id={props.name}
                data-testid={props.name}
                aria-invalid={!!fieldState.error}
                disabled={props.isDisabled}
                placeholder={props.placeholder ?? props.label}
                className={cn(formTextareaClassName, props.className)}
            />
        </FormLabel>
    );
};
