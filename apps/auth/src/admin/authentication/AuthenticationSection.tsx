/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/AuthenticationSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { fetchWithError } from "@keycloak/keycloak-admin-client";
import {
    AlertVariant,
    KeycloakDataTable,
    KeycloakSpinner,
    ListEmptyState,
    useAlerts
} from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { RoutableTabs, useRoutableTab, Tab } from "../components/routable-tabs/RoutableTabs";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import { addTrailingSlash } from "../util";
import { getAuthorizationHeaders } from "../utils/getAuthorizationHeaders";
import useLocaleSort, { mapByKey } from "../utils/useLocaleSort";
import useToggle from "../utils/useToggle";
import { BindFlowDialog } from "./BindFlowDialog";
import { DuplicateFlowModal } from "./DuplicateFlowModal";
import { RequiredActions } from "./RequiredActions";
import { UsedBy } from "./components/UsedBy";
import { AuthenticationType } from "./constants";
import { Policies } from "./policies/Policies";
import { AuthenticationTab, toAuthentication } from "./routes/Authentication";
import { toCreateFlow } from "./routes/CreateFlow";
import { toFlow } from "./routes/Flow";

const AliasRenderer = ({ id, alias, usedBy, builtIn }: AuthenticationType) => {
    const { t } = useTranslation();
    const { realm } = useRealm();

    return (
        <>
            <Link
                to={toFlow({
                    realm,
                    id: id!,
                    usedBy: usedBy?.type || "notInUse",
                    builtIn: builtIn ? "builtIn" : undefined
                })}
                key={`link-${id}`}
            >
                {alias}
            </Link>{" "}
            {builtIn && <Label key={`label-${id}`}>{t("buildIn")}</Label>}
        </>
    );
};

export default function AuthenticationSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const { addAlert, addError } = useAlerts();
    const localeSort = useLocaleSort();
    const [selectedFlow, setSelectedFlow] = useState<AuthenticationType>();
    const [open, toggleOpen] = useToggle();
    const [bindFlowOpen, toggleBindFlow] = useToggle();

    const loader = async () => {
        const flowsRequest = await fetchWithError(
            `${addTrailingSlash(
                adminClient.baseUrl
            )}admin/realms/${realmName}/ui-ext/authentication-management/flows`,
            {
                method: "GET",
                headers: getAuthorizationHeaders(await adminClient.getAccessToken())
            }
        );
        const flows = await flowsRequest.json();

        if (!flows) {
            return [];
        }

        return sortBy(
            localeSort<AuthenticationType>(flows, mapByKey("alias")),
            flow => flow.usedBy?.type
        );
    };

    const useTab = (tab: AuthenticationTab) =>
        useRoutableTab(toAuthentication({ realm: realmName, tab }));

    const flowsTab = useTab("flows");
    const requiredActionsTab = useTab("required-actions");
    const policiesTab = useTab("policies");

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteConfirmFlow",
        children: (
            <Trans i18nKey="deleteConfirmFlowMessage">
                {" "}
                <strong>{{ flow: selectedFlow ? selectedFlow.alias : "" }}</strong>.
            </Trans>
        ),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.authenticationManagement.deleteFlow({
                    flowId: selectedFlow!.id!
                });
                refresh();
                addAlert(t("deleteFlowSuccess"), AlertVariant.success);
            } catch (error) {
                addError("deleteFlowError", error);
            }
        }
    });

    if (!realm) return <KeycloakSpinner />;

    return (
        <>
            <DeleteConfirm />
            {open && selectedFlow && (
                <DuplicateFlowModal
                    name={selectedFlow.alias!}
                    description={selectedFlow.description!}
                    toggleDialog={toggleOpen}
                    onComplete={() => {
                        refresh();
                        toggleOpen();
                    }}
                />
            )}
            {bindFlowOpen && (
                <BindFlowDialog
                    onClose={() => {
                        toggleBindFlow();
                        refresh();
                    }}
                    flowAlias={selectedFlow?.alias!}
                />
            )}
            <ViewHeader
                titleKey="titleAuthentication"
                subKey="authenticationExplain"
                helpUrl={helpUrls.authenticationUrl}
                divider={false}
            />
            <div className="p-0">
                <RoutableTabs
                    isBox
                    defaultLocation={toAuthentication({ realm: realmName, tab: "flows" })}
                >
                    <Tab
                        data-testid="flows"
                        title={<span>{t("flows")}</span>}
                        {...flowsTab}
                    >
                        <KeycloakDataTable
                            key={key}
                            loader={loader}
                            ariaLabelKey="titleAuthentication"
                            searchPlaceholderKey="searchForFlow"
                            toolbarItem={
                                <div>
                                    <Button
                                        component={props => (
                                            <Link
                                                {...props}
                                                to={toCreateFlow({ realm: realmName })}
                                            />
                                        )}
                                    >
                                        {t("createFlow")}
                                    </Button>
                                </div>
                            }
                            actionResolver={({ data }) => [
                                {
                                    title: t("duplicate"),
                                    onClick: () => {
                                        toggleOpen();
                                        setSelectedFlow(data);
                                    }
                                },
                                ...(data.usedBy?.type !== "DEFAULT"
                                    ? [
                                          {
                                              title: t("bindFlow"),
                                              onClick: () => {
                                                  toggleBindFlow();
                                                  setSelectedFlow(data);
                                              }
                                          }
                                      ]
                                    : []),
                                ...(!data.builtIn && !data.usedBy
                                    ? [
                                          {
                                              title: t("delete"),
                                              onClick: () => {
                                                  setSelectedFlow(data);
                                                  toggleDeleteDialog();
                                              }
                                          }
                                      ]
                                    : [])
                            ]}
                            columns={[
                                {
                                    name: "alias",
                                    displayKey: "flowName",
                                    cellRenderer: row => <AliasRenderer {...row} />
                                },
                                {
                                    name: "usedBy",
                                    displayKey: "usedBy",
                                    cellRenderer: row => <UsedBy authType={row} />
                                },
                                {
                                    name: "description",
                                    displayKey: "description"
                                }
                            ]}
                            emptyState={
                                <ListEmptyState
                                    message={t("emptyEvents")}
                                    instructions={t("emptyEventsInstructions")}
                                />
                            }
                        />
                    </Tab>
                    <Tab
                        data-testid="requiredActions"
                        title={<span>{t("requiredActions")}</span>}
                        {...requiredActionsTab}
                    >
                        <RequiredActions />
                    </Tab>
                    <Tab
                        data-testid="policies"
                        title={<span>{t("policies")}</span>}
                        {...policiesTab}
                    >
                        <Policies />
                    </Tab>
                </RoutableTabs>
            </div>
        </>
    );
}
