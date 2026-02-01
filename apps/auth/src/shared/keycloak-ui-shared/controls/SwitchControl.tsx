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
import { SwitchProps, Switch } from "../../@patternfly/react-core";
import { FormLabel } from "./FormLabel";
import { debeerify } from "../user-profile/utils";

export type SwitchControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = Omit<SwitchProps, "name" | "defaultValue" | "ref"> &
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
                    <Switch
                        {...props}
                        id={props.name}
                        data-testid={debeerify(props.name)}
                        label={labelOn}
                        aria-label={props.label}
                        isChecked={stringify ? value === "true" : value}
                        onChange={(e, checked) => {
                            const value = stringify ? checked.toString() : checked;
                            props.onChange?.(e, checked);
                            onChange(value);
                        }}
                    />
                )}
            />
        </FormLabel>
    );
};
