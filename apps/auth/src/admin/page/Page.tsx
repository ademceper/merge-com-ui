import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { get } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import { PageHandler } from "./PageHandler";
import { PAGE_PROVIDER } from "./constants";
import { PageParams, toPage } from "./routes";

export default function Page() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { componentTypes } = useServerInfo();
    const { realm } = useRealm();
    const pages = componentTypes?.[PAGE_PROVIDER];
    const navigate = useNavigate();
    const { id, providerId } = useParams<PageParams>();
const [pageData, setPageData] = useState<ComponentRepresentation>();

    const page = pages?.find(p => p.id === providerId);
    if (!page) {
        throw new Error(t("notFound"));
    }

    useFetch(async () => adminClient.components.findOne({ id: id! }), setPageData, [id]);

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "itemDeleteConfirmTitle",
        messageKey: "itemDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.components.del({
                    id: id!
                });
                toast.success(t("itemDeletedSuccess"));
                navigate(toPage({ realm, providerId: providerId! }));
            } catch (error) {
                toast.error(t("itemSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });
    return (
        <>
            <DeleteConfirm />
            <ViewHeader
                titleKey={
                    get(
                        pageData,
                        `config.${page.metadata.displayFields?.[0] || page.properties[0].name}`
                    )?.[0] || t("createItem")
                }
                dropdownItems={
                    id
                        ? [
                              <DropdownMenuItem
                                  data-testid="delete-item"
                                  key="delete"
                                  onClick={() => toggleDeleteDialog()}
                              >
                                  {t("delete")}
                              </DropdownMenuItem>
                          ]
                        : undefined
                }
            />
            <PageHandler providerType={PAGE_PROVIDER} id={id} page={page} />
        </>
    );
}
