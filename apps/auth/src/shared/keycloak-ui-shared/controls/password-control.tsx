import {
    FieldPath,
    FieldValues,
    PathValue,
    UseControllerProps,
    useController
} from "react-hook-form";
import { getRuleValue } from "../utils/getRuleValue";
import { FormLabel } from "./FormLabel";
import { PasswordInput, PasswordInputProps } from "./PasswordInput";

export type PasswordControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = UseControllerProps<T, P> &
    Omit<PasswordInputProps, "name" | "required"> & {
        label: string;
        labelIcon?: string;
        isDisabled?: boolean;
        helperText?: string;
    };

export const PasswordControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>(
    props: PasswordControlProps<T, P>
) => {
    const { labelIcon, ...rest } = props;
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
            <PasswordInput
                required={required}
                id={props.name}
                data-testid={props.name}
                aria-invalid={!!fieldState.error}
                disabled={props.isDisabled}
                placeholder={rest.placeholder ?? props.label}
                {...rest}
                {...field}
            />
            {props.helperText && (
                <p className="text-muted-foreground text-xs mt-1.5">{props.helperText}</p>
            )}
        </FormLabel>
    );
};
