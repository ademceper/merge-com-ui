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

/**
 * Güncelleme için: Keycloak alias değişikliğine izin vermiyor ("Cannot change the alias").
 * Sadece güncellenebilir alanları açıkça gönderiyoruz; alias ve id hiç eklenmiyor.
 */
export const convertToOrgForUpdate = (org: OrganizationFormType): Omit<OrganizationRepresentation, "alias" | "id"> => {
    return {
        name: org.name,
        description: org.description,
        domains: org.domains?.map(d => ({ name: d, verified: false })),
        redirectUrl: org.redirectUrl,
        attributes: keyValueToArray(org.attributes),
        enabled: org.enabled
    };
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
