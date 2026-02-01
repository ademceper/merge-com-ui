/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/user-profile/attribute/ValueSelect.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { KeycloakSelect } from "../../../../shared/keycloak-ui-shared";
import { SelectOption } from "../../../../shared/@patternfly/react-core";
import { useState } from "react";
import { UseControllerProps, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";

type ValueSelectProps = UseControllerProps & {
    selectItems: string[];
};

export const ValueSelect = ({ selectItems, ...rest }: ValueSelectProps) => {
    const { t } = useTranslation();
    const { field } = useController(rest);
    const [open, setOpen] = useState(false);

    return (
        <KeycloakSelect
            onToggle={isOpen => setOpen(isOpen)}
            isOpen={open}
            onSelect={value => {
                field.onChange(value);
                setOpen(false);
            }}
            selections={field.value ? [field.value] : t("choose")}
            placeholderText={t("valuePlaceholder")}
        >
            {selectItems.map(item => (
                <SelectOption key={item} value={item}>
                    {item}
                </SelectOption>
            ))}
        </KeycloakSelect>
    );
};
