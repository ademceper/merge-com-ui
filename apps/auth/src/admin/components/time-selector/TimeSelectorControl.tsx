import { Label } from "@merge/ui/components/label";
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    UseControllerProps,
    useFormContext
} from "react-hook-form";
import { FormErrorText, HelpItem } from "../../../shared/keycloak-ui-shared";
import { TimeSelector, TimeSelectorProps } from "./TimeSelector";

export type NumberControlOption = {
    key: string;
    value: string;
};

export type TimeSelectorControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = Omit<TimeSelectorProps, "name"> &
    UseControllerProps<T, P> & {
        name: string;
        label?: string;
        labelIcon?: string;
        controller: Omit<ControllerProps, "name" | "render">;
    };

export const TimeSelectorControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>({
    name,
    label,
    controller,
    labelIcon,
    ...rest
}: TimeSelectorControlProps<T, P>) => {
    const {
        control,
        formState: { errors }
    } = useFormContext();

    const error = errors[name];

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="flex items-center gap-1">
                {controller.rules?.required === true && <span className="text-destructive">*</span>}
                {label || name}
                {labelIcon && <HelpItem helpText={labelIcon} fieldLabelId={name} />}
            </Label>
            <Controller
                {...controller}
                name={name}
                control={control}
                render={({ field }) => (
                    <TimeSelector
                        {...rest}
                        id={name}
                        data-testid={name}
                        value={field.value}
                        onChange={field.onChange}
                        validated={error ? "error" : "default"}
                    />
                )}
            />
            {error && (
                <FormErrorText
                    data-testid={`${name}-helper`}
                    message={error.message as string}
                />
            )}
        </div>
    );
};
