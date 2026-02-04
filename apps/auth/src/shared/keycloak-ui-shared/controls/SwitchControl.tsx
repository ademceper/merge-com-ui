import {
    Controller,
    FieldValues,
    FieldPath,
    UseControllerProps,
    PathValue,
    useFormContext
} from "react-hook-form";
import { Switch } from "@merge/ui/components/switch";
import { FormLabel } from "./FormLabel";
import { debeerify } from "../user-profile/utils";

export type SwitchControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = Omit<React.ComponentProps<typeof Switch>, "name" | "checked" | "onCheckedChange"> &
    UseControllerProps<any, P> & {
        name: string;
        label?: string;
        labelIcon?: string;
        labelOn: string;
        labelOff: string;
        stringify?: boolean;
        isDisabled?: boolean;
        /** Called when switch value changes; receives (value: boolean). Named onValueChange to avoid conflict with form onChange. */
        onValueChange?: (value: boolean) => void;
    };

export const SwitchControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>({
    labelOn,
    stringify,
    defaultValue,
    labelIcon,
    isDisabled,
    onValueChange: onValueChangeProp,
    ...props
}: SwitchControlProps<T, P>) => {
    const fallbackValue = stringify ? "false" : false;
    const defValue = defaultValue ?? (fallbackValue as PathValue<T, P>);
    const { control } = useFormContext();
    return (
        <FormLabel
            hasNoPaddingTop
            name={props.name}
            isRequired={props.rules?.required === true}
            label={props.label}
            labelIcon={labelIcon}
        >
            <Controller
                control={control}
                name={props.name}
                defaultValue={defValue}
                render={({ field: { onChange, value } }) => (
                    <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-sm font-medium">{props.label}</span>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {stringify ? (value === "true" ? labelOn : props.labelOff) : (value ? labelOn : props.labelOff)}
                            </span>
                            <Switch
                                {...props}
                                id={props.name}
                                data-testid={debeerify(props.name)}
                                aria-label={props.label}
                                checked={stringify ? value === "true" : value}
                                disabled={isDisabled}
                                onCheckedChange={(checked) => {
                                    const value = stringify ? checked.toString() : checked;
                                    onChange(value);
                                    onValueChangeProp?.(checked);
                                }}
                            />
                        </div>
                    </div>
                )}
            />
        </FormLabel>
    );
};
