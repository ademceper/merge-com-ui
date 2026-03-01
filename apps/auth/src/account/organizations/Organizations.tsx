/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/organizations/Organizations.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getUserOrganizations } from "../api/methods";
import { Page } from "../components/page/Page";
import { Environment } from "../environment";
import { usePromise } from "../utils/usePromise";
import { Buildings } from "@phosphor-icons/react";

type OrgRepresentation = {
    id?: string;
    name?: string;
    description?: string;
    enabled?: boolean;
    [key: string]: unknown;
};

export const Organizations = () => {
    const { t } = useTranslation();
    const context = useEnvironment<Environment>();

    const [userOrgs, setUserOrgs] = useState<OrgRepresentation[]>([]);

    usePromise(signal => getUserOrganizations({ signal, context }), setUserOrgs);

    if (!userOrgs) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <Page title={t("organizations")} description={t("organizationDescription")}>
            {userOrgs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    <Buildings className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>{t("emptyUserOrganizations")}</p>
                    <p className="text-sm mt-1">{t("emptyUserOrganizationsInstructions")}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {userOrgs.map(org => (
                        <div key={org.id ?? org.name} className="rounded-md border p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-primary/10 shrink-0">
                                    <Buildings className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-base font-medium">{org.name}</div>
                                    {org.description && (
                                        <div className="text-sm text-muted-foreground">
                                            {org.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Page>
    );
};

export default Organizations;
