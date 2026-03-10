import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { DotsThree, DotsThreeVertical } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useClientAssignedScopes } from "../hooks/use-client-assigned-scopes";

const RouterLink = Link as ComponentType<LinkProps>;

import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toDedicatedScope } from "@/admin/shared/lib/routes/clients";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { useIsFeatureEnabled, Feature } from "@/admin/shared/lib/use-is-feature-enabled";
import { useLocaleSort, mapByKey } from "@/admin/shared/lib/use-locale-sort";
import {
    AllClientScopes,
    type AllClientScopeType,
    addClientScope,
    CellDropdown,
    ClientScope,
    changeClientScope,
    removeClientScope
} from "@/admin/shared/ui/client-scope/client-scope-types";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { ChangeTypeDropdown } from "@/admin/pages/client-scopes/change-type-dropdown";
import { PROTOCOL_OID4VC, PROTOCOL_OIDC } from "../constants";
import { AddScopeDialog } from "./add-scope-dialog";

type ClientScopesProps = {
    clientId: string;
    protocol: string;
    clientName: string;
    fineGrainedAccess?: boolean;
};

export type Row = ClientScopeRepresentation & {
    type: AllClientScopeType;
    description?: string;
};

const DEDICATED_ROW = "dedicated";

type TypeSelectorProps = Row & {
    clientId: string;
    fineGrainedAccess?: boolean;
    refresh: () => void;
};

const TypeSelector = ({
    clientId,
    refresh,
    fineGrainedAccess,
    ...scope
}: TypeSelectorProps) => {

    const { t } = useTranslation();
    const { hasAccess } = useAccess();

    const isDedicatedRow = (value: Row) => value.id === DEDICATED_ROW;
    const isManager = hasAccess("manage-clients") || fineGrainedAccess;

    return (
        <CellDropdown
            isDisabled={isDedicatedRow(scope) || !isManager}
            clientScope={scope}
            type={scope.type}
            onSelect={async value => {
                try {
                    await changeClientScope(
                        clientId,
                        scope,
                        scope.type,
                        value as ClientScope
                    );
                    toast.success(t("clientScopeSuccess"));
                    refresh();
                } catch (error) {
                    toast.error(
                        t("clientScopeError", { error: getErrorMessage(error) }),
                        { description: getErrorDescription(error) }
                    );
                }
            }}
        />
    );
};

