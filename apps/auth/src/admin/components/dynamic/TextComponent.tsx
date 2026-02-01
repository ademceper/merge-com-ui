/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/TextComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { FormGroup } from "../../../shared/@patternfly/react-core";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeycloakTextArea, HelpItem } from "../../../shared/keycloak-ui-shared";
import type { ComponentProps } from "./components";

export const TextComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    required,
    isDisabled = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const { register } = useFormContext();

    return (
        <FormGroup
            label={t(label!)}
            labelIcon={<HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />}
            fieldId={name!}
            required={required}
        >
            <KeycloakTextArea
                id={name!}
                data-testid={name}
                isDisabled={isDisabled}
                defaultValue={defaultValue?.toString()}
                {...register(convertToName(name!))}
            />
        </FormGroup>
    );
};
