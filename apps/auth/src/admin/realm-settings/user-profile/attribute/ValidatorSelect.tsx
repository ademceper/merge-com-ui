/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/user-profile/attribute/ValidatorSelect.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { KeycloakSelect } from "../../../../shared/keycloak-ui-shared";
import { SelectOption } from "../../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../../../context/server-info/ServerInfoProvider";
import useToggle from "../../../utils/useToggle";

type ValidatorSelectProps = {
    selectedValidators: string[];
    onChange: (validator: ComponentTypeRepresentation) => void;
};

export const ValidatorSelect = ({
    selectedValidators,
    onChange
}: ValidatorSelectProps) => {
    const { t } = useTranslation();
    const allValidator: ComponentTypeRepresentation[] =
        useServerInfo().componentTypes?.["org.keycloak.validate.Validator"] || [];
    const validators = useMemo(
        () => allValidator.filter(({ id }) => !selectedValidators.includes(id)),
        [selectedValidators]
    );
    const [open, toggle] = useToggle();
    const [value, setValue] = useState<ComponentTypeRepresentation>();

    return (
        <div className="space-y-2">
            <Label htmlFor="validator">{t("validatorType")}</Label>
            <KeycloakSelect
                toggleId="validator"
                onToggle={toggle}
                onSelect={value => {
                    const option = value as ComponentTypeRepresentation;
                    onChange(option);
                    setValue(option);
                    toggle();
                }}
                selections={value?.id}
                variant="single"
                aria-label={t("selectOne")}
                isOpen={open}
                placeholderText={t("choose")}
                menuAppendTo="parent"
                maxHeight={300}
            >
                {validators.map(option => (
                    <SelectOption
                        selected={value?.id === option.id}
                        key={option.id}
                        value={option}
                        description={option.helpText}
                    >
                        {option.id}
                    </SelectOption>
                ))}
            </KeycloakSelect>
        </div>
    );
};
