/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-roles/UsersInRoleTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useHelp } from "../../shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import type { ClientRoleParams } from "../clients/routes/ClientRole";
import { ListEmptyState } from "../../shared/keycloak-ui-shared";
import { KeycloakDataTable } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { emptyFormatter, upperCaseFormatter } from "../util";
import { useParams } from "../utils/useParams";

export const UsersInRoleTab = () => {
    const { adminClient } = useAdminClient();

    const navigate = useNavigate();
    const { realm } = useRealm();

    const { t } = useTranslation();
    const { id, clientId } = useParams<ClientRoleParams>();

    const loader = async (first?: number, max?: number) => {
        const role = await adminClient.roles.findOneById({ id: id });
        if (!role) {
            throw new Error(t("notFound"));
        }

        if (role.clientRole) {
            return adminClient.clients.findUsersWithRole({
                roleName: role.name!,
                id: clientId,
                briefRepresentation: true,
                first,
                max
            });
        }

        return adminClient.roles.findUsersWithRole({
            name: role.name!,
            briefRepresentation: true,
            first,
            max
        });
    };

    const { enabled } = useHelp();

    return (
        <section className="py-6 bg-muted/30" data-testid="users-page">
            <KeycloakDataTable
                isPaginated
                loader={loader}
                ariaLabelKey="roleList"
                searchPlaceholderKey=""
                data-testid="users-in-role-table"
                toolbarItem={
                    enabled && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="kc-who-will-appear-button"
                                    key="who-will-appear-button"
                                >
                                    <Question className="size-4 mr-1" />
                                    {t("whoWillAppearLinkTextRoles")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="max-w-sm" align="start">
                                <div className="space-y-2 text-sm">
                                    <p>
                                        {t("whoWillAppearPopoverTextRoles")}
                                        <Button
                                            variant="link"
                                            className="kc-groups-link p-0 h-auto ml-1"
                                            onClick={() => navigate(`/${realm}/groups`)}
                                        >
                                            {t("groups")}
                                        </Button>
                                        {t("or")}
                                        <Button
                                            variant="link"
                                            className="kc-users-link p-0 h-auto ml-1"
                                            onClick={() => navigate(`/${realm}/users`)}
                                        >
                                            {t("users")}.
                                        </Button>
                                    </p>
                                    <p className="text-muted-foreground">{t("whoWillAppearPopoverFooterText")}</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )
                }
                emptyState={
                    <ListEmptyState
                        hasIcon={true}
                        message={t("noDirectUsers")}
                        instructions={
                            <div>
                                {t("noUsersEmptyStateDescription")}
                                <Button
                                    className="kc-groups-link-empty-state"
                                    variant="link"
                                    onClick={() => navigate(`/${realm}/groups`)}
                                >
                                    {t("groups")}
                                </Button>
                                {t("or")}
                                <Button
                                    className="kc-users-link-empty-state"
                                    variant="link"
                                    onClick={() => navigate(`/${realm}/users`)}
                                >
                                    {t("users")}
                                </Button>
                                {t("noUsersEmptyStateDescriptionContinued")}
                            </div>
                        }
                    />
                }
                columns={[
                    {
                        name: "username",
                        displayKey: "userName",
                        cellFormatters: [emptyFormatter()]
                    },
                    {
                        name: "email",
                        displayKey: "email",
                        cellFormatters: [emptyFormatter()]
                    },
                    {
                        name: "lastName",
                        displayKey: "lastName",
                        cellFormatters: [emptyFormatter()]
                    },
                    {
                        name: "firstName",
                        displayKey: "firstName",
                        cellFormatters: [upperCaseFormatter(), emptyFormatter()]
                    }
                ]}
            />
        </section>
    );
};
