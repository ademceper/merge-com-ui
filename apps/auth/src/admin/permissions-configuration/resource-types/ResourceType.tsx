/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/resource-types/ResourceType.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { Label } from "@merge/ui/components/label";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useFormContext } from "react-hook-form";
import { useState, type JSX } from "react";
import { GroupSelect } from "./GroupSelect";
import { UserSelect } from "../../components/users/UserSelect";
import { RoleSelect } from "./RoleSelect";
import { ClientSelectComponent } from "./ClientSelectComponent";

type ResourceTypeProps = {
    withEnforceAccessTo?: boolean;
    resourceType: string;
};

export const COMPONENTS: {
    [index: string]: (props: any) => JSX.Element;
} = {
    users: UserSelect,
    clients: ClientSelectComponent,
    groups: GroupSelect,
    roles: RoleSelect
} as const;

export const isValidComponentType = (value: string) => value in COMPONENTS;

export const ResourceType = ({
    resourceType,
    withEnforceAccessTo = true
}: ResourceTypeProps) => {
    const { t } = useTranslation();
    const form = useFormContext();
    const resourceIds: string[] = form.getValues("resources");
    const normalizedResourceType = resourceType.toLowerCase();

    const [isSpecificResources, setIsSpecificResources] = useState(
        resourceIds?.some(id => id !== resourceType) || !withEnforceAccessTo
    );

    function getComponentType() {
        if (isValidComponentType(normalizedResourceType)) {
            return COMPONENTS[normalizedResourceType];
        }
        return null;
    }

    const ComponentType = getComponentType();

    return (
        <>
            {withEnforceAccessTo && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="EnforceAccessTo">{t("enforceAccessTo")} *</Label>
                        <HelpItem
                            helpText={t("enforceAccessToHelpText")}
                            fieldLabelId="enforce-access-to"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                id="allResources"
                                data-testid="allResources"
                                checked={!isSpecificResources}
                                name="EnforceAccessTo"
                                onChange={() => {
                                    setIsSpecificResources(false);
                                    form.setValue("resources", []);
                                }}
                            />
                            {t(`allResourceType`, { resourceType })}
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                id="specificResources"
                                data-testid="specificResources"
                                checked={isSpecificResources}
                                name="EnforceAccessTo"
                                onChange={() => {
                                    setIsSpecificResources(true);
                                    form.setValue("resources", []);
                                }}
                            />
                            {t(`specificResourceType`, { resourceType })}
                        </label>
                    </div>
                </div>
            )}
            {isSpecificResources && ComponentType && (
                <ComponentType
                    name={withEnforceAccessTo ? "resources" : "resource"}
                    label={`${normalizedResourceType}Resources`}
                    helpText={t("resourceTypeHelpText", {
                        resourceType: normalizedResourceType
                    })}
                    defaultValue={[]}
                    variant={withEnforceAccessTo ? "typeaheadMulti" : "typeahead"}
                    isRequired={withEnforceAccessTo}
                    isRadio={!withEnforceAccessTo}
                />
            )}
        </>
    );
};
