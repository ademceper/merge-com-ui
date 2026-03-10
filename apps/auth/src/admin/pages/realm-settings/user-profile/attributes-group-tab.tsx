import type { UserProfileGroup } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { Trans, useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
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
import { DotsThree, Trash } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import {
    deleteRealmLocalizationTexts,
    fetchRealmLocalizationTexts
} from "@/admin/api/realm-settings";
import {
    toEditAttributesGroup,
    toNewAttributesGroup
} from "@/admin/shared/lib/routes/realm-settings";
import { useLocale } from "@/admin/shared/lib/use-locale";
import { useUserProfile } from "./user-profile-context";

type AttributesGroupTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
};

export const AttributesGroupTab = ({ setTableData }: AttributesGroupTabProps) => {
    const { config, save } = useUserProfile();
    const { t } = useTranslation();
    const combinedLocales = useLocale();
    const { realm } = useRealm();
    const [key, setKey] = useState(0);
    const [groupToDelete, setGroupToDelete] = useState<UserProfileGroup>();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => setKey(value => value + 1), [config]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const data = config?.groups ?? [];

    const filteredData = useMemo(() => {
        if (!search) return data;
        const lower = search.toLowerCase();
        return data.filter(g => g.name?.toLowerCase().includes(lower));
    }, [data, search]);

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const onDeleteConfirm = async () => {
        if (!config || !groupToDelete) return;
        const groups = (config.groups ?? []).filter(group => group !== groupToDelete);
        const translationsForDisplayHeaderToDelete =
            groupToDelete.displayHeader?.substring(
                2,
                groupToDelete.displayHeader.length - 1
            );
        const translationsForDisplayDescriptionToDelete =
            groupToDelete.displayDescription?.substring(
                2,
                groupToDelete.displayDescription.length - 1
            );

        try {
            await Promise.all(
                combinedLocales.map(async locale => {
                    try {
                        await fetchRealmLocalizationTexts(realm, locale);

                        if (translationsForDisplayHeaderToDelete) {
                            await deleteRealmLocalizationTexts(
                                realm,
                                locale,
                                translationsForDisplayHeaderToDelete
                            );
                        }
                        if (translationsForDisplayDescriptionToDelete) {
                            await deleteRealmLocalizationTexts(
                                realm,
                                locale,
                                translationsForDisplayDescriptionToDelete
                            );
                        }

                        const updatedData =
                            await fetchRealmLocalizationTexts(realm, locale);
                        setTableData([updatedData]);
                    } catch {
                        console.error(`Error removing translations for ${locale}`);
                    }
                })
            );

            await save(
                { ...config!, groups },
                {
                    successMessageKey: "deleteSuccess",
                    errorMessageKey: "deleteAttributeGroupError"
                }
            );
            setGroupToDelete(undefined);
        } catch (error) {
            console.error(
                `Error removing translations or updating attributes group: ${error}`
            );
        }
    };

    return (
        <>
            <AlertDialog
                open={!!groupToDelete}
                onOpenChange={open => !open && setGroupToDelete(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteDialogTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            <Trans i18nKey="deleteDialogDescription">
                                {" "}
                                <strong>{{ group: groupToDelete?.name }}</strong>.
                            </Trans>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-4">
                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchAttributes")}
                        />
                        <Button
                            data-testid="create-attributes-groups-action"
                            asChild
                            variant="default"
                            className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                        >
                            <Link to={toNewAttributesGroup({ realm }) as string}>
                                {t("createGroupText")}
                            </Link>
                        </Button>
                    </div>

                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">{t("columnName")}</TableHead>
                                <TableHead className="w-[30%]">{t("columnDisplayName")}</TableHead>
                                <TableHead className="w-[30%]">{t("columnDisplayDescription")}</TableHead>
                                <TableHead className="w-[10%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("emptyStateMessage")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map(group => (
                                    <TableRow key={group.name}>
                                        <TableCell className="truncate">
                                            <Link
                                                to={
                                                    toEditAttributesGroup({
                                                        realm,
                                                        name: group.name!
                                                    }) as string
                                                }
                                                className="text-primary hover:underline"
                                            >
                                                {group.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {group.displayHeader ?? "-"}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {group.displayDescription ?? "-"}
                                        </TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
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
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setGroupToDelete(group)}
                                                    >
                                                        <Trash className="size-4" />
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
                                <TableCell colSpan={4} className="p-0">
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
        </>
    );
};
