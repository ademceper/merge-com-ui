/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/SwitchControl.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

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
    };

export const SwitchControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>({
    labelOn,
    stringify,
    defaultValue,
    labelIcon,
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
                                onCheckedChange={(checked) => {
                                    const value = stringify ? checked.toString() : checked;
                                    onChange(value);
                                }}
                            />
                        </div>
                    </div>
                )}
            />
        </FormLabel>
    );
};
