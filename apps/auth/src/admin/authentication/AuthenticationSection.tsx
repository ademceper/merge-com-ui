import { fetchWithError } from "@keycloak/keycloak-admin-client";
import { getErrorDescription, getErrorMessage, KeycloakDataTable,
    KeycloakSpinner,
    ListEmptyState } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
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
    const { tab } = useParams<{ tab?: string }>();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
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
                toast.success(t("deleteFlowSuccess"));
            } catch (error) {
                toast.error(t("deleteFlowError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    if (!realm) return <KeycloakSpinner />;

    const renderContent = () => {
        switch (tab) {
            case "required-actions":
                return <RequiredActions />;
            case "policies":
                return <Policies />;
            default:
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
                        <KeycloakDataTable
                            key={key}
                            loader={loader}
                            ariaLabelKey="titleAuthentication"
                            searchPlaceholderKey="searchForFlow"
                            toolbarItem={
                                <div>
                                    <Button asChild>
                                        <Link to={toCreateFlow({ realm: realmName })}>
                                            {t("createFlow")}
                                        </Link>
                                    </Button>
                                </div>
                            }
                            actionResolver={row => {
                                const data = row.data as AuthenticationType;
                                return [
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
                                ];
                            }}
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
                    </>
                );
        }
    };

    return (
        <>
            <ViewHeader
                titleKey="titleAuthentication"
                subKey="authenticationExplain"
                helpUrl={helpUrls.authenticationUrl}
                divider={false}
            />
            <div className="p-0">
                {renderContent()}
            </div>
        </>
    );
}
