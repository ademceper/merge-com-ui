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
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useLocaleSort, mapByKey } from "@/admin/shared/lib/use-locale-sort";
import { useDeleteComponent } from "@/admin/pages/user-federation/hooks/use-delete-component";
import { useParams } from "@/admin/shared/lib/use-params";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { useLdapMappers } from "@/admin/pages/user-federation/hooks/use-ldap-mappers";

type LdapMapperListProps = {
    toCreate: string;
    toDetail: (mapperId: string) => string;
};

type MapperLinkProps = ComponentRepresentation & {
    toDetail: (mapperId: string) => string;
};

const MapperLink = ({ toDetail, ...mapper }: MapperLinkProps) => (
    <Link to={toDetail(mapper.id!)}>{mapper.name}</Link>
);

export const LdapMapperList = ({ toCreate, toDetail }: LdapMapperListProps) => {

    const { t } = useTranslation();
    const localeSort = useLocaleSort();

    const { id } = useParams<{ id: string }>();

    const [selectedMapper, setSelectedMapper] = useState<ComponentRepresentation>();

    const { data: rawMappers, refetch: refetchMappers } = useLdapMappers(id);
    const { mutateAsync: deleteComponentMut } = useDeleteComponent();
    const refresh = () => {
        refetchMappers();
    };

    const mappers = useMemo(
        () =>
            localeSort(
                (rawMappers || []).map(mapper => ({
                    ...mapper,
                    name: mapper.name,
                    type: mapper.providerId
                })),
                mapByKey("name")
            ),
        [rawMappers, localeSort]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteMappingTitle", { mapperId: selectedMapper?.id }),
        messageKey: "deleteMappingConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteComponentMut(selectedMapper!.id!);
                refresh();
                toast.success(t("mappingDeletedSuccess"));
                setSelectedMapper(undefined);
            } catch (error) {
                toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredMappers = useMemo(() => {
        if (!search) return mappers;
        const lower = search.toLowerCase();
        return mappers.filter(m => m.name?.toLowerCase().includes(lower));
    }, [mappers, search]);

    const totalCount = filteredMappers.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedMappers = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredMappers.slice(start, start + pageSize);
    }, [filteredMappers, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const colSpan = 3;

    return (
        <>
            <DeleteConfirm />
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchForMapper")}
                    />
                    <Button data-testid="add-mapper-btn" asChild>
                        <Link to={toCreate}>{t("addMapper")}</Link>
                    </Button>
                </div>

                {totalCount === 0 && !search ? (
                    <Empty className="py-12">
                        <EmptyHeader>
                            <EmptyTitle>{t("emptyMappers")}</EmptyTitle>
                        </EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>
                                {t("emptyMappersInstructions")}
                            </EmptyDescription>
                        </EmptyContent>
                        <Button className="mt-2" asChild>
                            <Link to={toCreate}>{t("emptyPrimaryAction")}</Link>
                        </Button>
                    </Empty>
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">{t("name")}</TableHead>
                                <TableHead className="w-[50%]">{t("type")}</TableHead>
                                <TableHead className="w-[10%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedMappers.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={colSpan}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("emptyMappers")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedMappers.map(mapper => (
                                    <TableRow key={mapper.id}>
                                        <TableCell className="truncate">
                                            <MapperLink
                                                {...mapper}
                                                toDetail={toDetail}
                                            />
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {mapper.type ?? "-"}
                                        </TableCell>
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
                                                            setSelectedMapper(mapper);
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
        </>
    );
};
