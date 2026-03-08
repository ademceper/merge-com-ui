import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Link, useNavigate } from "@tanstack/react-router";
import { get } from "lodash-es";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions,
    type Row
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useServerInfo } from "../../app/providers/server-info/server-info-provider";
import { useParams } from "../../shared/lib/useParams";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { usePageComponents } from "./api/use-page-components";
import { PAGE_PROVIDER } from "./constants";
import { addDetailPage, type PageListParams, toDetailPage } from "../../shared/lib/routes/page";

export default function PageList() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { providerId } = useParams<PageListParams>();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const [selectedItem, setSelectedItem] = useState<ComponentRepresentation>();
    const { componentTypes } = useServerInfo();
    const pages = componentTypes?.[PAGE_PROVIDER];
    const page = pages?.find(p => p.id === providerId)!;

    const { data: components = [], refetch: refetchComponents } = usePageComponents(
        realm?.id
    );
    const refresh = () => {
        refetchComponents();
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "itemDeleteConfirmTitle",
        messageKey: "itemDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.components.del({ id: selectedItem!.id! });
                toast.success(t("itemDeletedSuccess"));
                refresh();
            } catch (error) {
                toast.error(t("itemSaveError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const displayNames =
        page?.metadata?.displayFields ??
        page?.properties?.slice(0, 3).map(p => p.name) ??
        [];
    const columns: ColumnDef<ComponentRepresentation>[] = useMemo(() => {
        if (!page) return [];
        return displayNames
            .map((name: string, index: number) => {
                const label = page.properties.find(p => p.name === name)?.label ?? name;
                const path = `config.${name}[0]`;
                return {
                    accessorKey: path,
                    header: label,
                    cell: ({ row }: { row: Row<ComponentRepresentation> }) => {
                        const value = get(row.original, path);
                        if (index === 0) {
                            return (
                                <Link
                                    to={
                                        toDetailPage({
                                            realm: realmName!,
                                            providerId: page.id,
                                            id: row.original.id!
                                        }) as string
                                    }
                                    className="text-primary hover:underline"
                                >
                                    {value ?? "-"}
                                </Link>
                            );
                        }
                        return value ?? "-";
                    }
                };
            })
            .concat({
                id: "actions",
                header: "",
                size: 50,
                enableHiding: false,
                cell: ({ row }: { row: Row<ComponentRepresentation> }) => (
                    <DataTableRowActions row={row}>
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10"
                            onClick={() => {
                                setSelectedItem(row.original);
                                toggleDeleteDialog();
                            }}
                        >
                            {t("delete")}
                        </button>
                    </DataTableRowActions>
                )
            });
    }, [page, realmName, displayNames, toggleDeleteDialog]);

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("noItems")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("noItemsInstructions")}</EmptyDescription>
                <Button
                    variant="default"
                    onClick={() =>
                        navigate({
                            to: addDetailPage({
                                realm: realmName!,
                                providerId: page?.id!
                            }) as string
                        })
                    }
                >
                    {t("createItem")}
                </Button>
            </EmptyContent>
        </Empty>
    );

    if (!page) return null;

    return (
        <div className="p-0">
            <DeleteConfirm />
            <DataTable<ComponentRepresentation>
                columns={columns}
                data={components}
                searchColumnId={
                    displayNames[0] ? `config.${displayNames[0]}[0]` : undefined
                }
                searchPlaceholder={t("searchItem")}
                emptyContent={emptyContent}
                emptyMessage={t("noItems")}
                toolbar={
                    <Button asChild>
                        <Link
                            to={
                                addDetailPage({
                                    realm: realmName!,
                                    providerId: page.id
                                }) as string
                            }
                        >
                            {t("createItem")}
                        </Link>
                    </Button>
                }
            />
        </div>
    );
}
