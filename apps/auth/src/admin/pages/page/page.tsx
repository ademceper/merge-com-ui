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
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useDeletePageComponent } from "./hooks/use-delete-page-component";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { type PageParams, toPage } from "@/admin/shared/lib/routes/page";
import { useParams } from "@/admin/shared/lib/use-params";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { usePageComponent } from "./hooks/use-page-component";
import { PAGE_PROVIDER } from "./constants";
import { PageHandler } from "./page-handler";

export function Page() {

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
    const { mutateAsync: deleteComponent } = useDeletePageComponent();

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "itemDeleteConfirmTitle",
        messageKey: "itemDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteComponent(id!);
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
