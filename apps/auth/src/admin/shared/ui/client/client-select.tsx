import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { SelectField } from "@/shared/keycloak-ui-shared";
import { useClientsByValues } from "@/admin/shared/api/use-clients-by-values";
import { useClientsSearch } from "@/admin/shared/api/use-clients-search";
import type { PermissionsConfigurationTabsParams } from "@/admin/shared/lib/route-helpers";
import type { ComponentProps } from "../dynamic/components";

type ClientSelectProps = Omit<ComponentProps, "convertToName"> & {
    variant?: string;
    isRequired?: boolean;
    clientKey?: keyof ClientRepresentation;
    placeholderText?: string;
};

export const ClientSelect = ({
    name,
    label,
    helpText,
    defaultValue,
    isDisabled = false,
    isRequired,
    variant = "typeahead",
    clientKey = "clientId",
    placeholderText
}: ClientSelectProps) => {
    const { t } = useTranslation();

    const [search, setSearch] = useState("");
    const { tab } = useParams({ strict: false }) as PermissionsConfigurationTabsParams;

    const { control } = useFormContext();
    const value = useWatch({
        control,
        name: name!,
        defaultValue: defaultValue || ""
    });

    const getValue = (): string[] => {
        if (typeof value === "string") {
            return [value];
        }
        return value || [];
    };

    const { data: clients = [] } = useClientsSearch(search);
    const { data: selectedClients } = useClientsByValues(getValue(), clientKey);

    return (
        <SelectField
            name={name!}
            label={tab !== "evaluation" ? t(label!) : t("client")}
            labelIcon={tab !== "evaluation" ? t(helpText!) : t("selectClient")}
            defaultValue={defaultValue || ""}
            rules={{
                required: {
                    value: isRequired || false,
                    message: t("required")
                }
            }}
            options={clients.map(client => ({
                key: client[clientKey] as string,
                value: client.clientId!
            }))}
            placeholderText={placeholderText}
        />
    );
};
