/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/user-profile/attribute/KeySelect.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    KeycloakSelect,
    SelectControlOption
} from "../../../../shared/keycloak-ui-shared";
import { Input } from "@merge/ui/components/input";
import { SelectOption } from "../../../../shared/keycloak-ui-shared";
import { useState } from "react";
import { UseControllerProps, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useToggle from "../../../utils/useToggle";

type KeySelectProp = UseControllerProps & {
    selectItems: SelectControlOption[];
};

export const KeySelect = ({ selectItems, ...rest }: KeySelectProp) => {
    const { t } = useTranslation();
    const [open, toggle] = useToggle();
    const { field } = useController(rest);
    const [custom, setCustom] = useState(
        !selectItems.map(({ key }) => key).includes(field.value)
    );

    return (
        <div className="flex gap-2">
            <div className={custom ? "w-1/6" : "w-full"}>
                <KeycloakSelect
                    onToggle={() => toggle()}
                    isOpen={open}
                    onSelect={value => {
                        if (value) {
                            setCustom(false);
                        }
                        field.onChange(value);
                        toggle();
                    }}
                    selections={!custom ? [field.value] : ""}
                >
                    {[
                        <SelectOption key="custom" onClick={() => setCustom(true)}>
                            {t("customAttribute")}
                        </SelectOption>,
                        ...selectItems.map(item => (
                            <SelectOption key={item.key} value={item.key}>
                                {item.value}
                            </SelectOption>
                        ))
                    ]}
                </KeycloakSelect>
            </div>
            {custom && (
                <div className="flex-1">
                    <Input
                        id="customValue"
                        data-testid={rest.name}
                        placeholder={t("keyPlaceholder")}
                        value={field.value}
                        onChange={field.onChange}
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
};
