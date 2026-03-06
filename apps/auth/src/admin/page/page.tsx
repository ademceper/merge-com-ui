import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { buttonVariants } from "@merge-rd/ui/components/button";
import { get } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/confirm-dialog";

import { useRealm } from "../context/realm-context/realm-context";
import { useServerInfo } from "../context/server-info/server-info-provider";
import { PageHandler } from "./page-handler";
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
            {id && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2" />
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    data-testid="delete-item"
                                    key="delete"
                                    onClick={() => toggleDeleteDialog()}
                                >
                                    {t("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            <PageHandler providerType={PAGE_PROVIDER} id={id} page={page} />
        </>
    );
}
