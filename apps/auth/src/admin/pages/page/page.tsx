import { useTranslation } from "@merge-rd/i18n";
import { buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useServerInfo } from "../../app/providers/server-info/server-info-provider";
import { useParams } from "../../shared/lib/useParams";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { usePageComponent } from "./api/use-page-component";
import { PAGE_PROVIDER } from "./constants";
import { PageHandler } from "./page-handler";
import { type PageParams, toPage } from "../../shared/lib/routes/page";

export default function Page() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { componentTypes } = useServerInfo();
    const { realm } = useRealm();
    const pages = componentTypes?.[PAGE_PROVIDER];
    const navigate = useNavigate();
    const { id, providerId } = useParams<PageParams>();

    const page = pages?.find(p => p.id === providerId);
    if (!page) {
        throw new Error(t("notFound"));
    }

    const { data: pageData } = usePageComponent(id);

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
                navigate({ to: toPage({ realm, providerId: providerId! }) as string });
            } catch (error) {
                toast.error(t("itemSaveError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
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
                            <DropdownMenuTrigger
                                data-testid="action-dropdown"
                                className={buttonVariants()}
                            >
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
