import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
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
import { DotsThree } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { get } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useDeletePageComponent } from "./hooks/use-delete-page-component";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import {
    addDetailPage,
    type PageListParams,
    toDetailPage
} from "@/admin/shared/lib/routes/page";
import { useParams } from "@/admin/shared/lib/use-params";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { usePageComponents } from "./hooks/use-page-components";
import { PAGE_PROVIDER } from "./constants";

export function PageList() {
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

    const { mutateAsync: deleteComponent } = useDeletePageComponent();

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "itemDeleteConfirmTitle",
        messageKey: "itemDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteComponent(selectedItem!.id!);
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

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredComponents = useMemo(() => {
        if (!search || !displayNames[0]) return components;
        const lower = search.toLowerCase();
        const path = `config.${displayNames[0]}[0]`;
        return components.filter(c => {
            const value = get(c, path);
            return value?.toString().toLowerCase().includes(lower);
        });
    }, [components, search, displayNames]);

    const totalCount = filteredComponents.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedComponents = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredComponents.slice(start, start + pageSize);
    }, [filteredComponents, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    if (!page) return null;

    const colSpan = displayNames.length + 1;

    return (
        <div className="p-0">
            <DeleteConfirm />
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchItem")}
                    />
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
                </div>

                {totalCount === 0 && !search ? (
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
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                {displayNames.map((name: string) => {
                                    const label =
                                        page.properties.find(p => p.name === name)?.label ??
                                        name;
                                    return (
                                        <TableHead key={name}>{label}</TableHead>
                                    );
                                })}
                                <TableHead className="w-[10%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedComponents.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={colSpan}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("noItems")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedComponents.map(component => (
                                    <TableRow key={component.id}>
                                        {displayNames.map(
                                            (name: string, index: number) => {
                                                const path = `config.${name}[0]`;
                                                const value = get(component, path);
                                                return (
                                                    <TableCell
                                                        key={name}
                                                        className="truncate"
                                                    >
                                                        {index === 0 ? (
                                                            <Link
                                                                to={
                                                                    toDetailPage({
                                                                        realm: realmName!,
                                                                        providerId:
                                                                            page.id,
                                                                        id: component.id!
                                                                    }) as string
                                                                }
                                                                className="text-primary hover:underline"
                                                            >
                                                                {value ?? "-"}
                                                            </Link>
                                                        ) : (
                                                            (value ?? "-")
                                                        )}
                                                    </TableCell>
                                                );
                                            }
                                        )}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                    >
                                                        <DotsThree
                                                            weight="bold"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedItem(component);
                                                            toggleDeleteDialog();
                                                        }}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        {t("delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={colSpan} className="p-0">
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
                )}
            </div>
        </div>
    );
}