export const ClientScopes = ({
    clientId,
    protocol,
    clientName,
    fineGrainedAccess
}: ClientScopesProps) => {
    const isFeatureEnabled = useIsFeatureEnabled();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const localeSort = useLocaleSort();

    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const [rows, setRows] = useState<Row[]>([]);
    const [rest, setRest] = useState<ClientScopeRepresentation[]>();
    const [selectedRows, setSelectedRowState] = useState<Row[]>([]);
    const setSelectedRows = (rows: Row[]) =>
        setSelectedRowState(rows.filter(({ id }) => id !== DEDICATED_ROW));
    const [kebabOpen, setKebabOpen] = useState(false);

    const isDedicatedRow = (value: Row) => value.id === DEDICATED_ROW;

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients") || fineGrainedAccess;
    const isViewer = hasAccess("view-clients") || fineGrainedAccess;

    const { data: assignedScopesData, refetch } = useClientAssignedScopes(clientId);
    const refresh = () => {
        refetch();
    };

    useEffect(() => {
        if (!assignedScopesData) return;
        const { defaultClientScopes, optionalClientScopes, clientScopes } =
            assignedScopesData;

        const find = (id: string) =>
            clientScopes.find(clientScope => id === clientScope.id);

        const optional = optionalClientScopes.map(c => {
            const scope = find(c.id!);
            const row: Row = {
                ...c,
                type: ClientScope.optional,
                description: scope?.description
            };
            return row;
        });

        const defaultScopes = defaultClientScopes.map(c => {
            const scope = find(c.id!);
            const row: Row = {
                ...c,
                type: ClientScope.default,
                description: scope?.description
            };
            return row;
        });

        let resultRows = [...optional, ...defaultScopes];
        const names = resultRows.map(row => row.name);

        const allowedProtocols = (() => {
            if (protocol === PROTOCOL_OIDC) {
                return isFeatureEnabled(Feature.OpenId4VCI)
                    ? [PROTOCOL_OIDC, PROTOCOL_OID4VC]
                    : [PROTOCOL_OIDC];
            }
            return [protocol];
        })();

        const restScopes = clientScopes
            .filter(scope => !names.includes(scope.name))
            .filter(scope => scope.protocol && allowedProtocols.includes(scope.protocol));

        resultRows = localeSort(resultRows, mapByKey("name"));

        if (isViewer) {
            resultRows.unshift({
                id: DEDICATED_ROW,
                name: t("dedicatedScopeName", { clientName }),
                type: AllClientScopes.none,
                description: t("dedicatedScopeDescription")
            });
        }

        setRows(resultRows);
        setRest(restScopes);
    }, [assignedScopesData]);

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteClientScope", {
            count: selectedRows.length,
            name: selectedRows[0]?.name
        }),
        messageKey: "deleteConfirmClientScopes",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await removeClientScope(
                    clientId,
                    selectedRows[0],
                    selectedRows[0].type as ClientScope
                );
                toast.success(t("clientScopeRemoveSuccess"));
                refresh();
            } catch (error) {
                toast.error(
                    t("clientScopeRemoveError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredRows = useMemo(() => {
        if (!search) return rows;
        const lower = search.toLowerCase();
        return rows.filter(r => r.name?.toLowerCase().includes(lower));
    }, [rows, search]);

    const totalCount = filteredRows.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedRows = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const columnCount = 4;

    return (
        <div className="p-6">
            {rest && (
                <AddScopeDialog
                    clientScopes={rest}
                    clientName={clientName!}
                    open={addDialogOpen}
                    toggleDialog={() => setAddDialogOpen(!addDialogOpen)}
                    onAdd={async scopes => {
                        try {
                            await Promise.all(
                                scopes.map(
                                    async scope =>
                                        await addClientScope(
                                            clientId,
                                            scope.scope,
                                            scope.type!
                                        )
                                )
                            );
                            toast.success(t("clientScopeSuccess"));
                            refresh();
                        } catch (error) {
                            toast.error(
                                t("clientScopeError", { error: getErrorMessage(error) }),
                                { description: getErrorDescription(error) }
                            );
                        }
                    }}
                />
            )}
            <DeleteConfirm />
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchByName")}
                    />
                    {isManager && (
                        <div className="flex gap-2">
                            <Button onClick={() => setAddDialogOpen(true)}>
                                {t("addClientScope")}
                            </Button>
                            <ChangeTypeDropdown
                                clientId={clientId}
                                selectedRows={selectedRows}
                                refresh={refresh}
                            />
                            <DropdownMenu open={kebabOpen} onOpenChange={setKebabOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        data-testid="kebab"
                                        aria-label="Kebab toggle"
                                        variant="ghost"
                                        size="icon"
                                    >
                                        <DotsThreeVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        key="deleteAll"
                                        disabled={selectedRows.length === 0}
                                        onClick={async () => {
                                            try {
                                                await Promise.all(
                                                    selectedRows.map(row =>
                                                        removeClientScope(
                                                            clientId,
                                                            { ...row },
                                                            row.type as ClientScope
                                                        )
                                                    )
                                                );

                                                setKebabOpen(false);
                                                setSelectedRows([]);
                                                toast.success(
                                                    t("clientScopeRemoveSuccess")
                                                );
                                                refresh();
                                            } catch (error) {
                                                toast.error(
                                                    t("clientScopeRemoveError", {
                                                        error: getErrorMessage(error)
                                                    }),
                                                    {
                                                        description:
                                                            getErrorDescription(error)
                                                    }
                                                );
                                            }
                                        }}
                                    >
                                        {t("remove")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%]">{t("assignedClientScope")}</TableHead>
                            <TableHead className="w-[20%]">{t("assignedType")}</TableHead>
                            <TableHead className="w-[40%]">{t("description")}</TableHead>
                            <TableHead className="w-[10%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedRows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("emptyClientScopes")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRows.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell className="truncate">
                                        {isDedicatedRow(row) ? (
                                            <RouterLink
                                                className="text-primary hover:underline"
                                                to={toDedicatedScope({ realm, clientId }) as string}
                                            >
                                                {row.name}
                                            </RouterLink>
                                        ) : (
                                            row.name!
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <TypeSelector
                                            clientId={clientId}
                                            refresh={refresh}
                                            fineGrainedAccess={fineGrainedAccess}
                                            {...row}
                                        />
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {(translationFormatter(t)(row.description) as string) || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {!isDedicatedRow(row) && isManager && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm">
                                                        <DotsThree
                                                            weight="bold"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedRows([row]);
                                                            toggleDeleteDialog();
                                                        }}
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        {t("remove")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={columnCount} className="p-0">
                                <TablePaginationFooter
                                    pageSize={pageSize}
                                    onPageSizeChange={setPageSize}
                                    onPreviousPage={() =>
                                        setCurrentPage(p => Math.max(0, p - 1))
                                    }
                                    onNextPage={() =>
                                        setCurrentPage(p =>
                                            Math.min(totalPages - 1, p + 1)
                                        )
                                    }
                                    hasPreviousPage={currentPage > 0}
                                    hasNextPage={currentPage < totalPages - 1}
                                    totalCount={totalCount}
                                />
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
};
