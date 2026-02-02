/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/policies/PolicyRow.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type PasswordPolicyTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/passwordPolicyTypeRepresentation";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { MinusCircle } from "@phosphor-icons/react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormErrorText, HelpItem } from "../../../shared/keycloak-ui-shared";


type PolicyRowProps = {
    policy: PasswordPolicyTypeRepresentation;
    onRemove: (id?: string) => void;
};

export const PolicyRow = ({
    policy: { id, configType, defaultValue, displayName },
    onRemove
}: PolicyRowProps) => {
    const { t } = useTranslation();
    const {
        control,
        register,
        formState: { errors }
    } = useFormContext();

    const error = errors[id!];

    return (
        <div className="space-y-2">
            <Label htmlFor={id!} className="flex items-center gap-1">
                {displayName} *
                <HelpItem helpText={t(`passwordPoliciesHelp.${id}`)} fieldLabelId={id!} />
            </Label>
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    {configType && configType !== "int" && (
                        <Input
                            id={id}
                            data-testid={id}
                            {...register(id!, { required: true })}
                            defaultValue={defaultValue}
                            className={error ? "border-destructive" : ""}
                        />
                    )}
                    {configType === "int" && (
                        <Controller
                            name={id!}
                            defaultValue={Number.parseInt(defaultValue || "0")}
                            control={control}
                            render={({ field }) => {
                                const MIN_VALUE = 0;
                                const setValue = (newValue: number) =>
                                    field.onChange(Math.max(newValue, MIN_VALUE));
                                const value = Number(field.value);

                                return (
                                    <Input
                                        id={id}
                                        type="number"
                                        min={MIN_VALUE}
                                        value={value}
                                        onChange={e => {
                                            const newValue = Number(e.target.value);
                                            setValue(!isNaN(newValue) ? newValue : 0);
                                        }}
                                        className="keycloak__policies_authentication__number-field"
                                    />
                                );
                            }}
                        />
                    )}
                    {!configType && (
                        <Switch
                            id={id!}
                            checked
                            disabled
                            aria-label={displayName}
                        />
                    )}
                </div>
                <Button
                    type="button"
                    data-testid={`remove-${id}`}
                    variant="ghost"
                    size="icon"
                    className="keycloak__policies_authentication__minus-icon"
                    onClick={() => onRemove(id)}
                    aria-label={t("remove")}
                >
                    <MinusCircle className="size-4" />
                </Button>
            </div>
            {error && <FormErrorText message={t("required")} />}
        </div>
    );
};
