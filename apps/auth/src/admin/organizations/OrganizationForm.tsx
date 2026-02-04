/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/OrganizationForm.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { FormErrorText, TextAreaControl, TextControl } from "../../shared/keycloak-ui-shared";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AttributeForm } from "../components/key-value-form/AttributeForm";
import { keyValueToArray } from "../components/key-value-form/key-value-convert";
import { MultiLineInput } from "../components/multi-line-input/MultiLineInput";

export type OrganizationFormType = AttributeForm &
    Omit<OrganizationRepresentation, "domains" | "attributes"> & {
        domains?: string[];
    };

export const convertToOrg = (org: OrganizationFormType): OrganizationRepresentation => ({
    ...org,
    domains: org.domains?.map(d => ({ name: d, verified: false })),
    attributes: keyValueToArray(org.attributes)
});

/** Güncelleme için: alias Keycloak tarafında değiştirilemediği için payload'dan çıkarılır. */
export const convertToOrgForUpdate = (org: OrganizationFormType): Omit<OrganizationRepresentation, "alias"> => {
    const { alias: _alias, ...rest } = convertToOrg(org);
    return rest;
};

type OrganizationFormProps = {
    readOnly?: boolean;
};

export const OrganizationForm = ({ readOnly = false }: OrganizationFormProps) => {
    const { t } = useTranslation();
    const {
        setValue,
        formState: { errors }
    } = useFormContext();
    const name = useWatch({ name: "name" });

    useEffect(() => {
        if (!readOnly) {
            setValue("alias", name);
        }
    }, [name, readOnly]);

    return (
        <div className="flex flex-col gap-5">
            <TextControl
                label={t("name")}
                name="name"
                rules={{ required: t("required") }}
            />
            <TextControl
                label={t("alias")}
                name="alias"
                labelIcon={t("organizationAliasHelp")}
                isDisabled={readOnly}
            />
            <div className="space-y-2">
                <MultiLineInput
                    id="domain"
                    name="domains"
                    aria-label={t("domain")}
                    addButtonLabel="addDomain"
                    placeholder={t("domain")}
                    labelIcon={t("organizationDomainHelp")}
                />
                {errors?.["domains"]?.message && (
                    <FormErrorText message={errors["domains"].message.toString()} />
                )}
            </div>
            <TextControl
                label={t("redirectUrl")}
                name="redirectUrl"
                labelIcon={t("organizationRedirectUrlHelp")}
            />
            <TextAreaControl name="description" label={t("description")} />
        </div>
    );
};
