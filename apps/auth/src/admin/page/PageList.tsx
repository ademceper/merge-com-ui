import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { ComponentQuery } from "@keycloak/keycloak-admin-client/lib/resources/components";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { get } from "lodash-es";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
    type Row
} from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { PAGE_PROVIDER } from "./constants";
import { addDetailPage, PageListParams, toDetailPage } from "./routes";

export default function PageList() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { providerId } = useParams<PageListParams>();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(k => k + 1);
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const [selectedItem, setSelectedItem] = useState<ComponentRepresentation>();
    const { componentTypes } = useServerInfo();
    const pages = componentTypes?.[PAGE_PROVIDER];
    const page = pages?.find(p => p.id === providerId)!;

    const [components, setComponents] = useState<ComponentRepresentation[]>([]);
    useFetch(
        () => adminClient.components.find({ parent: realm?.id, type: PAGE_PROVIDER } as ComponentQuery),
        setComponents,
        [key, realm?.id]
    );

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
                toast.error(t("itemSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const displayNames = page?.metadata?.displayFields ?? page?.properties?.slice(0, 3).map(p => p.name) ?? [];
    const columns: ColumnDef<ComponentRepresentation>[] = useMemo(() => {
        if (!page) return [];
        return displayNames.map((name: string, index: number) => {
            const label = page.properties.find(p => p.name === name)?.label ?? name;
            const path = `config.${name}[0]`;
            return {
                accessorKey: path,
                header: label,
                cell: ({ row }: { row: Row<ComponentRepresentation> }) => {
                    const value = get(row.original, path);
                    if (index === 0) {
                        return (
                            <Link to={toDetailPage({ realm: realmName!, providerId: page.id, id: row.original.id! })} className="text-primary hover:underline">
                                {value ?? "-"}
                            </Link>
                        );
                    }
                    return value ?? "-";
                }
            };
        }).concat({
            id: "actions",
            header: "",
            size: 50,
            enableHiding: false,
            cell: ({ row }: { row: Row<ComponentRepresentation> }) => (
                <DataTableRowActions row={row}>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => { setSelectedItem(row.original); toggleDeleteDialog(); }}
                    >
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            )
        });
    }, [page, realmName, displayNames, toggleDeleteDialog]);

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("noItems")}</EmptyTitle></EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("noItemsInstructions")}</EmptyDescription>
                <Button variant="default" onClick={() => navigate(addDetailPage({ realm: realmName!, providerId: page?.id! }))}>
                    {t("createItem")}
                </Button>
            </EmptyContent>
        </Empty>
    );

    if (!page) return null;

    return (
        <div className="p-0">
            <DeleteConfirm />
            <ViewHeader titleKey={page.id} subKey={page.helpText} divider={false} />
            <DataTable<ComponentRepresentation>
                key={key}
                columns={columns}
                data={components}
                searchColumnId={displayNames[0] ? `config.${displayNames[0]}[0]` : undefined}
                searchPlaceholder={t("searchItem")}
                emptyContent={emptyContent}
                emptyMessage={t("noItems")}
                toolbar={
                    <Button asChild>
                        <Link to={addDetailPage({ realm: realmName!, providerId: page.id })}>
                            {t("createItem")}
                        </Link>
                    </Button>
                }
            />
        </div>
    );
}
